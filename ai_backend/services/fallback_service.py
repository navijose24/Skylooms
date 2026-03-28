# backend/services/fallback_service.py

import random
import hashlib
from datetime import datetime, timedelta
from typing import Optional


def _seed_from_string(*args) -> int:
    """
    Consistent seed from inputs so same route always
    returns same mock flights. Avoids confusing price changes on refresh.
    """
    combined = "_".join(str(a).lower() for a in args)
    return int(hashlib.md5(combined.encode()).hexdigest(), 16) % (10 ** 8)


class FallbackService:

    # ─────────────────────────────────────────────
    # FLIGHTS
    # ─────────────────────────────────────────────

    @staticmethod
    def get_mock_flights(
        origin:      str,
        destination: str,
        depart_date: Optional[str] = None,
        passengers:  int = 1,
        tier:        str = "budget",
    ) -> dict:
        origin      = (origin      or "BOM").upper()
        destination = (destination or "DEL").upper()
        rng = random.Random(_seed_from_string(origin, destination, depart_date, tier))

        if tier == "luxury":
            airlines    = [("Emirates", "EK"), ("Qatar Airways", "QR"), ("Vistara", "UK")]
            base_prices = [45000, 58000, 72000]
        elif tier == "business":
            airlines    = [("Air India", "AI"), ("Vistara", "UK"), ("IndiGo", "6E")]
            base_prices = [15000, 22000, 28000]
        else:
            airlines    = [("IndiGo", "6E"), ("Air India", "AI"), ("SpiceJet", "SG")]
            base_prices = [3800, 5200, 6900]

        depart_slots   = ["06:15", "13:40", "20:05"]
        durations_min  = [165, 175, 180]
        statuses       = ["AVAILABLE", "FILLING FAST", "LAST 2 SEATS"]

        flights = []
        for i in range(3):
            airline_name, code = airlines[i]
            flight_no          = f"{code}-{rng.randint(100, 999)}"
            d_h, d_m           = map(int, depart_slots[i].split(":"))
            total_min          = d_h * 60 + d_m + durations_min[i]
            arrive_h, arrive_m = divmod(total_min, 60)
            arrive_str         = f"{arrive_h % 24:02d}:{arrive_m:02d}"
            dur_h, dur_m       = divmod(durations_min[i], 60)

            flights.append({
                "flight_id":      f"FL-{rng.randint(10000, 99999)}",
                "flight_no":      flight_no,
                "airline":        airline_name,
                "origin":         origin,
                "destination":    destination,
                "depart_time":    depart_slots[i],
                "arrive_time":    arrive_str,
                "duration":       f"{dur_h}h {dur_m}m",
                "depart_date":    depart_date or datetime.today().strftime("%Y-%m-%d"),
                "passengers":     passengers,
                "price_inr":      base_prices[i] * passengers,
                "price_per_pax":  base_prices[i],
                "class":          tier.capitalize(),
                "seats_left":     rng.randint(2, 18),
                "status":         statuses[i],
                "tier":           tier,
                "baggage":        "15kg + 7kg cabin" if tier == "budget" else "30kg + 15kg cabin",
                "refundable":     tier != "budget",
                "personalized":   False,
                "special_requests": [],
            })

        return {
            "status": "success",
            "source": "fallback_mock",
            "notice": "Live prices unavailable — showing estimated fares.",
            "data":   flights,
        }

    # ─────────────────────────────────────────────
    # HOTELS
    # ─────────────────────────────────────────────

    @staticmethod
    def get_mock_hotels(
        location:  str,
        check_in:  Optional[str] = None,
        check_out: Optional[str] = None,
        tier:      str = "budget",
    ) -> dict:
        rng = random.Random(_seed_from_string(location, tier))

        if tier == "luxury":
            hotels        = [
                {"name": "The Leela Palace",      "stars": 5},
                {"name": "Grand Hyatt",            "stars": 5},
                {"name": "Taj Hotel & Convention", "stars": 5},
            ]
            price_range   = (12000, 35000)
            rating_range  = (4.5, 5.0)
            amenities_pool= ["Spa", "Infinity Pool", "Fine Dining",
                             "Airport Transfer", "Butler Service", "Rooftop Bar"]
        elif tier == "business":
            hotels        = [
                {"name": "Marriott",     "stars": 4},
                {"name": "Novotel",      "stars": 4},
                {"name": "Radisson Blu", "stars": 4},
            ]
            price_range   = (5000, 11000)
            rating_range  = (4.0, 4.6)
            amenities_pool= ["Pool", "Gym", "Business Centre",
                             "Free Breakfast", "Airport Shuttle"]
        else:
            hotels        = [
                {"name": "Ibis",          "stars": 3},
                {"name": "Ginger Hotel",  "stars": 3},
                {"name": "OYO Townhouse", "stars": 2},
            ]
            price_range   = (1200, 3800)
            rating_range  = (3.5, 4.3)
            amenities_pool= ["Free WiFi", "AC", "Hot Water",
                             "Daily Housekeeping", "24hr Reception"]

        ci = check_in  or datetime.today().strftime("%Y-%m-%d")
        co = check_out or (datetime.today() + timedelta(days=2)).strftime("%Y-%m-%d")

        try:
            nights = (
                datetime.strptime(co, "%Y-%m-%d") -
                datetime.strptime(ci, "%Y-%m-%d")
            ).days
            nights = max(nights, 1)
        except Exception:
            nights = 1

        results = []
        for h in hotels:
            price_night = rng.randint(*price_range)
            rating      = round(rng.uniform(*rating_range), 1)
            amenities   = rng.sample(amenities_pool, k=min(4, len(amenities_pool)))

            results.append({
                "hotel_id":         f"HTL-{rng.randint(1000, 9999)}",
                "name":             f"{h['name']} {location.title()}",
                "location":         location.title(),
                "stars":            h["stars"],
                "rating":           rating,
                "price_per_night":  price_night,
                "total_price":      price_night * nights,
                "nights":           nights,
                "check_in":         ci,
                "check_out":        co,
                "amenities":        amenities,
                "tier":             tier,
                "free_cancellation": tier != "budget",
            })

        return {
            "status": "success",
            "source": "fallback_mock",
            "notice": "Live availability unavailable — showing estimated rates.",
            "data":   results,
        }

    # ─────────────────────────────────────────────
    # CABS
    # ─────────────────────────────────────────────

    @staticmethod
    def get_mock_cabs(
        pickup:  str,
        dropoff: str = "",
        tier:    str = "budget",
    ) -> dict:
        rng = random.Random(_seed_from_string(pickup, dropoff, tier))

        if tier == "luxury":
            vehicles = [
                {"name": "Mercedes S-Class",       "capacity": 4, "base": 5000},
                {"name": "BMW 7 Series",            "capacity": 4, "base": 6000},
                {"name": "Porsche Panamera",        "capacity": 3, "base": 8000},
                {"name": "Ferrari Roma (Special)",  "capacity": 2, "base": 15000},
            ]
        elif tier == "business":
            vehicles = [
                {"name": "Toyota Innova Crysta", "capacity": 6, "base": 1200},
                {"name": "Kia Carnival",         "capacity": 7, "base": 1500},
                {"name": "Mahindra XUV700",      "capacity": 5, "base": 1000},
            ]
        else:
            vehicles = [
                {"name": "Maruti Dzire",  "capacity": 4, "base": 350},
                {"name": "Toyota Etios", "capacity": 4, "base": 380},
                {"name": "Hyundai Aura", "capacity": 4, "base": 360},
            ]

        results = []
        for v in vehicles[:3]:
            results.append({
                "cab_id":       f"CAB-{rng.randint(100, 999)}",
                "vehicle":      v["name"],
                "capacity":     v["capacity"],
                "pickup":       pickup,
                "dropoff":      dropoff or "destination",
                "eta_minutes":  rng.randint(4, 18),
                "price_inr":    v["base"] + rng.randint(-50, 200),
                "tier":         tier,
                "driver_rated": round(rng.uniform(3.8, 5.0), 1),
            })

        return {
            "status": "success",
            "source": "fallback_mock",
            "notice": "Live cab availability unavailable — showing estimates.",
            "data":   results,
        }

    # ─────────────────────────────────────────────
    # BOOKINGS
    # ─────────────────────────────────────────────

    @staticmethod
    def create_mock_booking(
        booking_type: str,
        item_id:      str,
        user_id:      str,
        passengers:   int = 1,
        extra:        dict = None,
    ) -> dict:
        rng         = random.Random(_seed_from_string(item_id, user_id))
        prefix      = {"flight": "BK", "hotel": "HT", "cab": "CB"}.get(booking_type, "BK")
        booking_ref = f"{prefix}-{rng.randint(1000000, 9999999)}"
        pnr         = "".join(rng.choices("ABCDEFGHJKLMNPQRSTUVWXYZ", k=6))

        return {
            "status":       "confirmed",
            "source":       "fallback_mock",
            "booking_ref":  booking_ref,
            "pnr":          pnr,
            "booking_type": booking_type,
            "item_id":      item_id,
            "passengers":   passengers,
            "booked_at":    datetime.utcnow().isoformat(),
            "notice":       "Booking confirmed in demo mode. Real ticket issued when live systems restore.",
            **(extra or {}),
        }

    # ─────────────────────────────────────────────
    # CANCELLATIONS
    # ─────────────────────────────────────────────

    @staticmethod
    def cancel_mock_booking(
        booking_ref: str,
        reason:      str = "user_requested",
    ) -> dict:
        refund_rules = {
            "user_requested":   {"refund_pct": 80,  "label": "Standard cancellation"},
            "flight_cancelled": {"refund_pct": 100, "label": "Full refund — carrier cancelled"},
            "medical":          {"refund_pct": 90,  "label": "Medical waiver applied"},
            "no_show":          {"refund_pct": 0,   "label": "No refund — no-show policy"},
        }
        rule = refund_rules.get(reason, refund_rules["user_requested"])

        return {
            "status":          "cancelled",
            "source":          "fallback_mock",
            "booking_ref":     booking_ref,
            "cancellation_id": f"CXL-{random.randint(100000, 999999)}",
            "reason":          reason,
            "refund_percent":  rule["refund_pct"],
            "refund_label":    rule["label"],
            "refund_eta_days": 5 if rule["refund_pct"] > 0 else 0,
            "cancelled_at":    datetime.utcnow().isoformat(),
            "notice":          "Cancellation processed in demo mode.",
        }

    # ─────────────────────────────────────────────
    # HEALTH HELPER
    # ─────────────────────────────────────────────

    @staticmethod
    def get_fallback_reason() -> str:
        return "Live APIs unavailable — serving mock data"

    # ─────────────────────────────────────────────
    # PERSONALIZED FALLBACK  ← the key addition
    # ─────────────────────────────────────────────

    @staticmethod
    def get_personalized_fallback(
        message:      str,
        session,
        user_profile: dict = None,
    ) -> dict:
        """
        Profile-aware fallback. Even when Gemini is completely down,
        wealthy users get Mercedes + Leela Palace.
        Budget users get Maruti + OYO.
        The personalization never breaks regardless of API status.
        """
        msg_lower    = message.lower()
        tool_results = {}
        profile      = user_profile or {}

        # ── Read wealth signals from profile ─────────────────────────────────
        wealth       = profile.get("wealth_signal",           "budget")
        cab_pref     = profile.get("cab_preference",          "budget")
        hotel_stars  = profile.get("preferred_hotel_stars",   3)
        special_reqs = profile.get("special_requests",        [])
        pref_class   = profile.get("preferred_class",         "economy")

        origin = getattr(session, "origin",      "BOM")
        dest   = getattr(session, "destination", "DEL")

        # ── Map wealth → tier ─────────────────────────────────────────────────
        tier_map = {
            "ultra":       "luxury",
            "wealthy":     "luxury",
            "comfortable": "business",
            "budget":      "budget",
        }
        tier = tier_map.get(
            wealth,
            getattr(session, "travel_style", "budget")
        )

        # ── Flight tier — respect preferred class ─────────────────────────────
        class_to_tier = {
            "first":    "luxury",
            "business": "business",
            "economy":  "budget",
        }
        flight_tier = class_to_tier.get(pref_class, tier)

        # ── Build results based on message intent ─────────────────────────────
        if any(w in msg_lower for w in
               ["flight", "fly", "ticket", "travel", "trip", "go to"]):
            flights = FallbackService.get_mock_flights(
                origin      = origin,
                destination = dest,
                depart_date = getattr(session, "depart_date", None),
                passengers  = getattr(session, "passengers",  1),
                tier        = flight_tier,
            )
            # Inject special requests into every flight result
            if special_reqs and flights.get("data"):
                for f in flights["data"]:
                    f["special_requests"] = special_reqs
                    f["personalized"]     = True

            tool_results["search_flights"] = flights

        if any(w in msg_lower for w in
               ["hotel", "stay", "room", "accommodation", "night", "check in"]):
            hotel_tier = "luxury" if hotel_stars >= 5 else tier
            tool_results["search_hotels"] = FallbackService.get_mock_hotels(
                location  = dest,
                check_in  = getattr(session, "depart_date", None),
                check_out = getattr(session, "return_date",  None),
                tier      = hotel_tier,
            )

        if any(w in msg_lower for w in
               ["cab", "taxi", "transfer", "pickup", "drop", "car", "ride"]):
            tool_results["search_cabs"] = FallbackService.get_mock_cabs(
                pickup  = f"{dest} Airport",
                dropoff = f"{dest} City Centre",
                tier    = cab_pref,   # ← their personal cab preference always
            )

        if any(w in msg_lower for w in ["cancel", "cancellation", "refund"]):
            tool_results["cancel_info"] = {
                "message": (
                    "Please share your booking reference (BK-XXXXXXX) "
                    "and I'll process the cancellation right away."
                )
            }

        if any(w in msg_lower for w in ["book", "confirm", "reserve"]):
            tool_results["booking_info"] = {
                "message": "Please select from the options above to confirm your booking."
            }

        # Default — always return something useful
        if not tool_results:
            tool_results["search_flights"] = FallbackService.get_mock_flights(
                origin, dest, tier=flight_tier
            )

        # ── Personalized reply tone based on wealth ───────────────────────────
        reply_map = {
            "ultra":       (
                "Our premium systems are briefly offline. "
                "I've curated our finest exclusive options for you:"
            ),
            "wealthy":     (
                "Running on backup systems. "
                "Here are our finest available options tailored to your preferences:"
            ),
            "comfortable": (
                "Experiencing brief turbulence. "
                "Here are the best options I found for you:"
            ),
            "budget":      (
                "Running on backup systems. "
                "Here are the best value options available:"
            ),
        }

        return {
            "reply":           reply_map.get(wealth, reply_map["budget"]),
            "tool_calls":      [{"tool": k, "args": {}} for k in tool_results],
            "tool_results":    tool_results,
            "entities":        {},
            "fallback_used":   True,
            "fallback_reason": "AI temporarily unavailable — personalised demo data shown",
        }


