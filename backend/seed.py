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
    # JSON files are in the root directory, while seed.py is in backend
    path = os.path.join(settings.BASE_DIR, '..', filename)
    with open(path, 'r') as f:
        return json.load(f)

def run():
    print("Clearing old data...")
    Flight.objects.all().delete()
    Airport.objects.all().delete()
    Hotel.objects.all().delete()
    Cab.objects.all().delete()

    # Load data
    print("Loading JSON files...")
    flights_data: List[Dict[str, Any]] = load_json('flight_services.json')
    hotels_map: Dict[str, List[Dict[str, Any]]] = load_json('hotels.json')
    cabs_map: Dict[str, List[Dict[str, Any]]] = load_json('cab.json')

    now = timezone.now()
    
    # 1. Seed Airports
    print("Seeding airports...")
    airport_cache = {}
    
    def get_or_create_airport(ap_data):
        code = ap_data['airportCode']
        if code not in airport_cache:
            # We don't have the full name in JSON, so we'll use city name + "International"
            name = f"{ap_data['city']} International Airport"
            airport, _ = Airport.objects.get_or_create(
                code=code,
                defaults={
                    'name': name,
                    'city': ap_data['city'],
                    'country': ap_data['country']
                }
            )
            airport_cache[code] = airport
        return airport_cache[code]

    for f_data in flights_data:
        get_or_create_airport(f_data['origin'])
        get_or_create_airport(f_data['destination'])

    # 2. Seed Flights
    print("Seeding flights...")
    for f_data in flights_data:
        source = airport_cache[f_data['origin']['airportCode']]
        dest = airport_cache[f_data['destination']['airportCode']]
        duration_mins = f_data['flightDurationMinutes']
        
        # We'll generate flights for the next 7 days instead of 14, and 3 flights per day.
        for day_offset in range(7):
            flight_date = (now + timedelta(days=day_offset)).date()
            
            # 3 Flights per day: Morning, Afternoon, Evening
            departure_hours = [7, 13, 19] 
            
            for i, hour in enumerate(departure_hours):
                # --- OUTBOUND FLIGHT ---
                f_id_out = f"{f_data['id']}-OUT-{day_offset}-{i}"
                dep_time_out = timezone.make_aware(datetime.combine(flight_date, datetime.min.time().replace(hour=hour, minute=random.randint(0, 59))))
                arr_time_out = dep_time_out + timedelta(minutes=duration_mins)
                
                dist = f_data['distanceKm']
                price_econ = dist * 0.12 + random.randint(10, 30)
                price_biz = price_econ * 2.5 + random.randint(50, 150)

                Flight.objects.create(
                    flight_number=f_id_out,
                    source=source,
                    destination=dest,
                    departure_time=dep_time_out,
                    arrival_time=arr_time_out,
                    price_economy=round(price_econ, 2),
                    price_business=round(price_biz, 2)
                )

                # --- RETURN FLIGHT ---
                f_id_ret = f"{f_data['id']}-RET-{day_offset}-{i}"
                # Return flight starts after outbound arrives, e.g. 4 hours later
                dep_time_ret = arr_time_out + timedelta(hours=4, minutes=random.randint(0, 59))
                arr_time_ret = dep_time_ret + timedelta(minutes=duration_mins)

                Flight.objects.create(
                    flight_number=f_id_ret,
                    source=dest,
                    destination=source,
                    departure_time=dep_time_ret,
                    arrival_time=arr_time_ret,
                    price_economy=round(price_econ * 0.98, 2),
                    price_business=round(price_biz * 0.98, 2)
                )

    # 2b. Add some missing routes for the UI deals if not present
    jnb = airport_cache.get('JNB')
    if jnb:
        # 1. Domestic: CPT (Cape Town)
        if 'CPT' not in airport_cache:
            cpt, _ = Airport.objects.get_or_create(code='CPT', defaults={'name': 'Cape Town International', 'city': 'Cape Town', 'country': 'South Africa'})
            print("Adding JNB <-> CPT flights...")
            for day in range(7):
                for i, hour in enumerate([8, 14, 20]):
                    dep = timezone.make_aware(datetime.combine((now + timedelta(days=day)).date(), datetime.min.time().replace(hour=hour)))
                    Flight.objects.create(flight_number=f"SA-DOM-{day}-{i}", source=jnb, destination=cpt, departure_time=dep, arrival_time=dep + timedelta(hours=2), price_economy=75.00, price_business=200.00)
                    ret = dep + timedelta(hours=5)
                    Flight.objects.create(flight_number=f"SA-RET-{day}-{i}", source=cpt, destination=jnb, departure_time=ret, arrival_time=ret + timedelta(hours=2), price_economy=70.00, price_business=190.00)
        
        # 2. Regional: DXB (Dubai)
        dxb = airport_cache.get('DXB')
        if dxb:
            print("Adding JNB <-> DXB flights...")
            for day in range(0, 7, 2):
                for i, hour in enumerate([10, 22]):
                    dep = timezone.make_aware(datetime.combine((now + timedelta(days=day)).date(), datetime.min.time().replace(hour=hour)))
                    Flight.objects.create(flight_number=f"SA-DXB-{day}-{i}", source=jnb, destination=dxb, departure_time=dep, arrival_time=dep + timedelta(hours=8), price_economy=400.00, price_business=1200.00)
                    ret = dep + timedelta(hours=14)
                    Flight.objects.create(flight_number=f"SA-RET-DXB-{day}-{i}", source=dxb, destination=jnb, departure_time=ret, arrival_time=ret + timedelta(hours=8), price_economy=380.00, price_business=1100.00)

        # 3. International: JFK (New York)
        jfk = airport_cache.get('JFK')
        if jfk:
            print("Adding JNB <-> JFK flights...")
            for day in range(0, 7, 3):
                for i, hour in enumerate([21]):
                    dep = timezone.make_aware(datetime.combine((now + timedelta(days=day)).date(), datetime.min.time().replace(hour=hour)))
                    Flight.objects.create(flight_number=f"SA-JFK-{day}", source=jnb, destination=jfk, departure_time=dep, arrival_time=dep + timedelta(hours=16), price_economy=500.00, price_business=1500.00)
                    ret = dep + timedelta(hours=24)
                    Flight.objects.create(flight_number=f"SA-RET-JFK-{day}", source=jfk, destination=jnb, departure_time=ret, arrival_time=ret + timedelta(hours=16), price_economy=480.00, price_business=1400.00)

    # 3. Seed Hotels
    print("Seeding hotels...")
    for airport_code, hotels_list in hotels_map.items():
        airport = airport_cache.get(airport_code)
        if airport:
            city = airport.city
            for h_data in hotels_list:
                rating = float(h_data.get('rating', 0))
                # Generate a price based on rating
                price = rating * 100 + random.randint(-50, 50)
                hotel_type = 'luxury' if rating >= 4.0 else 'budget'
                
                Hotel.objects.create(
                    name=h_data['name'],
                    city=city,
                    rating=rating,
                    distance_from_airport=h_data.get('distanceFromAirportKm', 5.0),
                    amenities=h_data.get('cuisinePreferences', []),
                    price_per_night=round(price, 2),
                    hotel_type=hotel_type
                )

    # 4. Seed Cabs
    print("Seeding cabs...")
    drivers = ["John Smith", "Maria Garcia", "David Chen", "Sarah Williams", "Ahmed Hassan", "Elena Popov"]
    for airport_code, cabs_list in cabs_map.items():
        airport = airport_cache.get(airport_code)
        if airport:
            city = airport.city
            for c_data in cabs_list:
                rating = random.uniform(3.5, 5.0)
                cab_type = 'premium' if float(c_data['farePerKmUsd']) > 3.0 else 'standard'
                
                Cab.objects.create(
                    driver_name=random.choice(drivers),
                    vehicle_model=c_data['cabName'],
                    seating_capacity=c_data.get('maxPassengers', 4),
                    cab_type=cab_type,
                    rating=round(rating, 1),
                    price_per_km=c_data['farePerKmUsd'],
                    city=city
                )

    print("Seeding complete!")

if __name__ == '__main__':
    run()
