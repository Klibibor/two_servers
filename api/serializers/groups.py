# api/serializers/groups.py
from rest_framework import serializers
from shop.models import ProductGroup


# input class for serializing related database id's
class ProductGroupSerializer(serializers.ModelSerializer):
    products = serializers.PrimaryKeyRelatedField(
        many=True,
        read_only=True
    )

    class Meta:
        model = ProductGroup
        fields = ['id', 'name', 'products'] # rows that will be used
# output serialized model and related model rows
