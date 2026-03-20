from django.db import models

class Cab(models.Model):
    CAB_TYPE_CHOICES = [
        ('standard', 'Standard'),
        ('premium', 'Premium'),
    ]

    driver_name = models.CharField(max_length=255)
    vehicle_model = models.CharField(max_length=100)
    seating_capacity = models.IntegerField(default=4)
    cab_type = models.CharField(max_length=20, choices=CAB_TYPE_CHOICES)
    rating = models.DecimalField(max_digits=3, decimal_places=1, default=0.0)
    price_per_km = models.DecimalField(max_digits=6, decimal_places=2)
    city = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.vehicle_model} - {self.city} ({self.cab_type})"
