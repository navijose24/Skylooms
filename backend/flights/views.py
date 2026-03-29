from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Flight, Airport
from .serializers import FlightSerializer, AirportSerializer
import random
import time
from datetime import datetime, timedelta

class AirportList(generics.ListAPIView):
    queryset = Airport.objects.all()
    serializer_class = AirportSerializer

class FlightSearch(generics.ListAPIView):
    serializer_class = FlightSerializer

    def get_queryset(self):
        queryset = Flight.objects.all()
        source = self.request.query_params.get('source', None)
        destination = self.request.query_params.get('destination', None)
        date = self.request.query_params.get('date', None)

        if source:
            queryset = queryset.filter(source__code=source)
        if destination:
            queryset = queryset.filter(destination__code=destination)
        if date:
            queryset = queryset.filter(departure_time__date=date)
            
        return queryset


class FlightSeatAvailabilityView(APIView):
    """
    GET /api/flights/seats/?ids=1,2,3
    Returns live seat availability for a list of flight IDs.
    Designed for real-time polling from the frontend.
    """
    def get(self, request):
        ids_param = request.query_params.get('ids', '')
        if not ids_param:
            return Response({'error': 'Provide ?ids=1,2,3'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            ids = [int(i.strip()) for i in ids_param.split(',') if i.strip()]
        except ValueError:
            return Response({'error': 'Invalid IDs'}, status=status.HTTP_400_BAD_REQUEST)

        flights = Flight.objects.filter(pk__in=ids)
        data = {}
        for f in flights:
            data[f.id] = {
                'available_seats': f.available_seats,
                'total_seats': f.total_seats,
                'seat_status': f.seat_status,
                'seat_percentage': f.seat_percentage,
                'booked_seats': f.booked_seats,
            }
        return Response(data)

class FlightStatusView(APIView):
    """
    GET /api/flights/status/?query=SL701 or JNB-CPT
    Returns simulated flight status data.
    """
    def get(self, request):
        query = request.query_params.get('query', '').upper().strip()
        if not query:
            return Response({'error': 'Please provide a flight number or route'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Basic parsing of the query
        source_code = "JNB"
        dest_code = "CPT"
        flight_number = query
        
        if "-" in query:
            parts = query.split("-")
            source_code = parts[0][:3]
            if len(parts) > 1:
                dest_code = parts[1][:3]
            flight_number = f"SL{random.randint(100, 999)}"
        else:
            if not query.startswith("SL"):
                flight_number = f"SL{query}"
                
        # Simulate a database lookup delay
        time.sleep(0.4)
        
        # Seed random based on query and today's date so it returns consistent stats
        seed_value = f"{query}_{datetime.now().strftime('%Y%m%d')}"
        random.seed(seed_value)
        
        # Generate varied statuses based on random chance
        statuses = ['ON TIME', 'DELAYED', 'BOARDING', 'GATE CLOSED', 'IN AIR', 'LANDED']
        status_weights = [0.4, 0.15, 0.15, 0.1, 0.1, 0.1]
        status_text = random.choices(statuses, weights=status_weights, k=1)[0]
        
        now = datetime.now()
        
        city_map = {
            "JNB": "JOHANNESBURG",
            "CPT": "CAPE TOWN",
            "DUR": "DURBAN",
            "LHR": "LONDON",
            "JFK": "NEW YORK",
            "DXB": "DUBAI",
            "FRA": "FRANKFURT"
        }
        
        data = {
            "query": query,
            "flight_number": flight_number,
            "aircraft": "BOEING 787-9",
            "status": status_text,
            "speed": f"{random.randint(800, 950)} km/h" if status_text in ['IN AIR', 'ON TIME', 'DELAYED'] else "0 km/h",
            "altitude": f"{random.randint(32, 41)},000 ft" if status_text == 'IN AIR' else "-",
            "progress": random.randint(10, 90) if status_text == 'IN AIR' else (100 if status_text == 'LANDED' else 0),
            "source": {
                "code": source_code,
                "city": city_map.get(source_code, "UNKNOWN")
            },
            "destination": {
                "code": dest_code,
                "city": city_map.get(dest_code, "UNKNOWN")
            },
            "departure_time": (now + timedelta(minutes=random.randint(-120, 120))).strftime("%H:%M"),
            "arrival_time": (now + timedelta(minutes=random.randint(60, 300))).strftime("%H:%M"),
            "gate": f"{random.choice(['A', 'B', 'C', 'D'])}{random.randint(1, 24)}",
            "terminal": f"T{random.randint(1, 3)}"
        }
        
        # Reset seed so we don't affect other views
        random.seed()
        
        return Response(data)
