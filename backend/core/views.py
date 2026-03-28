from django.contrib.auth.models import User
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from django.db.models import Sum
from .serializers import UserSerializer, CustomTokenObtainPairSerializer
from bookings.models import Booking
from flights.models import Flight
from accommodations.models import Hotel
from cabs.models import Cab

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = UserSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                "user": UserSerializer(user).data,
                "message": "User registered successfully."
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class AnalyticsDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not hasattr(request.user, 'profile') or request.user.profile.role != 'admin':
            return Response({"error": "Forbidden. Admin access required."}, status=status.HTTP_403_FORBIDDEN)
            
        total_bookings = Booking.objects.count()
        total_flights = Flight.objects.count()
        
        # Financial logic based on the most recent 10 transactions only
        recent_ids = Booking.objects.order_by('-created_at')[:10].values_list('id', flat=True)
        recent_queryset = Booking.objects.filter(id__in=list(recent_ids))
        
        gross_revenue = float(recent_queryset.aggregate(Sum('total_price'))['total_price__sum'] or 0)
        total_refunds = float(recent_queryset.aggregate(Sum('refund_amount'))['refund_amount__sum'] or 0)
        # Using the user's specific logic: Total - Refunds = Net
        net_revenue = gross_revenue - total_refunds
        
        total_hotels = Hotel.objects.count()

        recent_bookings = Booking.objects.order_by('-created_at')[:10].values(
            'reference_number', 'user_email', 'total_price', 'status', 'created_at'
        )

        return Response({
            "total_bookings": total_bookings,
            "total_flights": total_flights,
            "gross_revenue": gross_revenue,
            "total_refunds": total_refunds,
            "net_revenue": net_revenue,
            "total_hotels": total_hotels,
            "recent_bookings": list(recent_bookings),
        })
