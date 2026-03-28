#"to run:python -m database.seed"

import asyncio
from sqlalchemy import select
from database.connection import AsyncSessionLocal, init_db
from database.models import FlightCache, HotelCache, CabCache


# ─────────────────────────────────────────────────────────────────────────────
# SEED DATA
# ─────────────────────────────────────────────────────────────────────────────

FLIGHTS = [
    # ── Budget ───────────────────────────────────────────────────────────────
    dict(origin="BOM", destination="DEL", airline="IndiGo",
         flight_no="6E-204", depart_time="06:15", arrive_time="09:00",
         duration="2h 45m", price=3800, cabin_class="economy",
         seats_left=12, baggage="15kg", refundable=False, tier="budget"),

    dict(origin="BOM", destination="DEL", airline="Air India",
         flight_no="AI-101", depart_time="13:40", arrive_time="16:30",
         duration="2h 50m", price=5200, cabin_class="economy",
         seats_left=4, baggage="15kg", refundable=True, tier="budget"),

    dict(origin="BOM", destination="DEL", airline="SpiceJet",
         flight_no="SG-112", depart_time="20:05", arrive_time="22:55",
         duration="2h 50m", price=6900, cabin_class="economy",
         seats_left=2, baggage="15kg", refundable=False, tier="budget"),

    # ── Business ──────────────────────────────────────────────────────────────
    dict(origin="BOM", destination="DEL", airline="Vistara",
         flight_no="UK-995", depart_time="08:00", arrive_time="10:55",
         duration="2h 55m", price=16000, cabin_class="business",
         seats_left=6, baggage="30kg", refundable=True, tier="business"),

    dict(origin="BOM", destination="DEL", airline="Air India",
         flight_no="AI-801", depart_time="17:00", arrive_time="19:50",
         duration="2h 50m", price=23000, cabin_class="business",
         seats_left=3, baggage="30kg", refundable=True, tier="business"),

    # ── Luxury ────────────────────────────────────────────────────────────────
    dict(origin="BOM", destination="DXB", airline="Emirates",
         flight_no="EK-501", depart_time="03:30", arrive_time="05:45",
         duration="3h 15m", price=48000, cabin_class="first",
         seats_left=4, baggage="40kg", refundable=True, tier="luxury"),

    dict(origin="BOM", destination="DXB", airline="Qatar Airways",
         flight_no="QR-556", depart_time="10:20", arrive_time="12:35",
         duration="3h 15m", price=62000, cabin_class="first",
         seats_left=2, baggage="40kg", refundable=True, tier="luxury"),

    dict(origin="BOM", destination="DXB", airline="Vistara",
         flight_no="UK-021", depart_time="22:10", arrive_time="00:30",
         duration="3h 20m", price=75000, cabin_class="first",
         seats_left=1, baggage="40kg", refundable=True, tier="luxury"),

    # ── Goa routes ────────────────────────────────────────────────────────────
    dict(origin="BOM", destination="GOI", airline="IndiGo",
         flight_no="6E-712", depart_time="07:00", arrive_time="08:15",
         duration="1h 15m", price=3200, cabin_class="economy",
         seats_left=8, baggage="15kg", refundable=False, tier="budget"),

    dict(origin="BOM", destination="GOI", airline="Air India",
         flight_no="AI-633", depart_time="14:30", arrive_time="15:45",
         duration="1h 15m", price=5800, cabin_class="economy",
         seats_left=5, baggage="15kg", refundable=True, tier="budget"),

    dict(origin="BOM", destination="GOI", airline="Vistara",
         flight_no="UK-881", depart_time="11:00", arrive_time="12:15",
         duration="1h 15m", price=18000, cabin_class="business",
         seats_left=3, baggage="30kg", refundable=True, tier="business"),

    # ── Delhi routes ──────────────────────────────────────────────────────────
    dict(origin="DEL", destination="BOM", airline="IndiGo",
         flight_no="6E-341", depart_time="06:00", arrive_time="08:15",
         duration="2h 15m", price=4100, cabin_class="economy",
         seats_left=9, baggage="15kg", refundable=False, tier="budget"),

    dict(origin="DEL", destination="BOM", airline="Vistara",
         flight_no="UK-660", depart_time="19:00", arrive_time="21:15",
         duration="2h 15m", price=17500, cabin_class="business",
         seats_left=4, baggage="30kg", refundable=True, tier="business"),

    # ── Bangalore ─────────────────────────────────────────────────────────────
    dict(origin="BOM", destination="BLR", airline="IndiGo",
         flight_no="6E-505", depart_time="07:30", arrive_time="09:00",
         duration="1h 30m", price=2900, cabin_class="economy",
         seats_left=11, baggage="15kg", refundable=False, tier="budget"),

    dict(origin="BOM", destination="BLR", airline="Air India",
         flight_no="AI-617", depart_time="16:00", arrive_time="17:30",
         duration="1h 30m", price=4500, cabin_class="economy",
         seats_left=6, baggage="15kg", refundable=True, tier="budget"),
]


