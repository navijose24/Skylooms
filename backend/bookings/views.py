from rest_framework import generics, status
from rest_framework.response import Response
from .models import Booking, Passenger
from .serializers import BookingSerializer

class BookingCreateView(generics.CreateAPIView):
    # To handle the checkout flow with passengers, flight(s), hotel and cab.
    serializer_class = BookingSerializer

class BookingDetailView(generics.RetrieveAPIView):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer

    def get_object(self):
        obj = super().get_object()
        return obj

    # Optionally override to add ticket generation logic 
    # Or make a separate action/view for ticket PDF downloading
    
from django.http import HttpResponse
def download_ticket(request, pk):
    try:
        booking = Booking.objects.get(pk=pk)
    except Booking.DoesNotExist:
        return HttpResponse("Booking not found.", status=404)

    # Simplified stub for ticket download
    content = f"Ticket for Booking {booking.id}\nJourney Type: {booking.journey_type}\nPassengers: {booking.passengers.count()}"
    response = HttpResponse(content, content_type='text/plain')
    response['Content-Disposition'] = f'attachment; filename="ticket_{booking.id}.txt"'
    return response

