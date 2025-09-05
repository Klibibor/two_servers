from django.test import TestCase
from rest_framework.test import APIRequestFactory, force_authenticate
from django.contrib.auth.models import User, Group
from rest_framework_simplejwt.tokens import RefreshToken

from api.views.auth import ReadOnlyOrJWT


class ReadOnlyOrJWTTest(TestCase):
    def setUp(self):
        self.factory = APIRequestFactory()
        self.permission = ReadOnlyOrJWT()
        self.group, _ = Group.objects.get_or_create(name='JWT')
        # regular user in JWT group
        self.user = User.objects.create_user('jwtuser', password='pass')
        self.user.groups.add(self.group)
        # superuser
        self.superuser = User.objects.create_superuser('admin', 'admin@example.com', 'pass')

    def test_allows_safe_methods(self):
        req = self.factory.get('/dummy')
        self.assertTrue(self.permission.has_permission(req, None))

    def test_allows_with_valid_jwt(self):
        refresh = RefreshToken.for_user(self.user)
        access = str(refresh.access_token)
        req = self.factory.post('/dummy', HTTP_AUTHORIZATION=f'Bearer {access}')
        self.assertTrue(self.permission.has_permission(req, None))

    def test_allows_session_superuser(self):
        req = self.factory.post('/dummy')
        force_authenticate(req, user=self.superuser)
        self.assertTrue(self.permission.has_permission(req, None))

    def test_denies_without_auth(self):
        req = self.factory.post('/dummy')
        self.assertFalse(self.permission.has_permission(req, None))
