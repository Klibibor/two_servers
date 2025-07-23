
# Django REST Framework i JWT importi
from rest_framework.views import APIView  # Bazna klasa za API view
from rest_framework.response import Response  # Odgovor za API
from rest_framework.permissions import IsAuthenticated  # Dozvola: samo autentifikovani
from rest_framework_simplejwt.views import TokenObtainPairView  # JWT view za token
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer  # JWT serializer
from rest_framework import serializers  # Osnovni DRF serializer

class APITokenObtainPairSerializer(TokenObtainPairSerializer):  # Custom JWT serializer
    @classmethod
    def get_token(cls, user):  # Pravi JWT token za korisnika
        token = super().get_token(user)  # Poziva baznu metodu
        token['username'] = user.username  # Dodaje username u token
        token['is_superuser'] = user.is_superuser  # Dodaje superuser status
        token['groups'] = list(user.groups.values_list('name', flat=True))  # Dodaje grupe korisnika
        return token  # Vraća token

    def validate(self, attrs):  # Validacija korisnika za JWT
        data = super().validate(attrs)  # Bazna validacija
        user = self.user  # Dobija korisnika
        # Proverava da li je korisnik u JWT grupi ili je superuser
        if not (
            user.groups.filter(name="JWT").exists() or user.is_superuser
        ):
            raise serializers.ValidationError("Nemate pravo na JWT pristup.")  # Ako nije, baca grešku
        return data  # Vraća validirane podatke

class APITokenObtainPairView(TokenObtainPairView):  # JWT view za dobijanje tokena
    serializer_class = APITokenObtainPairSerializer  # Koristi custom serializer

class MeAPIView(APIView):  # View za podatke o trenutnom korisniku
    permission_classes = [IsAuthenticated]  # Samo autentifikovani korisnici

    def get(self, request):  # GET metoda
        user = request.user  # Dobija korisnika iz requesta
        return Response({  # Vraća JSON sa podacima o korisniku
            "id": user.id,  # ID korisnika
            "username": user.username,  # Username
            "email": user.email,  # Email
            "is_staff": user.is_staff,  # Da li je staff
            "is_superuser": user.is_superuser,  # Da li je superuser
            "groups": list(user.groups.values_list("name", flat=True)),  # Grupe korisnika
        })
