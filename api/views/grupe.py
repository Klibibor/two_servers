from rest_framework.viewsets import ModelViewSet
from shop.models import GrupaProizvoda
from api.serializers.grupe import GrupaProizvodaSerializer

class GrupaProizvodaViewSet(ModelViewSet):
    queryset = GrupaProizvoda.objects.all()
    serializer_class = GrupaProizvodaSerializer
