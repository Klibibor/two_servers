from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from shop.models import ProductGroup, Product
from api.serializers.users import UserSerializer
from api.serializers.products import ProductSerializer
from api.serializers.groups import ProductGroupSerializer

User = get_user_model()


class ApiSerializersTestCase(TestCase):
    def test_user_serializer_create_hashes_password(self):
        # input mock login with password
        data = {'username': 'u1', 'email': 'u1@example.com', 'password': 'pw'}
        s = UserSerializer(data=data)
        self.assertTrue(s.is_valid())
        user = s.save()
        self.assertNotEqual(user.password, 'pw')
        self.assertTrue(user.check_password('pw')) # check_password is a method that verifies the hashed password
        # output should be password protected with hashing

    def test_product_serializer_fields(self):
        # input new group and product that are serialized
        g = ProductGroup.objects.create(name='g')
        p = Product.objects.create(name='p', description='o', price='1.00', group=g)
        s = ProductSerializer(p)
        data = s.data
        self.assertIn('name', data)
        self.assertIn('group_name', data)
        # output should show that data matches the value in JSON key-value pairs

    def test_group_serializer_includes_products(self):

        g = ProductGroup.objects.create(name='gg')
        p = Product.objects.create(name='pp', description='o', price='1.00', group=g)
        s = ProductGroupSerializer(g)
        self.assertIn('products', s.data)


class ApiViewsTestCase(TestCase):
    def setUp(self):
        # input mock of APIClient
        self.client = APIClient()
        self.user = User.objects.create_user(username='apitest', password='pw')
        self.admin = User.objects.create_superuser(username='admin', password='pw')
        self.group = ProductGroup.objects.create(name='G1')
        self.product = Product.objects.create(name='P1', description='o', price='1.00', group=self.group)

    def test_login_and_me(self):
        # input mock user with token
        token = str(RefreshToken.for_user(self.user).access_token)
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + token)
        resp = self.client.get('/api/auth/me/')
        self.assertEqual(resp.status_code, 200)
        # output should include user information

    def test_admin_can_create_user(self):
        # input mock admin user with token
        token = str(RefreshToken.for_user(self.admin).access_token)
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + token)
        resp = self.client.post('/api/users/', {'username': 'newu2', 'email': 'new2@e.com', 'password': 'pw'})
        self.assertEqual(resp.status_code, 201)
        # output new user is created

