# Role-based permission classes for scalable access control

from rest_framework.permissions import BasePermission, SAFE_METHODS
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.request import Request as DRFRequest

# input BasePermission and function has_permission
class AnonymousReadOnlyPermission(BasePermission):
    """
    Allows anonymous users to perform SAFE_METHODS only (GET, HEAD, OPTIONS).
    No authentication required for read operations.
    Denies all write operations (POST, PUT, PATCH, DELETE).
    """
    def has_permission(self, request, view):
        return request.method in SAFE_METHODS
# output class that allows SAFE_METHODS

# input BasePermission and functions has_permission + authenticate
class JWTUserPermission(BasePermission):
    """
    Requires valid JWT token AND membership in 'JWT' group.
    Allows full CRUD operations for JWT group members.
    Does NOT include superuser logic - purely JWT group based.
    """
    def has_permission(self, request, view):
        print(f"DEBUG JWTUserPermission: Method={request.method}, Path={request.path}")
        if request.method in SAFE_METHODS:
            print("DEBUG JWTUserPermission: SAFE_METHODS - returning True")
            return True

        # input Bearer + JWT token
        try:
            auth_result = JWTAuthentication().authenticate(request)
        except Exception as e:
            print(f"DEBUG JWTUserPermission: Authentication failed: {e}")
            return False
        # output user + decoded token with payload
        if not auth_result:
            print("DEBUG JWTUserPermission: No auth result")
            return False
             
        user, validated_token = auth_result
        print(f"DEBUG JWTUserPermission: Auth result = {auth_result}")
        if not (user and user.is_authenticated):
            print("DEBUG JWTUserPermission: User not authenticated")
            return False
        # looks for user in authenticated users

        print(f"DEBUG JWTUserPermission: User={user.username}, Token exists={bool(validated_token)}")

        # Check payload groups key-value pair
        try:
            token_groups = []
            if validated_token:
                token_groups = validated_token.get('groups') or validated_token.payload.get('groups', [])
                
            print(f"DEBUG JWTUserPermission: Token groups = {token_groups}")
                
            # If token contains groups, prefer stateless check
            if token_groups:
                result = 'JWT' in token_groups
                print(f"DEBUG JWTUserPermission: Stateless check result = {result}")
                return result
                
            # Fallback to DB check for tokens without custom claims
            db_result = user.groups.filter(name='JWT').exists()
            print(f"DEBUG JWTUserPermission: DB groups check = {db_result}")
            return db_result
        except Exception as e:
            print(f"DEBUG JWTUserPermission: Exception in groups check: {e}")
            # Last resort DB check
            return user.groups.filter(name='JWT').exists()
        # output True if user in JWT group, else False

class SuperuserPermission(BasePermission):
    """
    Allows full access to superusers only.
    Requires valid JWT token AND superuser status.
    """
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True

        # input Bearer + JWT token
        try:
            auth_result = JWTAuthentication().authenticate(request)
        except Exception:
            return False
        # output user + decoded token with payload
        
        if not auth_result:
            return False
            
        user, validated_token = auth_result
        if not (user and user.is_authenticated):
            return False
            
        # Check superuser status from token claims (preferred)
        try:
            token_is_superuser = False
            if validated_token:
                token_is_superuser = validated_token.get('is_superuser') or validated_token.payload.get('is_superuser', False)
            
            # If token says superuser, accept
            if token_is_superuser:
                return True
        except Exception:
            pass
            
        # Fallback: check DB
        return user.is_superuser
