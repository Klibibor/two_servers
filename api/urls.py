
from django.urls import path, include
from api.views.auth import MeAPIView, APITokenObtainPairView, LogoutView, LoginView, CookieTokenRefreshView
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
# input shop urls, and api urls
    path('', include('shop.urls')),
    # auth endpoints expected by frontend
    path('auth/me/', MeAPIView.as_view()),        # /api/auth/me/
    # session-based login
    path('auth/login/', LoginView.as_view()),
    # JWT token issuance (credential-based)
    path('auth/token/', APITokenObtainPairView.as_view()),
    # JWT token refresh (extend access token lifetime)
    path('auth/token/refresh/', CookieTokenRefreshView.as_view()),
    path('logout/', LogoutView.as_view()),
]
# output auth, and shop endpoints