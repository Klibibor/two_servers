
from django.urls import path
from api.views.auth import MeAPIView  # ostaje samo MeAPIView
from api.views.auth import APITokenObtainPairView

urlpatterns = [
    path('me/', MeAPIView.as_view()),  # /api/me/
    path('token/', APITokenObtainPairView.as_view()),  # /api/token/
]
