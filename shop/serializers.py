from rest_framework import serializers
from .models import GrupaProizvoda, Proizvod

class ProizvodSerializer(serializers.ModelSerializer):
    slika = serializers.ImageField(use_url=True)
    class Meta:
        model = Proizvod
        fields = '__all__'

class GrupaProizvodaSerializer(serializers.ModelSerializer):
    proizvodi = ProizvodSerializer(many=True, read_only=True)

    class Meta:
        model = GrupaProizvoda
        fields = ['id', 'naziv', 'proizvodi']
