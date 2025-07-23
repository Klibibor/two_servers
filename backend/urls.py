from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),  # ostaje samo MeAPIView
    path('shop/', include('shop.urls')),  # svi viewsetovi i token endpoint
]

# Dodaj rutu za media fajlove u developmentu
from django.conf import settings
from django.conf.urls.static import static
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
