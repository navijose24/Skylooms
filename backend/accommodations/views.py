from rest_framework.views import APIView
from rest_framework.response import Response
from accommodations.models import Hotel
from cabs.models import Cab
from accommodations.serializers import HotelSerializer
from cabs.serializers import CabSerializer

class RecommendationsView(APIView):
    def get(self, request, *args, **kwargs):
        # Only if round trip and duration > 1 day -> recommendations
        # Parameters expected: journey_type, duration_days, cabin_class
        journey_type = request.query_params.get('journey_type')
        duration_days = request.query_params.get('duration_days')
        cabin_class = request.query_params.get('cabin_class')
        city = request.query_params.get('city') # destination city

        try:
            duration_days = int(duration_days)
        except (TypeError, ValueError):
            duration_days = 0

        if journey_type != 'round_trip' or duration_days <= 1:
            return Response({"hotels": [], "cabs": [], "message": "No recommendations needed based on trip parameters."})

        # Logic: Economy -> Budget, Business -> Luxury
        hotel_type = 'luxury' if cabin_class == 'business' else 'budget'
        cab_type = 'premium' if cabin_class == 'business' else 'standard'

        hotels = Hotel.objects.filter(hotel_type=hotel_type)
        if city:
            hotels = hotels.filter(city__icontains=city)

        cabs = Cab.objects.filter(cab_type=cab_type)
        if city:
            cabs = cabs.filter(city__icontains=city)

        hotel_serializer = HotelSerializer(hotels, many=True)
        cab_serializer = CabSerializer(cabs, many=True)

        return Response({
            "hotels": hotel_serializer.data,
            "cabs": cab_serializer.data
        })
