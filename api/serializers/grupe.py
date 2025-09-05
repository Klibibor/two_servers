# api/serializers/grupe.py
from rest_framework import serializers
from shop.models import ProductGroup


# input class for serializing related database id's
class ProductGroupSerializer(serializers.ModelSerializer):
    proizvodi = serializers.PrimaryKeyRelatedField(
        many=True,
        read_only=True
    )

    class Meta:
        model = ProductGroup
        fields = ['id', 'naziv', 'proizvodi'] # rows that will be used
# output serialized model and related model rows