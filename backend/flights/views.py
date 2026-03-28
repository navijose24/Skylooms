from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Flight, Airport
from .serializers import FlightSerializer, AirportSerializer

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
