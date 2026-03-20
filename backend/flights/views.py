from rest_framework import generics
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
