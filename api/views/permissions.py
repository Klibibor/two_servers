# Role-based permission classes for scalable access control

from rest_framework.permissions import BasePermission, SAFE_METHODS
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.request import Request as DRFRequest

# input BasePermission and function has_permission
class ReadOnlyPermission(BasePermission):
    """
    Base read-only permission class.
    Allows all users to perform SAFE_METHODS only (GET, HEAD, OPTIONS).
    No authentication required for read operations.
    Denies all write operations (POST, PUT, PATCH, DELETE).
    Other permission classes can inherit from this for consistent read access.
    """
    def has_permission(self, request, view):
        return request.method in SAFE_METHODS
# output class that allows SAFE_METHODS

# input BasePermission and functions has_permission + authenticate
class JWTUserPermission(ReadOnlyPermission):
    """
    Inherits read-only access from ReadOnlyPermission.
    Additionally allows write operations for users with valid JWT token AND membership in 'JWT' group.
    Allows full CRUD operations for JWT group members.
    Does NOT include superuser logic - purely JWT group based.
    """
    def has_permission(self, request, view):
        print(f"JWTUserPermission: Method={request.method}, Path={request.path}")
        
        # Use parent class for read operations (includes SAFE_METHODS check)
        if super().has_permission(request, view):
            print("Read operation allowed by ReadOnlyPermission")
            return True

        # input check for Bearer + JWT token
        try:
            auth_result = JWTAuthentication().authenticate(request)
        except Exception as e:
            print(f"error Authentication failed: {e}")
            return False

        if not auth_result:
            print("error No Authentication result")
            return False
        # 1. error if no token or nothing returned
            
        user, validated_token = auth_result
        print(f"Auth result = {auth_result}")
        if not (user and user.is_authenticated):
            print("error User not authenticated")
            return False
        # 2. error if user in authenticated users

        print(f"success: User={user.username}, Token exists={bool(validated_token)}")
        # 3. success if user authenticated and token exists

        # Check payload groups key-value pair
        try:
            token_groups = validated_token.get('groups') or validated_token.payload.get('groups', [])
            print(f"from token payload: Token groups = {token_groups}")

            if token_groups:
                result = 'JWT' in token_groups
                print(f"Stateless check result = {result}, Source = token")
                return result

            # Fallback to DB
            db_result = user.groups.filter(name='JWT').exists()
            print(f"from django DB user.groups: Groups check = {db_result}, Source = db")
            return db_result

        except Exception as e:
            print(f"in group check: {e}")
            db_result = user.groups.filter(name='JWT').exists()
            print(f"DB groups check after exception = {db_result}, Source = db (fallback)")
            return db_result

class SuperuserPermission(ReadOnlyPermission):
    """
    Inherits read-only access from ReadOnlyPermission.
    Additionally allows write operations for superusers only.
    Requires valid JWT token AND superuser status for write operations.
    """
    def has_permission(self, request, view):
        print(f"SuperuserPermission: Method={request.method}, Path={request.path}")
        
        # Use parent class for read operations (includes SAFE_METHODS check)
        if super().has_permission(request, view):
            print("Read operation allowed by ReadOnlyPermission")
            return True

        # input check for Bearer + JWT token
        try:
            auth_result = JWTAuthentication().authenticate(request)
        except Exception as e:
            print(f"error Authentication failed: {e}")
            return False

        if not auth_result:
            print("error No Authentication result")
            return False
        # 1. error if no token or nothing returned
            
        user, validated_token = auth_result
        print(f"Auth result = {auth_result}")
        if not (user and user.is_authenticated):
            print("error User not authenticated")
            return False
        # 2. error if user in authenticated users

        print(f"success: User={user.username}, Token exists={bool(validated_token)}")
        # 3. success if user authenticated and token exists

        # Check for superuser status (from token payload)
        try:
            is_superuser = validated_token.get('is_superuser') or validated_token.payload.get('is_superuser', False)
            print(f"from token payload: is_superuser = {is_superuser}")
            
            if is_superuser:
                print(f"Superuser access granted from token payload")
                return True
                
            # Fallback to DB superuser check
            db_superuser = user.is_superuser
            print(f"from django DB: is_superuser = {db_superuser}")
            return db_superuser

        except Exception as e:
            print(f"in superuser check: {e}")
            db_superuser = user.is_superuser
            print(f"DB superuser check after exception = {db_superuser}")
            return db_superuser
        
