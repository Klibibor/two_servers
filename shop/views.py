from rest_framework import viewsets
from .models import Proizvod, GrupaProizvoda
from .serializers import ProizvodSerializer, GrupaProizvodaSerializer

class ProizvodViewSet(viewsets.ModelViewSet):
    queryset = Proizvod.objects.all()
    serializer_class = ProizvodSerializer

class GrupaProizvodaViewSet(viewsets.ModelViewSet):
    queryset = GrupaProizvoda.objects.all()
    serializer_class = GrupaProizvodaSerializer
