# check_finance.py — Financial summary script.
# Run with: python check_finance.py (must be executed inside Django shell context or after setup)
# Prints gross revenue, refunds, confirmed/cancelled totals, and net revenue from the Bookings table.

from bookings.models import Booking
from django.db.models import Sum

total_count = Booking.objects.count()
gross_total = Booking.objects.aggregate(Sum('total_price'))['total_price__sum'] or 0
refund_total = Booking.objects.aggregate(Sum('refund_amount'))['refund_amount__sum'] or 0
confirmed_total = Booking.objects.filter(status='confirmed').aggregate(Sum('total_price'))['total_price__sum'] or 0
cancelled_total = Booking.objects.filter(status='cancelled').aggregate(Sum('total_price'))['total_price__sum'] or 0

print(f"Total Count: {total_count}")
print(f"Gross Total (Total Price All): {gross_total}")
print(f"Refund Total (Refund Amount All): {refund_total}")
print(f"Confirmed Total Price: {confirmed_total}")
print(f"Cancelled Total Price: {cancelled_total}")
print(f"Net (Gross - Refund): {gross_total - refund_total}")
