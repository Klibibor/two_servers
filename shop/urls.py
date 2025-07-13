from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProizvodViewSet, GrupaProizvodaViewSet
from .views import MeAPIView

router = DefaultRouter()
router.register(r'proizvodi', ProizvodViewSet)
router.register(r'grupe', GrupaProizvodaViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path("api/me/", MeAPIView.as_view()), 

]