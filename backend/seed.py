import os
import django
import json
import random
from datetime import timedelta, datetime
from django.utils import timezone

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from flights.models import Airport, Flight
from accommodations.models import Hotel
from cabs.models import Cab
from django.conf import settings
from typing import List, Dict, Any

def load_json(filename):
    path = os.path.join(settings.BASE_DIR, '..', filename)
    with open(path, 'r') as f:
        return json.load(f)

def run():
    print("Clearing old data...")
    Flight.objects.all().delete()
    Airport.objects.all().delete()
    Hotel.objects.all().delete()
    Cab.objects.all().delete()

    print("Loading JSON files...")
    flights_data: List[Dict[str, Any]] = load_json('flight_services.json')
    hotels_map: Dict[str, List[Dict[str, Any]]] = load_json('hotels.json')
    cabs_map: Dict[str, List[Dict[str, Any]]] = load_json('cab.json')

    now = timezone.now()
    
    # 1. Seed Airports
    print("Seeding airports...")
    airport_cache = {}
    
    def get_or_create_airport(code, city, country):
        if code not in airport_cache:
            name = f"{city} International Airport"
            airport, _ = Airport.objects.get_or_create(
                code=code,
                defaults={
                    'name': name,
                    'city': city,
                    'country': country
                }
            )
            airport_cache[code] = airport
        return airport_cache[code]

    # Pre-seed major global airports
    major_ap_data = [
        ('JNB', 'Johannesburg', 'South Africa'), ('CPT', 'Cape Town', 'South Africa'),
        ('DXB', 'Dubai', 'UAE'), ('JFK', 'New York', 'USA'),
        ('LHR', 'London', 'UK'), ('SIN', 'Singapore', 'Singapore'),
        ('SYD', 'Sydney', 'Australia'), ('BOM', 'Mumbai', 'India'),
        ('CDG', 'Paris', 'France'), ('NRT', 'Tokyo', 'Japan'),
        ('LAX', 'Los Angeles', 'USA'), ('FRA', 'Frankfurt', 'Germany'),
        ('HND', 'Tokyo', 'Japan'), ('DEL', 'Delhi', 'India'),
    ]
    for code, city, country in major_ap_data:
        get_or_create_airport(code, city, country)

    for f_data in flights_data:
        get_or_create_airport(f_data['origin']['airportCode'], f_data['origin']['city'], f_data['origin']['country'])
        get_or_create_airport(f_data['destination']['airportCode'], f_data['destination']['city'], f_data['destination']['country'])

    # 2. Seed Flights
    print("Seeding flights...")
    
    preferred_routes = [
        ('JNB', 'CPT', 125, 120), ('JNB', 'DXB', 5480, 480),
        ('JNB', 'JFK', 12830, 960), ('JNB', 'LHR', 9020, 660),
        ('JFK', 'LHR', 5540, 420), ('DXB', 'LHR', 5480, 440),
        ('SYD', 'LAX', 12060, 830), ('SIN', 'NRT', 5320, 400),
        ('CDG', 'JFK', 5840, 460), ('BOM', 'DXB', 1930, 180),
        ('DEL', 'DXB', 2200, 210), ('FRA', 'LHR', 650, 95),
    ]

    all_selected_routes = []
    for r in preferred_routes:
        all_selected_routes.append(r)
        all_selected_routes.append((r[1], r[0], r[2], r[3])) 

    for s_code, d_code, dist, dur in all_selected_routes:
        source, dest = airport_cache.get(s_code), airport_cache.get(d_code)
        if not source or not dest: continue

        for day in range(14):
            flight_date = (now + timedelta(days=day)).date()
            # 2 Flights per day: Morning and Evening
            times = [6 + random.randint(0, 5), 15 + random.randint(0, 6)]
            for i, hour in enumerate(times):
                dep = timezone.make_aware(datetime.combine(flight_date, datetime.min.time().replace(hour=hour, minute=random.choice([0, 15, 30, 45]))))
                arr = dep + timedelta(minutes=dur)
                price = 50 + (dist * 0.08) + random.randint(-10, 30)
                Flight.objects.create(
                    flight_number=f"SKY-{'M' if i==0 else 'E'}-{s_code}{d_code}-{day}",
                    source=source, destination=dest, departure_time=dep, arrival_time=arr,
                    price_economy=round(price, 2), price_business=round(price * 2.8, 2)
                )

    # 3. Seed Hotels
    print("Seeding hotels...")
    for ap_code, hotels in hotels_map.items():
        airport = airport_cache.get(ap_code)
        if airport:
            for h in hotels:
                rating = float(h.get('rating', 0))
                price = rating * 100 + random.randint(-50, 50)
                Hotel.objects.create(
                    name=h['name'], city=airport.city, rating=rating,
                    distance_from_airport=h.get('distanceFromAirportKm', 5.0),
                    amenities=h.get('cuisinePreferences', []),
                    price_per_night=round(price, 2), hotel_type='luxury' if rating >= 4.0 else 'budget'
                )

    # 4. Seed Cabs
    print("Seeding cabs...")
    drivers = ["John Smith", "Maria Garcia", "David Chen", "Sarah Williams", "Ahmed Hassan", "Elena Popov"]
    for ap_code, cabs in cabs_map.items():
        airport = airport_cache.get(ap_code)
        if airport:
            for c in cabs:
                rating = random.uniform(3.5, 5.0)
                Cab.objects.create(
                    driver_name=random.choice(drivers), vehicle_model=c['cabName'],
                    seating_capacity=c.get('maxPassengers', 4),
                    cab_type='premium' if float(c['farePerKmUsd']) > 3.0 else 'standard',
                    rating=round(rating, 1), price_per_km=c['farePerKmUsd'], city=airport.city
                )

    print("Seeding complete!")

if __name__ == '__main__':
    run()