HOTELS = [
    # ── Delhi — Luxury ────────────────────────────────────────────────────────
    dict(city="Delhi", name="The Leela Palace Delhi",
         stars=5, rating=4.9, price_per_night=22000,
         amenities=["Spa", "Pool", "Fine Dining", "Concierge", "Valet"],
         tier="luxury", free_cancellation=True),

    dict(city="Delhi", name="Taj Mahal Hotel Delhi",
         stars=5, rating=4.8, price_per_night=18500,
         amenities=["Spa", "Pool", "Rooftop Bar", "Butler", "Airport Transfer"],
         tier="luxury", free_cancellation=True),

    dict(city="Delhi", name="Grand Hyatt Delhi",
         stars=5, rating=4.7, price_per_night=15000,
         amenities=["Pool", "Gym", "Spa", "Fine Dining", "Lounge"],
         tier="luxury", free_cancellation=True),

    # ── Delhi — Business ──────────────────────────────────────────────────────
    dict(city="Delhi", name="Novotel Aerocity Delhi",
         stars=4, rating=4.4, price_per_night=7500,
         amenities=["Pool", "Gym", "Business Centre", "Free Breakfast"],
         tier="business", free_cancellation=True),

    dict(city="Delhi", name="Radisson Blu Delhi",
         stars=4, rating=4.3, price_per_night=6200,
         amenities=["Pool", "Gym", "Conference Room", "Restaurant"],
         tier="business", free_cancellation=False),

    # ── Delhi — Budget ────────────────────────────────────────────────────────
    dict(city="Delhi", name="Ibis New Delhi Aerocity",
         stars=3, rating=4.1, price_per_night=3200,
         amenities=["Free WiFi", "AC", "Restaurant", "24hr Reception"],
         tier="budget", free_cancellation=False),

    dict(city="Delhi", name="Ginger Hotel Delhi",
         stars=3, rating=3.9, price_per_night=2100,
         amenities=["Free WiFi", "AC", "Hot Water", "Housekeeping"],
         tier="budget", free_cancellation=False),

    # ── Goa — Luxury ──────────────────────────────────────────────────────────
    dict(city="Goa", name="Taj Exotica Goa",
         stars=5, rating=4.9, price_per_night=28000,
         amenities=["Private Beach", "Spa", "Pool", "Fine Dining", "Butler"],
         tier="luxury", free_cancellation=True),

    dict(city="Goa", name="The Leela Goa",
         stars=5, rating=4.8, price_per_night=24000,
         amenities=["Infinity Pool", "Spa", "Beach Access", "Concierge"],
         tier="luxury", free_cancellation=True),

    # ── Goa — Business ────────────────────────────────────────────────────────
    dict(city="Goa", name="Marriott Goa",
         stars=4, rating=4.5, price_per_night=9500,
         amenities=["Pool", "Gym", "Beach View", "Restaurant"],
         tier="business", free_cancellation=True),

    # ── Goa — Budget ──────────────────────────────────────────────────────────
    dict(city="Goa", name="Ibis Goa Calangute",
         stars=3, rating=4.0, price_per_night=2800,
         amenities=["Free WiFi", "Pool", "AC", "Restaurant"],
         tier="budget", free_cancellation=False),

    # ── Mumbai ────────────────────────────────────────────────────────────────
    dict(city="Mumbai", name="Taj Mahal Palace Mumbai",
         stars=5, rating=4.9, price_per_night=32000,
         amenities=["Pool", "Spa", "Heritage View", "Fine Dining", "Butler"],
         tier="luxury", free_cancellation=True),

    dict(city="Mumbai", name="Trident Nariman Point",
         stars=5, rating=4.7, price_per_night=14000,
         amenities=["Pool", "Spa", "Sea View", "Gym", "Lounge"],
         tier="luxury", free_cancellation=True),

    dict(city="Mumbai", name="Novotel Mumbai",
         stars=4, rating=4.3, price_per_night=6800,
         amenities=["Pool", "Gym", "Business Centre", "Restaurant"],
         tier="business", free_cancellation=True),

    dict(city="Mumbai", name="Ginger Mumbai Airport",
         stars=3, rating=4.0, price_per_night=2500,
         amenities=["Free WiFi", "AC", "Restaurant", "24hr Reception"],
         tier="budget", free_cancellation=False),

    # ── Dubai ─────────────────────────────────────────────────────────────────
    dict(city="Dubai", name="Burj Al Arab",
         stars=5, rating=5.0, price_per_night=95000,
         amenities=["Private Beach", "Helipad", "Butler", "Rolls Royce Transfer",
                    "Michelin Dining", "Personal Concierge"],
         tier="luxury", free_cancellation=True),

    dict(city="Dubai", name="Atlantis The Palm",
         stars=5, rating=4.8, price_per_night=35000,
         amenities=["Waterpark", "Private Beach", "Spa", "Casino", "Fine Dining"],
         tier="luxury", free_cancellation=True),

    dict(city="Dubai", name="Marriott Dubai",
         stars=4, rating=4.4, price_per_night=12000,
         amenities=["Pool", "Gym", "Spa", "Restaurant", "City View"],
         tier="business", free_cancellation=True),

    # ── Bangalore ─────────────────────────────────────────────────────────────
    dict(city="Bangalore", name="The Leela Palace Bangalore",
         stars=5, rating=4.8, price_per_night=18000,
         amenities=["Pool", "Spa", "Fine Dining", "Concierge", "Gym"],
         tier="luxury", free_cancellation=True),

    dict(city="Bangalore", name="Marriott Whitefield",
         stars=4, rating=4.4, price_per_night=7200,
         amenities=["Pool", "Gym", "Business Centre", "Restaurant"],
         tier="business", free_cancellation=True),

    dict(city="Bangalore", name="Ibis Bangalore",
         stars=3, rating=4.1, price_per_night=2600,
         amenities=["Free WiFi", "AC", "Restaurant", "24hr Reception"],
         tier="budget", free_cancellation=False),
]


