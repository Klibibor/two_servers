from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),  # ostaje samo MeAPIView
    path('shop/', include('shop.urls')),  # svi viewsetovi i token endpoint
]
