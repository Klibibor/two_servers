from django.test import TestCase
from shop.models import ProductGroup, Product
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from unittest.mock import patch

User = get_user_model()

#MODEL TESTS
class ShopModelsTestCase(TestCase):
    # input new row in ProductGroup
    def test_group_model(self):
        g = ProductGroup.objects.create(naziv='Test')
        self.assertEqual(str(g), 'Test')
    # output confirmed new row

    def test_product_model_without_group(self):
        # input new row in Product without a group column
        p = Product.objects.create(naziv='P', opis='o', cena='1.23')
        self.assertIn('Bez grupe', str(p))
        # output confirmed new row and auto-fill group ~ "Bez grupe"

    def test_product_model_with_group(self):
        # input new row in Product with a group column
        g = ProductGroup.objects.create(naziv='G')
        p = Product.objects.create(naziv='P', opis='o', cena='1.23', grupa=g)
        self.assertIn('G', str(p))
        # output confirmed new row + group name

class ShopViewsTestCase(TestCase):
    def setUp(self):
        # create a database row for testing
        self.group = ProductGroup.objects.create(naziv='G1')
        self.product = Product.objects.create(naziv='P1', opis='o', cena='1.00', grupa=self.group)
        # test user for authenticated requests
        self.user = User.objects.create_user(username='testuser', email='test@example.com', password='testpass')
        self.user.is_superuser = True
        self.user.save()
        
        # Add user to JWT group since JWTUserPermission requires it
        from django.contrib.auth.models import Group
        jwt_group, _ = Group.objects.get_or_create(name='JWT')
        self.user.groups.add(jwt_group)
        
        # use DRF test client for easier JWT header handling
        self.client = APIClient()

    def test_products_list(self):
        # input request for product list
        resp = self.client.get('/api/products/')
        # list should be accessible (ReadOnly permitted for anonymous)
        self.assertIn(resp.status_code, [200, 204])
        # output list of products (if any)

    
    def test_product_detail(self):
        # input request for product detail of row that is created in setUp
        resp = self.client.get(f'/api/products/{self.product.id}/')
        self.assertEqual(resp.status_code, 200)
        # output product details if created product exists

    def test_groups_list(self):
        # input request for product groups list
        resp = self.client.get('/api/groups/')
        self.assertIn(resp.status_code, [200, 204])
        self.assertContains(resp, 'G1')
        # output list of groups (if any) + group that is created in setUp


    def test_create_product_requires_auth(self):
        # input request for creating a new product without JWT or superuser
        data = {'naziv': 'X', 'opis': 'x', 'cena': '2.00', 'grupa': self.group.id}
        resp = self.client.post('/api/products/', data)
        # should be unauthorized / forbidden without proper JWT/group
        self.assertIn(resp.status_code, [401, 403])
        # output error message if unauthorized

    def test_create_product_with_auth(self):
        # input request for creating a new product with JWT
        # older approach using session login won't exercise JWT-protected endpoints reliably
        # We'll demonstrate two approaches below in separate tests.
        data = {'naziv': 'X', 'opis': 'x', 'cena': '2.00', 'grupa': self.group.id}
        resp = self.client.post('/api/products/', data)
        # should still be unauthorized since no auth provided
        self.assertIn(resp.status_code, [401, 403])

    def test_create_product_with_real_jwt(self):
        # Generate a real JWT for the test user and call the endpoint
        token = str(RefreshToken.for_user(self.user).access_token)
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + token)
        data = {'naziv': 'X', 'opis': 'x', 'cena': '2.00', 'grupa': self.group.id}
        resp = self.client.post('/api/products/', data)
        self.assertEqual(resp.status_code, 201)

    def test_create_product_with_mocked_jwt(self):
        # Faster unit test: mock the JWTAuthentication.authenticate to return our test user
        data = {'naziv': 'M', 'opis': 'm', 'cena': '3.00', 'grupa': self.group.id}
        with patch('rest_framework_simplejwt.authentication.JWTAuthentication.authenticate') as mock_auth:
            # Return (user, token) as the real method would
            mock_auth.return_value = (self.user, None)
            resp = self.client.post('/api/products/', data)
        self.assertEqual(resp.status_code, 201)
        # output success message if authorized

    def test_non_admin_jwt_cannot_create_user(self):
        # create a regular (non-admin) user and generate JWT
        regular = User.objects.create_user(username='regular', password='rpass')
        token = str(RefreshToken.for_user(regular).access_token)
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + token)
        data = {'username': 'newuser', 'email': 'n@e.com', 'password': 'pw'}
        resp = self.client.post('/api/users/', data)
        # non-admin authenticated user should not be allowed to create users
        self.assertIn(resp.status_code, [401, 403])
