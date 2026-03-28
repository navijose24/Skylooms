from django.db import models

class Airport(models.Model):
    code = models.CharField(max_length=3, unique=True)
    name = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    country = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.name} ({self.code})"

class Flight(models.Model):
    flight_number = models.CharField(max_length=20, unique=True)
    source = models.ForeignKey(Airport, on_delete=models.CASCADE, related_name='departures')
    destination = models.ForeignKey(Airport, on_delete=models.CASCADE, related_name='arrivals')
    departure_time = models.DateTimeField()
    arrival_time = models.DateTimeField()
    price_economy = models.DecimalField(max_digits=10, decimal_places=2)
    price_business = models.DecimalField(max_digits=10, decimal_places=2)
    duration = models.DurationField(null=True, blank=True)
    total_seats = models.IntegerField(default=180)
    available_seats = models.IntegerField(default=180)
    booked_seats = models.JSONField(default=list, blank=True)

    def save(self, *args, **kwargs):
        if self.departure_time and self.arrival_time:
            self.duration = self.arrival_time - self.departure_time
        super().save(*args, **kwargs)

    @property
    def seat_status(self):
        """Returns urgency level based on available seats."""
        if self.available_seats <= 3:
            return 'critical'
        elif self.available_seats <= 10:
            return 'low'
        elif self.available_seats <= 30:
            return 'moderate'
        return 'available'

    @property
    def seat_percentage(self):
        if self.total_seats == 0:
            return 0
        return round((self.available_seats / self.total_seats) * 100)

    def __str__(self):
        return f"{self.flight_number} from {self.source.code} to {self.destination.code}"
