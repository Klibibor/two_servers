# api/serializers/grupe.py
from rest_framework import serializers
from shop.models import GrupaProizvoda

class GrupaProizvodaSerializer(serializers.ModelSerializer):
    proizvodi = serializers.PrimaryKeyRelatedField(
        many=True,
        read_only=True
    )

    class Meta:
        model = GrupaProizvoda
        fields = ['id', 'naziv', 'proizvodi']
