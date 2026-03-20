from rest_framework import serializers
from .models import Passenger, Booking
from flights.models import Flight
from flights.serializers import FlightSerializer
from accommodations.serializers import HotelSerializer
from cabs.serializers import CabSerializer

class PassengerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Passenger
        fields = '__all__'

class BookingSerializer(serializers.ModelSerializer):
    passengers = PassengerSerializer(many=True)
    flights_details = FlightSerializer(source='flights', many=True, read_only=True)
    hotel_details = HotelSerializer(source='hotel', read_only=True)
    cab_details = CabSerializer(source='cab', read_only=True)

    class Meta:
        model = Booking
        fields = '__all__'
        extra_kwargs = {
            'flights': {'write_only': True},
            'hotel': {'write_only': True},
            'cab': {'write_only': True},
        }

    def create(self, validated_data):
        passengers_data = validated_data.pop('passengers')
        flights_data = validated_data.pop('flights')
        
        booking = Booking.objects.create(**validated_data)
        
        for passenger_data in passengers_data:
            passenger = Passenger.objects.create(**passenger_data)
            booking.passengers.add(passenger)
            
        for flight in flights_data:
            booking.flights.add(flight)
            
        return booking
