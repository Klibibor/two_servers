from rest_framework.viewsets import ModelViewSet
from shop.models import Proizvod, GrupaProizvoda
from api.serializers.proizvodi import ProizvodSerializer, GrupaProizvodaSerializer
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

class ProizvodViewSet(ModelViewSet):
    queryset = Proizvod.objects.all()
    serializer_class = ProizvodSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]

class GrupaProizvodaViewSet(ModelViewSet):
    queryset = GrupaProizvoda.objects.all()
    serializer_class = GrupaProizvodaSerializer
