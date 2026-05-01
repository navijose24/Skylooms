"""
config/urls.py — Central URL router for the Django backend (port 8000).
Routes:
  /api/airports/              → list all airports
  /api/flights/search/        → filter flights by source, destination, date
  /api/flights/seats/         → live seat availability for given flight IDs
  /api/flights/status/        → simulated real-time flight status
  /api/recommendations/       → hotels + cabs for a destination city
  /api/bookings/              → create booking (POST)
  /api/bookings/search/       → look up by reference + last name
  /api/bookings/<pk>/         → get booking detail
  /api/bookings/<pk>/cancel/  → cancel with time-based refund logic
  /api/bookings/<pk>/ticket/  → download ticket as plain text
  /api/auth/register|login|token/refresh → JWT auth endpoints
  /api/admin/dashboard|flights|hotels|transport|bookings|users → admin-only views
"""
from django.contrib import admin
from django.urls import path
from flights.views import FlightSearch, AirportList, FlightSeatAvailabilityView, FlightStatusView
from accommodations.views import RecommendationsView
from bookings.views import BookingCreateView, BookingDetailView, BookingSearchView, download_ticket, BookingCancelView
from rest_framework_simplejwt.views import TokenRefreshView
from core.views import RegisterView, CustomTokenObtainPairView, AnalyticsDashboardView
from core.admin_views import AdminFlightsView, AdminHotelsView, AdminTransportView, AdminBookingsView, AdminUsersView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/airports/', AirportList.as_view(), name='airport-list'),
    path('api/flights/search/', FlightSearch.as_view(), name='flight-search'),
    path('api/flights/seats/', FlightSeatAvailabilityView.as_view(), name='flight-seats'),
    path('api/flights/status/', FlightStatusView.as_view(), name='flight-status'),
    # Existing search
    path('api/recommendations/', RecommendationsView.as_view(), name='recommendations'),
    path('api/bookings/', BookingCreateView.as_view(), name='booking-create'),
    path('api/bookings/search/', BookingSearchView.as_view(), name='booking-search'),
    path('api/bookings/<int:pk>/', BookingDetailView.as_view(), name='booking-detail'),
    path('api/bookings/<int:pk>/cancel/', BookingCancelView.as_view(), name='booking-cancel'),
    path('api/bookings/<int:pk>/ticket/', download_ticket, name='download-ticket'),
    
    # Auth URLs
    path('api/auth/register/', RegisterView.as_view(), name='register'),
    path('api/auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/admin/dashboard/', AnalyticsDashboardView.as_view(), name='analytics_dashboard'),
    path('api/admin/flights/', AdminFlightsView.as_view(), name='admin_flights'),
    path('api/admin/hotels/', AdminHotelsView.as_view(), name='admin_hotels'),
    path('api/admin/transport/', AdminTransportView.as_view(), name='admin_transport'),
    path('api/admin/bookings/', AdminBookingsView.as_view(), name='admin_bookings'),
    path('api/admin/users/', AdminUsersView.as_view(), name='admin_users'),
]
# trigger reload
