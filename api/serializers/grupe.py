from rest_framework import serializers
from shop.models import GrupaProizvoda
from api.serializers.proizvodi import ProizvodSerializer

class GrupaProizvodaSerializer(serializers.ModelSerializer):
    proizvodi = ProizvodSerializer(many=True, read_only=True)

    class Meta:
        model = GrupaProizvoda
        fields = ['id', 'naziv', 'proizvodi']
