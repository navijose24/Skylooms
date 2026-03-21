from rest_framework.views import APIView
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

