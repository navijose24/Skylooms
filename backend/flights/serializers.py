from rest_framework import serializers
from .models import Airport, Flight

class AirportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Airport
        fields = '__all__'

class FlightSerializer(serializers.ModelSerializer):
    source = AirportSerializer()
    destination = AirportSerializer()
    seat_status = serializers.ReadOnlyField()
    seat_percentage = serializers.ReadOnlyField()

    class Meta:
        model = Flight
        fields = '__all__'
