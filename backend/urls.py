from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('shop.urls')),
    path('api/', include('api.urls')),  # ← ovo povezuje tvoju api aplikaciju
]


# Dodaj ovo da bi prikazivao slike tokom razvoja
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
