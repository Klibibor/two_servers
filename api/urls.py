from django.urls import path, include
from rest_framework.routers import DefaultRouter

from api.views.proizvodi import ProizvodViewSet
from api.views.grupe import  GrupaProizvodaViewSet
from api.views.korisnici import KorisnikViewSet
from api.views.auth import MeAPIView

router = DefaultRouter()
router.register(r'proizvodi', ProizvodViewSet)
router.register(r'grupe', GrupaProizvodaViewSet)
router.register(r'korisnici', KorisnikViewSet)

urlpatterns = [
    path('', include(router.urls)),          # ← ovo je ispravno
    path('me/', MeAPIView.as_view()),        # ← bez dodatnog 'api/'
]
