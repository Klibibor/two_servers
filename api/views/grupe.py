from rest_framework.viewsets import ModelViewSet
from shop.models import GrupaProizvoda
from api.serializers.grupe import GrupaProizvodaSerializer
from rest_framework.permissions import AllowAny

class GrupaProizvodaViewSet(ModelViewSet):
    queryset = GrupaProizvoda.objects.all()
    serializer_class = GrupaProizvodaSerializer
    permission_classes = [AllowAny]
