
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from shop.views import (
    ProizvodViewSet,
    GrupaProizvodaViewSet,
    KorisnikViewSet
)
from api.views.auth import MeAPIView, APITokenObtainPairView

router = DefaultRouter()
router.register(r'proizvodi', ProizvodViewSet)
router.register(r'grupe', GrupaProizvodaViewSet)
router.register(r'korisnici', KorisnikViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('me/', MeAPIView.as_view()),  # /shop/me/
    path('token/', APITokenObtainPairView.as_view()),  # /shop/token/
]
