from django.db import models

class ProductGroup(models.Model):
    naziv = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.naziv

class Product(models.Model):
    naziv = models.CharField(max_length=100)
    opis = models.TextField()
    cena = models.DecimalField(max_digits=10, decimal_places=2)
    slika = models.ImageField(upload_to='proizvodi/', null=True, blank=True)  
    
    grupa = models.ForeignKey(ProductGroup, on_delete=models.CASCADE, null=True, blank=True, related_name='proizvodi')


    def __str__(self):
        return f"{self.naziv} ({self.grupa.naziv if self.grupa else 'Bez grupe'})"
