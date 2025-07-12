from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('shop.urls')),
    path('api/', include('api.urls')),  # ← ovo povezuje tvoju api aplikaciju
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]


# Dodaj ovo da bi prikazivao slike tokom razvoja
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
