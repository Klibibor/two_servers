from rest_framework import serializers
from django.contrib.auth.models import User
from .models import GrupaProizvoda, Proizvod

class ProizvodSerializer(serializers.ModelSerializer):
    slika = serializers.ImageField(use_url=True)
    grupa_naziv = serializers.CharField(source='grupa.naziv', read_only=True)

    class Meta:
        model = Proizvod
        fields = '__all__'

class GrupaProizvodaSerializer(serializers.ModelSerializer):
    proizvodi = ProizvodSerializer(many=True, read_only=True)

    class Meta:
        model = GrupaProizvoda
        fields = ['id', 'naziv', 'proizvodi']

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'is_staff']
