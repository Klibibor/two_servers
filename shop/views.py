from rest_framework import viewsets
from rest_framework.viewsets import ModelViewSet
from django.contrib.auth.models import User
from .models import Proizvod, GrupaProizvoda
from .serializers import ProizvodSerializer, GrupaProizvodaSerializer, UserSerializer
from rest_framework.permissions import IsAuthenticated

class ProizvodViewSet(viewsets.ModelViewSet):
    queryset = Proizvod.objects.all()
    serializer_class = ProizvodSerializer

class GrupaProizvodaViewSet(viewsets.ModelViewSet):
    queryset = GrupaProizvoda.objects.all()
    serializer_class = GrupaProizvodaSerializer

class KorisnikViewSet(ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]