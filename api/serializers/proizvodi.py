from rest_framework import serializers
from shop.models import Product


# input class for serializing product data related database rows and related database for images
class ProductSerializer(serializers.ModelSerializer):
    # slika (image) is optional at the API level — model allows null/blank
    slika = serializers.ImageField(use_url=True, required=False, allow_null=True)
    grupa_naziv = serializers.CharField(source='grupa.naziv', read_only=True)

    class Meta:
        model = Product
        fields = '__all__'
# output serialized model with all rows including related database rows