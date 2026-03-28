# chatbot/services/profile_engine.py

import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database.connection import AsyncSessionLocal
from database import crud


class ProfileEngine:
    """
    The personalization brain.
    Every call to get_user_context() builds a rich profile string
    that gets injected into Gemini's system prompt.
    This is what makes the chatbot feel like a premium concierge
    that already knows the user — their wealth tier, preferences,
    travel history, special requests, everything.
    """

    # ─────────────────────────────────────────────────────────────────────
    # GET PROFILE DICT  (called from routes/chat.py)
    # ─────────────────────────────────────────────────────────────────────

    @staticmethod
    async def get_profile_dict(user_id: int) -> dict:
        """
        Returns profile as a plain dict.
        Safe to call — returns empty dict if anything fails.
        """
        try:
            async with AsyncSessionLocal() as db:
                return await crud.get_profile_dict(user_id, db)
        except Exception as e:
            print(f"[ProfileEngine] Could not load profile for {user_id}: {e}")
            return {}

    # ─────────────────────────────────────────────────────────────────────
    # LEARN FROM MESSAGE  (called on every user message)
    # ─────────────────────────────────────────────────────────────────────

    @staticmethod
    async def learn_from_message(user_id: int, message: str) -> None:
        """
        Passively learns from what the user says.
        Runs silently — never blocks the chat response.

        Examples of what it learns:
          'I prefer window seat'           → stores as special request forever
          'looking for something premium'  → upgrades wealth signal
          'travelling with my kids'        → sets family flag
          'it's a business trip'           → sets corporate flag
          'I love Emirates'                → adds to preferred airlines
          'Ferrari if possible'            → sets cab_preference to luxury
        """
        try:
            async with AsyncSessionLocal() as db:
                await crud.learn_from_message(user_id, db, message)
        except Exception as e:
            print(f"[ProfileEngine] learn_from_message error: {e}")

    # ─────────────────────────────────────────────────────────────────────
    # UPDATE FROM BOOKING  (called after every confirmed booking)
    # ─────────────────────────────────────────────────────────────────────

    @staticmethod
    async def update_from_booking(user_id: int, booking: dict) -> None:
        """
        Updates the profile after every booking so the next
        recommendation is smarter than the last.

        What it learns:
          - Rolling average flight spend → re-infers wealth signal
          - Destination history          → knows favourite cities
          - Hotel stars booked           → learns star preference
          - Hotel chain booked           → learns chain preference
          - Vehicle booked               → learns cab preference
          - Booking counts               → sets always_books_hotel/cab flags
        """
        try:
            async with AsyncSessionLocal() as db:
                await crud.update_profile_from_booking(user_id, db, booking)
        except Exception as e:
            print(f"[ProfileEngine] update_from_booking error: {e}")

    # ─────────────────────────────────────────────────────────────────────
    # INFER WEALTH SIGNAL  (called standalone when needed)
    # ─────────────────────────────────────────────────────────────────────

    @staticmethod
    def infer_wealth(avg_spend: float) -> str:
        """
        Maps average flight spend to wealth signal.
        This drives the Ferrari vs Maruti decision.

        ultra       → > ₹80,000 avg   → Ferrari, Rolls-Royce, Presidential Suite
        wealthy     → > ₹35,000 avg   → Mercedes, BMW, Taj / Leela 5-star
        comfortable → > ₹12,000 avg   → Business class, 4-star, Innova
        budget      → ≤ ₹12,000 avg   → Economy, 3-star, Maruti
        """
        if not avg_spend:
            return "budget"
        if avg_spend > 80000:
            return "ultra"
        if avg_spend > 35000:
            return "wealthy"
        if avg_spend > 12000:
            return "comfortable"
        return "budget"

    # ─────────────────────────────────────────────────────────────────────
    # BUILD RECOMMENDATION CONTEXT  (the full summary string for Gemini)
    # ─────────────────────────────────────────────────────────────────────

    @staticmethod
    def build_recommendation_context(profile: dict) -> str:
        """
        Builds a human-readable recommendation summary from the profile.
        This is injected into every Gemini prompt so the AI
        always knows exactly what to recommend without being asked.

        Called by gemini_service._build_system_prompt()
        """
        if not profile:
            return "No passenger profile available yet."

        wealth       = profile.get("wealth_signal",           "budget")
        cab_pref     = profile.get("cab_preference",          "budget")
        hotel_stars  = profile.get("preferred_hotel_stars",   3)
        airlines     = profile.get("preferred_airlines",      [])
        chains       = profile.get("preferred_hotel_chains",  [])
        special_reqs = profile.get("special_requests",        [])
        is_corp      = profile.get("is_corp_traveller",       False)
        has_family   = profile.get("has_family",              False)
        avg_spend    = profile.get("avg_flight_spend",        0)
        last_dests   = profile.get("last_destinations",       [])
        total_trips  = profile.get("total_bookings",          0)
        always_hotel = profile.get("always_books_hotel",      False)
        always_cab   = profile.get("always_books_cab",        False)
        name         = profile.get("name",                    "Passenger")

        # ── Wealth-based recommendation rules ─────────────────────────────
        wealth_rules = {
            "ultra": (
                "TIER: ULTRA PREMIUM\n"
                "- NEVER show economy or standard options.\n"
                "- Flights: first class or private. Emirates/Qatar/Vistara First only.\n"
                "- Hotels: 5-star minimum. Burj Al Arab, Aman, Four Seasons, Taj Palace.\n"
                "- Cabs: Ferrari, Rolls-Royce, Bentley. Mercedes S-Class is the minimum.\n"
                "- Never mention price as a concern. Never caveat cost.\n"
                "- Address with quiet confidence. No budget options ever."
            ),
            "wealthy": (
                "TIER: PREMIUM\n"
                "- Default to business class. Offer first class as upgrade.\n"
                "- Hotels: 5-star preferred. Taj, Leela, Hyatt, Four Seasons.\n"
                "- Cabs: Mercedes S-Class, BMW 7 Series minimum.\n"
                "  Mention Ferrari/Porsche as special option.\n"
                "- Never lead with cheapest option."
            ),
            "comfortable": (
                "TIER: BUSINESS/COMFORT\n"
                "- Default to business class. Show economy as budget alternative.\n"
                "- Hotels: 4-star preferred. Marriott, Radisson, Novotel.\n"
                "- Cabs: Toyota Innova, Kia Carnival, executive sedans.\n"
                + ("- Likely corporate. Mention company billing for high amounts."
                   if is_corp else "")
            ),
            "budget": (
                "TIER: VALUE\n"
                "- Show best value options first. Economy class.\n"
                "- Hotels: 2-3 star, clean and well-rated. Ibis, Ginger, OYO.\n"
                "- Cabs: standard hatchbacks. Maruti Dzire, Toyota Etios.\n"
                "- Mention savings and deals where possible."
            ),
        }

        lines = [
            f"PASSENGER: {name}",
            f"Total trips: {total_trips}",
            f"Avg spend: ₹{int(avg_spend):,}" if avg_spend else "Avg spend: new user",
            "",
            wealth_rules.get(wealth, wealth_rules["budget"]),
            "",
        ]

        if airlines:
            lines.append(f"Preferred airlines: {', '.join(airlines)} — show these first.")
        if chains:
            lines.append(f"Preferred hotel chains: {', '.join(chains)} — show these first.")
        if special_reqs:
            lines.append(f"Always apply: {', '.join(special_reqs)} — never ask, just include.")
        if always_hotel:
            lines.append("Always books hotel — proactively include hotels for every trip.")
        if always_cab:
            lines.append("Always books cab — proactively include cabs for every trip.")
        if has_family:
            lines.append("Family traveller — consider family rooms, adjoining seats, child amenities.")
        if is_corp:
            lines.append("Corporate traveller — prioritise flexible/refundable options.")
        if last_dests:
            lines.append(f"Recent trips: {', '.join(last_dests[-5:])}.")

        return "\n".join(lines)

    # ─────────────────────────────────────────────────────────────────────
    # GET OR CREATE SESSION  (called from routes/chat.py)
    # ─────────────────────────────────────────────────────────────────────

    @staticmethod
    async def get_or_create_session(
        user_id:    int,
        session_id: str = None,
    ):
        """
        Returns a TravelSession-like object from the database.
        Compatible with gemini_service which reads session attributes.
        """
        try:
            async with AsyncSessionLocal() as db:
                return await crud.get_or_create_session(db, user_id, session_id)
        except Exception as e:
            print(f"[ProfileEngine] get_or_create_session error: {e}")
            return _FallbackSession(user_id=user_id)

    # ─────────────────────────────────────────────────────────────────────
    # SAVE SESSION ENTITIES  (called after Gemini extracts travel details)
    # ─────────────────────────────────────────────────────────────────────

    @staticmethod
    async def save_session_entities(session, entities: dict) -> None:
        """
        Syncs extracted travel entities (origin, destination, dates)
        back to the database session row.
        """
        try:
            async with AsyncSessionLocal() as db:
                await crud.update_session_entities(db, session, entities)
        except Exception as e:
            print(f"[ProfileEngine] save_session_entities error: {e}")

    # ─────────────────────────────────────────────────────────────────────
    # SAVE MESSAGES  (called after every chat turn)
    # ─────────────────────────────────────────────────────────────────────

    @staticmethod
    async def save_message(
        session_id: str,
        role:       str,
        content:    str,
        intent:     str  = None,
        tool_calls: list = None,
    ) -> None:
        try:
            async with AsyncSessionLocal() as db:
                await crud.add_message(
                    db         = db,
                    session_id = session_id,
                    role       = role,
                    content    = content,
                    intent     = intent,
                    tool_calls = tool_calls or [],
                )
        except Exception as e:
            print(f"[ProfileEngine] save_message error: {e}")

    # ─────────────────────────────────────────────────────────────────────
    # GET HISTORY  (called to build Gemini conversation context)
    # ─────────────────────────────────────────────────────────────────────

    @staticmethod
    async def get_history(session_id: str, limit: int = 10) -> list[dict]:
        try:
            async with AsyncSessionLocal() as db:
                return await crud.get_session_history(db, session_id, limit)
        except Exception as e:
            print(f"[ProfileEngine] get_history error: {e}")
            return []

    # ─────────────────────────────────────────────────────────────────────
    # LIST SESSIONS  (for chat history sidebar)
    # ─────────────────────────────────────────────────────────────────────

    @staticmethod
    async def list_sessions(user_id: int) -> list[dict]:
        try:
            async with AsyncSessionLocal() as db:
                return await crud.list_user_sessions(db, user_id)
        except Exception as e:
            print(f"[ProfileEngine] list_sessions error: {e}")
            return []

    # ─────────────────────────────────────────────────────────────────────
    # DELETE SESSION
    # ─────────────────────────────────────────────────────────────────────

    @staticmethod
    async def delete_session(session_id: str, user_id: int) -> bool:
        try:
            async with AsyncSessionLocal() as db:
                return await crud.delete_session(db, session_id, user_id)
        except Exception as e:
            print(f"[ProfileEngine] delete_session error: {e}")
            return False

    # ─────────────────────────────────────────────────────────────────────
    # SAVE BOOKING  (called after booking confirmed)
    # ─────────────────────────────────────────────────────────────────────

    @staticmethod
    async def save_booking(
        user_id:      int,
        booking_type: str,
        booking_ref:  str,
        pnr:          str   = None,
        total_price:  float = None,
        raw_data:     dict  = None,
        origin:       str   = None,
        destination:  str   = None,
        depart_date:  str   = None,
        return_date:  str   = None,
        passengers:   int   = 1,
    ) -> dict:
        """
        Saves booking to DB and triggers profile update.
        Returns the saved booking as a dict.
        """
        try:
            async with AsyncSessionLocal() as db:
                booking = await crud.create_booking(
                    db           = db,
                    user_id      = user_id,
                    booking_type = booking_type,
                    booking_ref  = booking_ref,
                    pnr          = pnr,
                    total_price  = total_price,
                    raw_data     = raw_data or {},
                    origin       = origin,
                    destination  = destination,
                    depart_date  = depart_date,
                    return_date  = return_date,
                    passengers   = passengers,
                )
                return {
                    "id":           booking.id,
                    "booking_ref":  booking.booking_ref,
                    "booking_type": booking.booking_type,
                    "status":       booking.status,
                    "total_price":  booking.total_price,
                    "destination":  booking.destination,
                    "created_at":   booking.created_at.isoformat()
                                    if booking.created_at else None,
                }
        except Exception as e:
            print(f"[ProfileEngine] save_booking error: {e}")
            return {}

    # ─────────────────────────────────────────────────────────────────────
    # GET BOOKINGS  (for booking history route)
    # ─────────────────────────────────────────────────────────────────────

    @staticmethod
    async def get_bookings(
        user_id: int,
        limit:   int = 20,
        offset:  int = 0,
        status:  str = None,
    ) -> dict:
        try:
            async with AsyncSessionLocal() as db:
                bookings, total = await crud.get_user_bookings(
                    db, user_id, limit, offset, status
                )
                stats = await crud.get_booking_stats(db, user_id)
                return {
                    "bookings": [
                        {
                            "id":           b.id,
                            "booking_ref":  b.booking_ref,
                            "booking_type": b.booking_type,
                            "status":       b.status,
                            "origin":       b.origin,
                            "destination":  b.destination,
                            "depart_date":  b.depart_date,
                            "return_date":  b.return_date,
                            "passengers":   b.passengers,
                            "total_price":  b.total_price,
                            "pnr":          b.pnr,
                            "cancel_reason":b.cancel_reason,
                            "refund_pct":   b.refund_pct,
                            "created_at":   b.created_at.isoformat()
                                            if b.created_at else None,
                        }
                        for b in bookings
                    ],
                    "total": total,
                    "stats": stats,
                }
        except Exception as e:
            print(f"[ProfileEngine] get_bookings error: {e}")
            return {"bookings": [], "total": 0, "stats": {}}

    # ─────────────────────────────────────────────────────────────────────
    # CANCEL BOOKING
    # ─────────────────────────────────────────────────────────────────────

    @staticmethod
    async def cancel_booking(
        user_id:     int,
        booking_ref: str,
        reason:      str = "user_requested",
    ) -> dict:
        try:
            async with AsyncSessionLocal() as db:
                booking = await crud.cancel_booking(
                    db, booking_ref, user_id, reason
                )
                if not booking:
                    return {"error": "Booking not found"}

                refund_map = {
                    "user_requested":   80,
                    "flight_cancelled": 100,
                    "medical":          90,
                    "no_show":          0,
                }
                refund_pct = refund_map.get(reason, 80)

                return {
                    "status":          "cancelled",
                    "booking_ref":     booking.booking_ref,
                    "reason":          reason,
                    "refund_percent":  refund_pct,
                    "refund_eta_days": 5 if refund_pct > 0 else 0,
                    "cancelled_at":    booking.cancelled_at.isoformat()
                                       if booking.cancelled_at else None,
                }
        except Exception as e:
            print(f"[ProfileEngine] cancel_booking error: {e}")
            return {"error": str(e)}


