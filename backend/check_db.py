import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()
from bookings.models import Booking
from flights.models import Flight
from accommodations.models import Hotel
from django.db.models import Sum

print(f'Bookings: {Booking.objects.count()}')
print(f'Revenue: {Booking.objects.filter(status="confirmed").aggregate(Sum("total_price"))["total_price__sum"]}')
print(f'Flights: {Flight.objects.count()}')
print(f'Hotels: {Hotel.objects.count()}')
