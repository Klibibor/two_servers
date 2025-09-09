from django.db import models

class ProductGroup(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

class Product(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    image = models.ImageField(upload_to='products/', null=True, blank=True)  
    
    group = models.ForeignKey(ProductGroup, on_delete=models.CASCADE, null=True, blank=True, related_name='products')

    def __str__(self):
        return f"{self.name} ({self.group.name if self.group else 'No group'})"
