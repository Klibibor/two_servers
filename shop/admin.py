from django.contrib import admin
from .models import Product, ProductGroup


admin.site.register(Product)
admin.site.register(ProductGroup)