# ─────────────────────────────────────────────────────────────────────────────
# FALLBACK SESSION  (used if DB is unavailable)
# ─────────────────────────────────────────────────────────────────────────────

class _FallbackSession:
    """
    A plain object that mimics ChatSession fields.
    Used when the DB is unavailable so gemini_service
    never crashes trying to read session.origin etc.
    """
    def __init__(self, user_id: int = 0):
        self.user_id          = user_id
        self.session_id       = "fallback-session"
        self.origin           = None
        self.destination      = None
        self.depart_date      = None
        self.return_date      = None
        self.passengers       = 1
        self.budget_min       = None
        self.budget_max       = None
        self.travel_style     = "budget"
        self.active_booking_id= None
        self.current_intent   = None


# ─────────────────────────────────────────────────────────────────────────────
# QUICK TEST
# ─────────────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import asyncio

    async def test():
        print("=" * 55)
        print("TEST 1 — Create user profile + learn from messages")
        print("=" * 55)

        # Simulate learning from messages
        await ProfileEngine.learn_from_message(
            1, "I always prefer window seat"
        )
        await ProfileEngine.learn_from_message(
            1, "travelling with my family this time"
        )
        await ProfileEngine.learn_from_message(
            1, "looking for something premium, maybe Emirates"
        )
        await ProfileEngine.learn_from_message(
            1, "Ferrari if available for the cab"
        )

        profile = await ProfileEngine.get_profile_dict(1)
        print(f"Wealth signal:    {profile.get('wealth_signal')}")
        print(f"Special requests: {profile.get('special_requests')}")
        print(f"Has family:       {profile.get('has_family')}")
        print(f"Cab preference:   {profile.get('cab_preference')}")
        print(f"Airlines:         {profile.get('preferred_airlines')}")

        print("\n" + "=" * 55)
        print("TEST 2 — Update from booking (luxury flight)")
        print("=" * 55)

        await ProfileEngine.update_from_booking(1, {
            "booking_type": "flight",
            "total_price":  85000,
            "destination":  "Dubai",
            "raw_data":     {"cabin_class": "first"},
        })

        await ProfileEngine.update_from_booking(1, {
            "booking_type": "hotel",
            "total_price":  45000,
            "destination":  "Dubai",
            "raw_data":     {"stars": 5, "name": "Taj Hotel Dubai"},
        })

        await ProfileEngine.update_from_booking(1, {
            "booking_type": "cab",
            "total_price":  8000,
            "destination":  "Dubai",
            "raw_data":     {"vehicle": "Mercedes S-Class"},
        })

        profile = await ProfileEngine.get_profile_dict(1)
        print(f"Wealth signal:      {profile.get('wealth_signal')}")
        print(f"Avg flight spend:   ₹{int(profile.get('avg_flight_spend', 0)):,}")
        print(f"Hotel chains:       {profile.get('preferred_hotel_chains')}")
        print(f"Cab preference:     {profile.get('cab_preference')}")
        print(f"Total bookings:     {profile.get('total_bookings')}")

        print("\n" + "=" * 55)
        print("TEST 3 — Recommendation context for Gemini")
        print("=" * 55)
        context = ProfileEngine.build_recommendation_context(profile)
        print(context)

    asyncio.run(test())