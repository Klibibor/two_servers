from django.test import TestCase
from rest_framework.test import APIRequestFactory, force_authenticate
from django.contrib.auth.models import User, Group
from rest_framework_simplejwt.tokens import RefreshToken

from api.views.permissions import JWTOrSuperuserPermission, SuperuserOnlyPermission # custom permissions
from api.views.auth import APITokenObtainPairSerializer


class HierarchicalPermissionsTest(TestCase):
    def setUp(self):
        self.factory = APIRequestFactory() # create mock http request
        self.jwt_permission = JWTOrSuperuserPermission() # store custom permission class
        self.superuser_permission = SuperuserOnlyPermission() # store custom permission class
        
        # Create JWT group
        self.jwt_group, _ = Group.objects.get_or_create(name='JWT') # create group
        
        # Create users
        self.jwt_user = User.objects.create_user('jwtuser', password='pass') # create user 
        self.jwt_user.groups.add(self.jwt_group) # add user to jwt group
        
        self.superuser = User.objects.create_superuser('admin', 'admin@example.com', 'pass') # superuser
        
        self.regular_user = User.objects.create_user('regular', password='pass') # regular user

# input method to test token getting for various users
    def get_token_with_claims(self, user): # method to get token
        """Helper to get token with custom claims using our serializer"""
        refresh = APITokenObtainPairSerializer.get_token(user) # get token function
        return str(refresh.access_token)
# output should return access token if user has permission

# input test method for permission of jwt group member
    def test_jwt_permission_allows_jwt_group_member(self):
        """JWT group members should access JWT-protected resources"""
        access = self.get_token_with_claims(self.jwt_user)
        req = self.factory.post('/dummy', HTTP_AUTHORIZATION=f'Bearer {access}')
        self.assertTrue(self.jwt_permission.has_permission(req, None))
# output because user is in JWT group it should return true 
 
# input test method for permission of superuser
    def test_jwt_permission_allows_superuser(self):
        """Superusers should inherit ALL JWT group rights"""
        access = self.get_token_with_claims(self.superuser)
        req = self.factory.post('/dummy', HTTP_AUTHORIZATION=f'Bearer {access}')
        self.assertTrue(self.jwt_permission.has_permission(req, None))
# output because user is superuser it should return true

# input test method for permission of regular user
    def test_jwt_permission_denies_regular_user(self):
        """Regular users (not in JWT group, not superuser) should be denied"""
        access = self.get_token_with_claims(self.regular_user)
        req = self.factory.post('/dummy', HTTP_AUTHORIZATION=f'Bearer {access}')
        self.assertFalse(self.jwt_permission.has_permission(req, None))
# output because user is regular user it should return false

# input test method for permission of superuser
    def test_superuser_permission_allows_only_superuser(self):
        """Only superusers should access superuser-only resources"""
        access = self.get_token_with_claims(self.superuser)
        req = self.factory.post('/dummy', HTTP_AUTHORIZATION=f'Bearer {access}')
        self.assertTrue(self.superuser_permission.has_permission(req, None))
# output because user is superuser it should return true

# input test method for permission of jwt group member
    def test_superuser_permission_denies_jwt_user(self):
        """JWT group members should NOT access superuser-only resources"""
        access = self.get_token_with_claims(self.jwt_user)
        req = self.factory.post('/dummy', HTTP_AUTHORIZATION=f'Bearer {access}')
        self.assertFalse(self.superuser_permission.has_permission(req, None))
# output because user is in JWT group it should return false

# input test method for safe methods
    def test_safe_methods_always_allowed(self):
        """GET, HEAD, OPTIONS should always be allowed"""
        req = self.factory.get('/dummy')
        self.assertTrue(self.jwt_permission.has_permission(req, None))
        self.assertTrue(self.superuser_permission.has_permission(req, None))
# output because safe methods are allowed it should return true


# input test method for token claims
    def test_token_claims_read_correctly(self):
        """Verify that permissions read from token claims, not DB"""
        # Create token with custom claims
        access = self.get_token_with_claims(self.superuser)
        req = self.factory.post('/dummy', HTTP_AUTHORIZATION=f'Bearer {access}')
        
        # Both permissions should work with superuser token
        self.assertTrue(self.jwt_permission.has_permission(req, None))
        self.assertTrue(self.superuser_permission.has_permission(req, None))
# output should return true because user is superuser