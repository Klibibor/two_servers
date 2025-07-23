

# --- AUTH VIEWS ---
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers



# --- GRUPE VIEWS ---
from rest_framework.viewsets import ModelViewSet
from shop.models import GrupaProizvoda
from api.serializers.grupe import GrupaProizvodaSerializer
from rest_framework.permissions import AllowAny

class GrupaProizvodaViewSet(ModelViewSet):
    queryset = GrupaProizvoda.objects.all()
    serializer_class = GrupaProizvodaSerializer
    permission_classes = [AllowAny]

# --- KORISNICI VIEWS ---
from django.contrib.auth.models import User
from api.serializers.korisnici import UserSerializer
from rest_framework.permissions import IsAuthenticated

class KorisnikViewSet(ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

# --- PROIZVODI VIEWS ---
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from shop.models import Proizvod
from api.serializers.proizvodi import ProizvodSerializer
from api.permissions import IsInJWTGroup
from rest_framework.permissions import AllowAny, IsAuthenticated, SAFE_METHODS, BasePermission

class ReadOnlyOrJWT(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return (
            request.user and request.user.is_authenticated and (
                request.user.is_superuser or
                request.user.groups.filter(name='JWT').exists()
            )
        )

class ProizvodViewSet(ModelViewSet):
    queryset = Proizvod.objects.all()
    serializer_class = ProizvodSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    permission_classes = [ReadOnlyOrJWT]

