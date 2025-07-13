from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LoginAPIView, UserViewSet
from .views import CurrentUserView 

router = DefaultRouter()
router.register(r'korisnici', UserViewSet)


urlpatterns = [
    path('login/', LoginAPIView.as_view(), name='login-api'),
    path('', include(router.urls)),
    path('api/me/', CurrentUserView.as_view(), name='me'),
    path('api/', include(router.urls)),
]
