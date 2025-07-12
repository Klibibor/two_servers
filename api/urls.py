from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LoginAPIView, UserViewSet

router = DefaultRouter()
router.register(r'korisnici', UserViewSet)


urlpatterns = [
    path('login/', LoginAPIView.as_view(), name='login-api'),
    path('', include(router.urls)),
]
