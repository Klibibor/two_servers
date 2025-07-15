from django.db import models

class GrupaProizvoda(models.Model):
    naziv = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.naziv

class Proizvod(models.Model):
    naziv = models.CharField(max_length=100)
    opis = models.TextField()
    cena = models.DecimalField(max_digits=10, decimal_places=2)
    slika = models.ImageField(upload_to='proizvodi/', null=True, blank=True)  # ← ovo je ključno
    
    grupa = models.ForeignKey(GrupaProizvoda, on_delete=models.CASCADE, null=True, blank=True, related_name='proizvodi')


    def __str__(self):
        return f"{self.naziv} ({self.grupa.naziv if self.grupa else 'Bez grupe'})"
