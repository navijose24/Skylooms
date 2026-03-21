from django.db import models
from flights.models import Flight
from accommodations.models import Hotel
from cabs.models import Cab

class Passenger(models.Model):
    GENDER_CHOICES = [
        ('M', 'Male'),
        ('F', 'Female'),
        ('O', 'Other'),
    ]
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(null=True, blank=True)
    passport_number = models.CharField(max_length=20, null=True, blank=True)
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES)
    age = models.IntegerField()
    requires_disability_assistance = models.BooleanField(default=False)
    has_children = models.BooleanField(default=False)
    has_pets = models.BooleanField(default=False)
    
    def __str__(self):
        return f"{self.first_name} {self.last_name}"

class Booking(models.Model):
    JOURNEY_TYPES = [
        ('one_way', 'One Way'),
        ('round_trip', 'Round Trip'),
        ('multi_city', 'Multi-city'),
    ]
    CABIN_CLASSES = [
        ('economy', 'Economy'),
        ('business', 'Business'),
    ]
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled')
    ]

    user_email = models.EmailField()
    flights = models.ManyToManyField(Flight, related_name='bookings')
    journey_type = models.CharField(max_length=20, choices=JOURNEY_TYPES)
    cabin_class = models.CharField(max_length=20, choices=CABIN_CLASSES)
    passengers = models.ManyToManyField(Passenger, related_name='bookings')

    hotel = models.ForeignKey(Hotel, on_delete=models.SET_NULL, null=True, blank=True)
    cab = models.ForeignKey(Cab, on_delete=models.SET_NULL, null=True, blank=True)

    reference_number = models.CharField(max_length=6, unique=True, null=True, blank=True)
    total_price = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    payment_id = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.reference_number:
            import string
            import random
            def generate():
                return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
            self.reference_number = generate()
            while Booking.objects.filter(reference_number=self.reference_number).exists():
                self.reference_number = generate()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Booking {self.reference_number} for {self.user_email}"
