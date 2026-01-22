from django.test import TestCase


class UrlsSmokeTest(TestCase):
    def test_admin_url(self):
        response = self.client.get('/admin/')
        self.assertIn(response.status_code, [200, 302])

    def test_api_me_url(self):
        # current auth/me endpoint is under /api/auth/me/
        response = self.client.get('/api/auth/me/')
        self.assertIn(response.status_code, [200, 401, 403, 404])

    def test_products_url(self):
        # shop endpoints are included under /api/ -> so products list is /api/products/
        response = self.client.get('/api/products/')
        self.assertIn(response.status_code, [200, 401, 403, 404])

    def test_swagger_url(self):
        response = self.client.get('/swagger/')
        self.assertEqual(response.status_code, 200)

    def test_redoc_url(self):
        response = self.client.get('/redoc/')
        self.assertEqual(response.status_code, 200)