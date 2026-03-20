from django.db import models

class Hotel(models.Model):
    HOTEL_TYPE_CHOICES = [
        ('budget', 'Budget'),
        ('luxury', 'Luxury'),
    ]

    name = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    rating = models.DecimalField(max_digits=3, decimal_places=1, default=0.0)
    distance_from_airport = models.DecimalField(max_digits=5, decimal_places=1, help_text="Distance in km")
    amenities = models.JSONField(default=list)
    price_per_night = models.DecimalField(max_digits=10, decimal_places=2)
    hotel_type = models.CharField(max_length=20, choices=HOTEL_TYPE_CHOICES)

    def __str__(self):
        return f"{self.name} - {self.city} ({self.hotel_type})"
