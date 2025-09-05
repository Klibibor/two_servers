
from django.urls import path, include
from rest_framework.routers import DefaultRouter

# routed from backend/views.py

from shop.views import (
    ProductViewSet,
    ProductGroupViewSet,
    KorisnikViewSet
)
# input functions in /shop.views.py, and rout name
router = DefaultRouter()
router.register(r'products', ProductViewSet)
router.register(r'groups', ProductGroupViewSet)
router.register(r'users', KorisnikViewSet)


urlpatterns = [
    path('', include(router.urls))
]
# output from functions in /shop.views.py