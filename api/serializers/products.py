from rest_framework import serializers
from shop.models import Product


# input class for serializing product data related database rows and related database for images
class ProductSerializer(serializers.ModelSerializer):
    # image is optional at the API level — model allows null/blank
    image = serializers.ImageField(use_url=True, required=False, allow_null=True)
    group_name = serializers.CharField(source='group.name', read_only=True)

    class Meta:
        model = Product
        fields = '__all__'
# output serialized model with all rows including related database rows
