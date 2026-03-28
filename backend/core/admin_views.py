from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from flights.models import Flight
from accommodations.models import Hotel
from cabs.models import Cab
from bookings.models import Booking
from django.contrib.auth.models import User

class AdminFlightsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not hasattr(request.user, 'profile') or request.user.profile.role != 'admin':
            return Response({"error": "Admin required"}, status=403)
            
        # Get real flights if exist
        flights = []
        flight_objs = Flight.objects.all()[:10]
        
        if flight_objs.exists():
            for f in flight_objs:
                bookings = Booking.objects.filter(flight_id=f.id)
                passengers = []
                for b in bookings:
                    passengers.append({"name": b.user_email, "id": b.id})
                
                flights.append({
                    "id": f.flight_number,
                    "name": f.airline,
                    "time": str(f.departure_time),
                    "totalSeats": f.available_seats + len(passengers), # Mocked total
                    "bookedSeats": len(passengers),
                    "remainingSeats": f.available_seats,
                    "passengers": passengers
                })
        else:
            flights = [
                { "id": 'FL-902', "name": 'SkyBlue Airlines - NY to LA', "time": '10:30 AM, 25 Aug', "totalSeats": 200, "bookedSeats": 180, "remainingSeats": 20, "passengers": [{"name": 'navaneetha004@gmail.com', "id": 1}, {"name": 'John Doe', "id": 2}] },
                { "id": 'FL-714', "name": 'Oceanic Air - London to Paris', "time": '02:15 PM, 26 Aug', "totalSeats": 150, "bookedSeats": 150, "remainingSeats": 0, "passengers": [{"name": 'Jane Smith', "id": 3}, {"name": 'Alice Cooper', "id": 4}] }
            ]

        return Response({"flights": flights})


class AdminHotelsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not hasattr(request.user, 'profile') or request.user.profile.role != 'admin':
            return Response({"error": "Admin required"}, status=403)
            
        hotels = []
        hotel_objs = Hotel.objects.all()[:10]
        
        if hotel_objs.exists():
            for h in hotel_objs:
                reservations = Booking.objects.filter(hotel_id=h.id).count() if hasattr(Booking, 'hotel_id') else 0
                hotels.append({
                    "name": h.name,
                    "reservations": reservations,
                    "checkinTime": "14:00",
                    "checkoutTime": "11:00",
                    "location": h.location
                })
        else:
            hotels = [
                { "name": 'Grand Plaza Resort', "reservations": 45, "checkinTime": '14:00', "checkoutTime": '11:00', "location": 'Malibu, CA' },
                { "name": 'City Center Inn', "reservations": 120, "checkinTime": '15:00', "checkoutTime": '12:00', "location": 'New York, NY' }
            ]

        return Response({"hotels": hotels})


class AdminTransportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not hasattr(request.user, 'profile') or request.user.profile.role != 'admin':
            return Response({"error": "Admin required"}, status=403)
            
        transports = []
        cab_objs = Cab.objects.all()[:10]
        
        if cab_objs.exists():
            for c in cab_objs:
                transports.append({
                    "id": f"TR-{c.id}",
                    "cabDetails": f"{c.type} - {c.max_passengers} seats",
                    "pickupTime": "N/A",
                    "user": "N/A",
                    "status": "Available"
                })
        else:
            transports = [
                { "id": 'TR-001', "cabDetails": 'Toyota Prius (Hybrid) - AB-123', "pickupTime": '08:30 AM, 25 Aug', "user": 'navaneetha004@gmail.com', "status": 'Assigned' },
                { "id": 'TR-002', "cabDetails": 'Honda Accord - XY-987', "pickupTime": '11:45 AM, 26 Aug', "user": 'John Doe', "status": 'Pending' }
            ]

        return Response({"transports": transports})


class AdminBookingsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not hasattr(request.user, 'profile') or request.user.profile.role != 'admin':
            return Response({"error": "Admin required"}, status=403)
            
        bookings = []
        booking_objs = Booking.objects.all().order_by('-created_at')[:20]
        
        if booking_objs.exists():
            for b in booking_objs:
                bookings.append({
                    "ref": b.reference_number,
                    "type": "Booking Package",
                    "user": b.user_email,
                    "status": b.status,
                    "amount": f"${b.total_price}",
                    "items": [f"Booking Items ({b.reference_number})"]
                })
        else:
            bookings = [
                { "ref": 'BKG-9001', "type": 'Flight + Hotel', "user": 'navaneetha004@gmail.com', "status": 'Confirmed', "amount": '$1500', "items": ['Flight FL-902', 'Grand Plaza Resort'] },
                { "ref": 'BKG-8812', "type": 'Transport Only', "user": 'johndoe@gmail.com', "status": 'Cancelled', "amount": '$45', "items": ['Cab Transfer (Honda Accord)'] }
            ]

        return Response({"bookings": bookings})


class AdminUsersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not hasattr(request.user, 'profile') or request.user.profile.role != 'admin':
            return Response({"error": "Admin required"}, status=403)
            
        usersList = []
        users = User.objects.all()[:20]
        
        for u in users:
            b_count = Booking.objects.filter(user_email=u.email).count()
            usersList.append({
                "email": u.email,
                "role": 'admin' if (hasattr(u, 'profile') and u.profile.role == 'admin') else 'user',
                "paidTransactions": b_count,
                "totalSpent": f"${b_count * 150}.00",
                "flightId": f"FL-{u.id}",
                "cabId": "None",
                "hotel": "None",
                "status": "Confirmed" if b_count > 0 else "Active"
            })
            
        if not usersList:
            usersList = [
                { "email": 'navaneetha004@gmail.com', "role": 'admin', "paidTransactions": 5, "totalSpent": '$4500.00', "flightId": 'FL-902', "cabId": 'TR-001', "hotel": 'City Center Inn', "status": 'Confirmed' }
            ]

        return Response({"usersList": usersList})
