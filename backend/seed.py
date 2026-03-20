import os
import django
from datetime import timedelta
from django.utils import timezone

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from flights.models import Airport, Flight
from accommodations.models import Hotel
from cabs.models import Cab

def run():
    print("Clearing old data...")
    Airport.objects.all().delete()
    Flight.objects.all().delete()
    Hotel.objects.all().delete()
    Cab.objects.all().delete()

    now = timezone.now()
    print("Seeding airports...")
    a1 = Airport.objects.create(code='JNB', name='O.R. Tambo International', city='Johannesburg', country='South Africa')
    a2 = Airport.objects.create(code='CPT', name='Cape Town International', city='Cape Town', country='South Africa')
    a3 = Airport.objects.create(code='LHR', name='Heathrow', city='London', country='UK')
    a4 = Airport.objects.create(code='DXB', name='Dubai International', city='Dubai', country='UAE')
    a5 = Airport.objects.create(code='JFK', name='John F. Kennedy', city='New York', country='USA')

    print("Seeding flights...")
    now = timezone.now()
    # JNB to CPT (Domestic)
    Flight.objects.create(
        flight_number='SL501', source=a1, destination=a2, departure_time=now + timedelta(days=1),
        arrival_time=now + timedelta(days=1, hours=2), price_economy=80.00, price_business=200.00
    )
    # JNB to LHR (International)
    Flight.objects.create(
        flight_number='SL101', source=a1, destination=a3, departure_time=now + timedelta(days=2),
        arrival_time=now + timedelta(days=2, hours=11), price_economy=650.00, price_business=1800.00
    )
    # CPT to JNB
    Flight.objects.create(
        flight_number='SL502', source=a2, destination=a1, departure_time=now + timedelta(days=3),
        arrival_time=now + timedelta(days=3, hours=2), price_economy=75.00, price_business=190.00
    )
    # DXB to JNB
    Flight.objects.create(
        flight_number='SL301', source=a4, destination=a1, departure_time=now + timedelta(days=5),
        arrival_time=now + timedelta(days=5, hours=8), price_economy=400.00, price_business=1200.00
    )
    # JFK to LHR
    Flight.objects.create(
        flight_number='SL102', source=a5, destination=a3, departure_time=now + timedelta(days=7),
        arrival_time=now + timedelta(days=7, hours=7), price_economy=500.00, price_business=1300.00
    )

    print("Seeding hotels...")
    Hotel.objects.create(name='Grand Plaza', city='London', rating=4.5, distance_from_airport=15.0, amenities=["WiFi", "Pool", "Spa"], price_per_night=350.00, hotel_type='luxury')
    Hotel.objects.create(name='London Inn', city='London', rating=3.5, distance_from_airport=5.0, amenities=["WiFi", "Breakfast"], price_per_night=80.00, hotel_type='budget')
    
    Hotel.objects.create(name='Eiffel Views', city='Paris', rating=4.8, distance_from_airport=25.0, amenities=["WiFi", "Gym", "Spa"], price_per_night=450.00, hotel_type='luxury')
    Hotel.objects.create(name='Hostel Paris', city='Paris', rating=3.8, distance_from_airport=10.0, amenities=["WiFi"], price_per_night=45.00, hotel_type='budget')

    Hotel.objects.create(name='The Manhattan Gold', city='New York', rating=4.9, distance_from_airport=20.0, amenities=["WiFi", "Gym", "Pool"], price_per_night=550.00, hotel_type='luxury')
    Hotel.objects.create(name='NYC Budget Stays', city='New York', rating=3.2, distance_from_airport=12.0, amenities=["WiFi"], price_per_night=90.00, hotel_type='budget')

    print("Seeding cabs...")
    Cab.objects.create(driver_name='John Doe', vehicle_model='Mercedes S-Class', seating_capacity=4, cab_type='premium', rating=4.9, price_per_km=5.50, city='London')
    Cab.objects.create(driver_name='Jane Smith', vehicle_model='Toyota Prius', seating_capacity=4, cab_type='standard', rating=4.5, price_per_km=2.00, city='London')
    
    Cab.objects.create(driver_name='Jacques', vehicle_model='BMW 7 Series', seating_capacity=4, cab_type='premium', rating=4.8, price_per_km=6.00, city='Paris')
    Cab.objects.create(driver_name='Pierre', vehicle_model='Renault Zoe', seating_capacity=3, cab_type='standard', rating=4.2, price_per_km=1.80, city='Paris')

    Cab.objects.create(driver_name='Mike Ross', vehicle_model='Cadillac Escalade', seating_capacity=6, cab_type='premium', rating=4.9, price_per_km=7.00, city='New York')
    Cab.objects.create(driver_name='Harvey Specter', vehicle_model='Ford Crown Victoria', seating_capacity=4, cab_type='standard', rating=4.1, price_per_km=3.00, city='New York')

    print("Done!")

if __name__ == '__main__':
    run()
