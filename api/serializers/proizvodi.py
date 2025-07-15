from rest_framework import serializers
from shop.models import Proizvod

class ProizvodSerializer(serializers.ModelSerializer):
    slika = serializers.ImageField(use_url=True)
    grupa_naziv = serializers.CharField(source='grupa.naziv', read_only=True)

    class Meta:
        model = Proizvod
        fields = '__all__'
