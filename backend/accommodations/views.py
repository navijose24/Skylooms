from rest_framework.views import APIView
from rest_framework.response import Response
from accommodations.models import Hotel
from cabs.models import Cab
from accommodations.serializers import HotelSerializer
from cabs.serializers import CabSerializer

class RecommendationsView(APIView):
    def get(self, request, *args, **kwargs):
        city = request.query_params.get('city') # destination city

        hotels = Hotel.objects.all()
        if city:
            hotels = hotels.filter(city__icontains=city)

        cabs = Cab.objects.all()
        if city:
            cabs = cabs.filter(city__icontains=city)

        hotel_serializer = HotelSerializer(hotels, many=True)
        cab_serializer = CabSerializer(cabs, many=True)

        return Response({
            "hotels": hotel_serializer.data,
            "cabs": cab_serializer.data
        })