CABS = [
    # ── Budget ───────────────────────────────────────────────────────────────
    dict(city="Delhi",     vehicle="Maruti Dzire",   tier="budget",   capacity=4, base_price=350),
    dict(city="Delhi",     vehicle="Toyota Etios",   tier="budget",   capacity=4, base_price=380),
    dict(city="Mumbai",    vehicle="Maruti Dzire",   tier="budget",   capacity=4, base_price=320),
    dict(city="Mumbai",    vehicle="Hyundai Aura",   tier="budget",   capacity=4, base_price=340),
    dict(city="Goa",       vehicle="Toyota Etios",   tier="budget",   capacity=4, base_price=300),
    dict(city="Bangalore", vehicle="Maruti Dzire",   tier="budget",   capacity=4, base_price=310),
    dict(city="Dubai",     vehicle="Toyota Camry",   tier="budget",   capacity=4, base_price=1200),

    # ── Business ──────────────────────────────────────────────────────────────
    dict(city="Delhi",     vehicle="Toyota Innova Crysta", tier="business", capacity=6, base_price=1200),
    dict(city="Delhi",     vehicle="Kia Carnival",         tier="business", capacity=7, base_price=1500),
    dict(city="Mumbai",    vehicle="Toyota Innova Crysta", tier="business", capacity=6, base_price=1100),
    dict(city="Mumbai",    vehicle="Mahindra XUV700",      tier="business", capacity=5, base_price=1000),
    dict(city="Goa",       vehicle="Toyota Innova",        tier="business", capacity=6, base_price=900),
    dict(city="Bangalore", vehicle="Toyota Innova Crysta", tier="business", capacity=6, base_price=1050),
    dict(city="Dubai",     vehicle="Mercedes E-Class",     tier="business", capacity=4, base_price=3500),

    # ── Luxury ────────────────────────────────────────────────────────────────
    dict(city="Delhi",     vehicle="Mercedes S-Class",      tier="luxury", capacity=4, base_price=5000),
    dict(city="Delhi",     vehicle="BMW 7 Series",          tier="luxury", capacity=4, base_price=6000),
    dict(city="Delhi",     vehicle="Porsche Panamera",      tier="luxury", capacity=3, base_price=8000),
    dict(city="Delhi",     vehicle="Ferrari Roma (Special)",tier="luxury", capacity=2, base_price=15000),
    dict(city="Mumbai",    vehicle="Mercedes S-Class",      tier="luxury", capacity=4, base_price=5500),
    dict(city="Mumbai",    vehicle="BMW 7 Series",          tier="luxury", capacity=4, base_price=6500),
    dict(city="Mumbai",    vehicle="Rolls-Royce Ghost",     tier="luxury", capacity=4, base_price=25000),
    dict(city="Goa",       vehicle="Mercedes GLE",          tier="luxury", capacity=5, base_price=4500),
    dict(city="Bangalore", vehicle="Mercedes S-Class",      tier="luxury", capacity=4, base_price=4800),
    dict(city="Dubai",     vehicle="Rolls-Royce Phantom",   tier="luxury", capacity=4, base_price=18000),
    dict(city="Dubai",     vehicle="Bentley Continental",   tier="luxury", capacity=4, base_price=15000),
    dict(city="Dubai",     vehicle="Lamborghini Urus",      tier="luxury", capacity=4, base_price=20000),
]


# ─────────────────────────────────────────────────────────────────────────────
# SEED RUNNER
# ─────────────────────────────────────────────────────────────────────────────

async def seed():
    await init_db()

    async with AsyncSessionLocal() as db:

        # Check if already seeded
        result = await db.execute(select(FlightCache).limit(1))
        if result.scalar_one_or_none():
            print("✅  Database already seeded — skipping")
            return

        print("🌱  Seeding flights...")
        for f in FLIGHTS:
            db.add(FlightCache(**f))

        print("🌱  Seeding hotels...")
        for h in HOTELS:
            db.add(HotelCache(**h))

        print("🌱  Seeding cabs...")
        for c in CABS:
            db.add(CabCache(**c))

        await db.commit()

        # Count what was seeded
        flights_count = len(FLIGHTS)
        hotels_count  = len(HOTELS)
        cabs_count    = len(CABS)

        print(f"✅  Seeded {flights_count} flights")
        print(f"✅  Seeded {hotels_count} hotels")
        print(f"✅  Seeded {cabs_count} cabs")
        print("🚀  Database ready for use")


if __name__ == "__main__":
    asyncio.run(seed())