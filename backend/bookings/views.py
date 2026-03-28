from rest_framework.views import APIView
from rest_framework import generics, status
from rest_framework.response import Response
from .models import Booking, Passenger
from .serializers import BookingSerializer
from flights.models import Flight
from flights.serializers import FlightSerializer
from django.db import transaction
from django.utils import timezone
from decimal import Decimal

class BookingCreateView(generics.CreateAPIView):
    # To handle the checkout flow with passengers, flight(s), hotel and cab.
    serializer_class = BookingSerializer

    def create(self, request, *args, **kwargs):
        """Override create to deduct seats from each booked flight."""
        response = super().create(request, *args, **kwargs)
        if response.status_code == 201:
            booking_data = response.data
            passenger_count = len(booking_data.get('passengers', []))
            flight_ids = request.data.get('flights', [])
            allocated_seats = request.data.get('allocated_seats', {})
            with transaction.atomic():
                for flight_id in flight_ids:
                    try:
                        flight = Flight.objects.select_for_update().get(pk=flight_id)
                        seats_to_deduct = max(passenger_count, 1)
                        flight.available_seats = max(0, flight.available_seats - seats_to_deduct)
                        
                        # Add newly allocated seats to the flight's booked_seats array
                        flight_str_id = str(flight_id)
                        if flight_str_id in allocated_seats:
                            flight.booked_seats.extend(allocated_seats[flight_str_id])
                            flight.booked_seats = list(set(flight.booked_seats)) # dedup just in case
                            
                        flight.save()
                    except Flight.DoesNotExist:
                        pass
        return response

class BookingDetailView(generics.RetrieveAPIView):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer

    def get_object(self):
        obj = super().get_object()
        return obj

    # Optionally override to add ticket generation logic 
    # Or make a separate action/view for ticket PDF downloading
    
from django.http import HttpResponse
class BookingSearchView(APIView):
    def get(self, request):
        ref = request.query_params.get('reference')
        last_name = request.query_params.get('last_name')
        
        if not ref or not last_name:
            return Response({"error": "Reference and last name are required"}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            # Match by reference number and any passenger's last name
            booking = Booking.objects.filter(
                reference_number__iexact=ref, 
                passengers__last_name__iexact=last_name
            ).distinct().first()
            
            if not booking:
                return Response({"error": "Booking not found"}, status=status.HTTP_404_NOT_FOUND)
                
            serializer = BookingSerializer(booking)
            return Response(serializer.data)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

def download_ticket(request, pk):
    try:
        booking = Booking.objects.get(pk=pk)
    except Booking.DoesNotExist:
        return HttpResponse("Booking not found.", status=404)

    # Simplified stub for ticket download
    content = f"Ticket for Booking {booking.reference_number}\nJourney Type: {booking.journey_type}\nPassengers: {booking.passengers.count()}"
    response = HttpResponse(content, content_type='text/plain')
    response['Content-Disposition'] = f'attachment; filename="ticket_{booking.reference_number}.txt"'
    return response

class BookingCancelView(APIView):
    def post(self, request, pk):
        try:
            booking = Booking.objects.get(pk=pk)
        except Booking.DoesNotExist:
            return Response({"error": "Booking not found"}, status=status.HTTP_404_NOT_FOUND)

        if booking.status == 'cancelled':
            return Response({"error": "Booking is already cancelled.", "refund_amount": str(booking.refund_amount)}, status=status.HTTP_400_BAD_REQUEST)

        first_flight = booking.flights.order_by('departure_time').first()
        if not first_flight:
            return Response({"error": "No flights found for this booking"}, status=status.HTTP_400_BAD_REQUEST)

        now = timezone.now()
        time_diff = first_flight.departure_time - now
        days_before = time_diff.days

        if days_before >= 3:
            refund_percentage = 1.0
        elif days_before == 2:
            refund_percentage = 0.75
        else:
            refund_percentage = 0.0

        refund_amount = booking.total_price * Decimal(str(refund_percentage))
        
        booking.status = 'cancelled'
        booking.refund_amount = refund_amount
        booking.save()

        # Release seats
        passenger_count = max(booking.passengers.count(), 1)
        for flight in booking.flights.all():
            flight.available_seats += passenger_count
            flight.save()

        return Response({
            "success": True, 
            "message": "Booking cancelled successfully", 
            "refund_amount": str(refund_amount),
            "refund_percentage": refund_percentage * 100,
            "days_before": days_before
        })