# ── Quick test ────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import json
    from dataclasses import dataclass

    @dataclass
    class MockSession:
        origin:       str = "BOM"
        destination:  str = "DEL"
        depart_date:  str = "2025-04-10"
        return_date:  str = "2025-04-13"
        passengers:   int = 2
        travel_style: str = "budget"

    session = MockSession()

    wealthy_profile = {
        "wealth_signal":           "ultra",
        "cab_preference":          "luxury",
        "preferred_hotel_stars":   5,
        "preferred_class":         "first",
        "special_requests":        ["window seat", "veg meal"],
    }

    budget_profile = {
        "wealth_signal":           "budget",
        "cab_preference":          "budget",
        "preferred_hotel_stars":   3,
        "preferred_class":         "economy",
        "special_requests":        [],
    }

    print("=== WEALTHY USER ===")
    result = FallbackService.get_personalized_fallback(
        "find me a flight to goa", session, wealthy_profile
    )
    print("Reply:", result["reply"])
    flights = result["tool_results"].get("search_flights", {}).get("data", [])
    if flights:
        print("First flight:", flights[0]["airline"],
              flights[0]["class"], "₹" + str(flights[0]["price_inr"]))

    print("\n=== BUDGET USER ===")
    result = FallbackService.get_personalized_fallback(
        "find me a flight to goa", session, budget_profile
    )
    print("Reply:", result["reply"])
    flights = result["tool_results"].get("search_flights", {}).get("data", [])
    if flights:
        print("First flight:", flights[0]["airline"],
              flights[0]["class"], "₹" + str(flights[0]["price_inr"]))

    print("\n=== CAB TEST (wealthy = Ferrari) ===")
    result = FallbackService.get_personalized_fallback(
        "i need a cab from the airport", session, wealthy_profile
    )
    cabs = result["tool_results"].get("search_cabs", {}).get("data", [])
    for c in cabs:
        print(" →", c["vehicle"], "₹" + str(c["price_inr"]))