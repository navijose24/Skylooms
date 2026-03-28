# chatbot/database/crud.py

import uuid
from datetime import datetime
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, func, and_, desc
from database.models import (
    User, UserProfile, ChatSession,
    ChatMessage, Booking,
    FlightCache, HotelCache, CabCache,
)


# ─────────────────────────────────────────────────────────────────────────────
# USERS
# ─────────────────────────────────────────────────────────────────────────────

async def create_user(
    db:            AsyncSession,
    name:          str,
    email:         str,
    password_hash: str,
    phone:         str = None,
) -> User:
    user = User(
        name          = name,
        email         = email.lower().strip(),
        password_hash = password_hash,
        phone         = phone,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    # Create a blank profile automatically for every new user
    await get_or_create_profile(user.id, db)
    return user


async def get_user_by_email(db: AsyncSession, email: str) -> Optional[User]:
    result = await db.execute(
        select(User).where(User.email == email.lower().strip())
    )
    return result.scalar_one_or_none()


async def get_user_by_id(db: AsyncSession, user_id: int) -> Optional[User]:
    result = await db.execute(
        select(User).where(User.id == user_id)
    )
    return result.scalar_one_or_none()


# ─────────────────────────────────────────────────────────────────────────────
# USER PROFILES  (the personalization brain)
# ─────────────────────────────────────────────────────────────────────────────

async def get_or_create_profile(
    user_id: int,
    db:      AsyncSession,
) -> UserProfile:
    result = await db.execute(
        select(UserProfile).where(UserProfile.user_id == user_id)
    )
    profile = result.scalar_one_or_none()

    if not profile:
        profile = UserProfile(
            user_id               = user_id,
            avg_flight_spend      = None,
            preferred_class       = "economy",
            preferred_airlines    = [],
            preferred_hotel_stars = 3,
            preferred_hotel_chains= [],
            cab_preference        = "budget",
            special_requests      = [],
            typical_trip_days     = 3.0,
            is_corp_traveller     = False,
            has_family            = False,
            always_books_hotel    = False,
            always_books_cab      = False,
            last_destinations     = [],
            wealth_signal         = "budget",
            total_bookings        = 0,
            total_spend           = 0.0,
            hotel_booking_count   = 0,
            cab_booking_count     = 0,
        )
        db.add(profile)
        await db.commit()
        await db.refresh(profile)

    return profile


async def get_profile_dict(
    user_id: int,
    db:      AsyncSession,
) -> dict:
    """
    Returns profile as a plain dict for passing to
    gemini_service and fallback_service.
    """
    user    = await get_user_by_id(db, user_id)
    profile = await get_or_create_profile(user_id, db)

    return {
        "user_id":                user_id,
        "name":                   user.name if user else "Traveller",
        "wealth_signal":          profile.wealth_signal,
        "avg_flight_spend":       profile.avg_flight_spend or 0,
        "preferred_class":        profile.preferred_class,
        "preferred_airlines":     profile.preferred_airlines or [],
        "preferred_hotel_stars":  profile.preferred_hotel_stars,
        "preferred_hotel_chains": profile.preferred_hotel_chains or [],
        "cab_preference":         profile.cab_preference,
        "special_requests":       profile.special_requests or [],
        "typical_trip_days":      profile.typical_trip_days,
        "is_corp_traveller":      profile.is_corp_traveller,
        "has_family":             profile.has_family,
        "always_books_hotel":     profile.always_books_hotel,
        "always_books_cab":       profile.always_books_cab,
        "last_destinations":      profile.last_destinations or [],
        "total_bookings":         profile.total_bookings,
        "total_spend":            profile.total_spend,
    }


async def update_profile(
    user_id: int,
    db:      AsyncSession,
    updates: dict,
) -> UserProfile:
    """
    Safely merges updates into the profile.
    Only updates fields that are explicitly passed.
    """
    profile = await get_or_create_profile(user_id, db)

    allowed_fields = {
        "avg_flight_spend", "preferred_class", "preferred_airlines",
        "preferred_hotel_stars", "preferred_hotel_chains", "cab_preference",
        "special_requests", "typical_trip_days", "is_corp_traveller",
        "has_family", "always_books_hotel", "always_books_cab",
        "last_destinations", "wealth_signal", "total_bookings",
        "total_spend", "hotel_booking_count", "cab_booking_count",
    }

    for field, value in updates.items():
        if field in allowed_fields and value is not None:
            setattr(profile, field, value)

    await db.commit()
    await db.refresh(profile)
    return profile


async def update_profile_from_booking(
    user_id: int,
    db:      AsyncSession,
    booking: dict,
) -> None:
    """
    Called after every booking to make the next recommendation smarter.
    Updates spend averages, destination history, tier preferences.
    """
    profile = await get_or_create_profile(user_id, db)

    price        = booking.get("total_price", 0) or 0
    booking_type = booking.get("booking_type", "")
    destination  = booking.get("destination")

    # ── Update total counts ───────────────────────────────────────────────
    profile.total_bookings = (profile.total_bookings or 0) + 1
    profile.total_spend    = (profile.total_spend    or 0) + price

    # ── Rolling average flight spend ──────────────────────────────────────
    if price > 0 and booking_type == "flight":
        old_avg = profile.avg_flight_spend or price
        # Weighted rolling average — recent trips count more
        profile.avg_flight_spend = round((old_avg * 0.65) + (price * 0.35))

    # ── Destination history ───────────────────────────────────────────────
    if destination:
        dests = list(profile.last_destinations or [])
        if destination not in dests:
            dests.append(destination)
        profile.last_destinations = dests[-10:]   # keep last 10

    # ── Learn from hotel booking ──────────────────────────────────────────
    if booking_type == "hotel":
        profile.hotel_booking_count = (profile.hotel_booking_count or 0) + 1
        raw  = booking.get("raw_data", {}) or {}
        stars = raw.get("stars", 0)
        if stars:
            old_stars = profile.preferred_hotel_stars or stars
            profile.preferred_hotel_stars = round((old_stars + stars) / 2)

        # Learn hotel chain preference
        hotel_name = raw.get("name", "")
        luxury_chains = ["Taj", "Leela", "Hyatt", "Marriott",
                         "Four Seasons", "Aman", "Oberoi"]
        chains = list(profile.preferred_hotel_chains or [])
        for chain in luxury_chains:
            if chain.lower() in hotel_name.lower() and chain not in chains:
                chains.append(chain)
        profile.preferred_hotel_chains = chains[:5]   # top 5

    # ── Learn from cab booking ────────────────────────────────────────────
    if booking_type == "cab":
        profile.cab_booking_count = (profile.cab_booking_count or 0) + 1
        raw     = booking.get("raw_data", {}) or {}
        vehicle = raw.get("vehicle", "")

        if any(v in vehicle for v in
               ["Ferrari", "Rolls", "Bentley", "Porsche", "Lamborghini"]):
            profile.cab_preference = "luxury"
        elif any(v in vehicle for v in
                 ["Mercedes", "BMW", "Audi", "Jaguar"]):
            profile.cab_preference = "luxury"
        elif any(v in vehicle for v in
                 ["Innova", "Carnival", "XUV", "Fortuner"]):
            if profile.cab_preference == "budget":
                profile.cab_preference = "business"

    # ── Re-infer wealth signal from updated spend ─────────────────────────
    avg = profile.avg_flight_spend or 0
    if avg > 80000:
        profile.wealth_signal = "ultra"
    elif avg > 35000:
        profile.wealth_signal = "wealthy"
    elif avg > 12000:
        profile.wealth_signal = "comfortable"
    else:
        profile.wealth_signal = "budget"

    # ── Learn behavioural patterns ────────────────────────────────────────
    # If user has booked hotel 3+ times, mark as always_books_hotel
    if (profile.hotel_booking_count or 0) >= 3:
        profile.always_books_hotel = True
    if (profile.cab_booking_count or 0) >= 3:
        profile.always_books_cab = True

    await db.commit()


async def learn_from_message(
    user_id: int,
    db:      AsyncSession,
    message: str,
) -> None:
    """
    Passively learns from what the user says even before booking.
    'I prefer window seat' → stored forever.
    'Looking for something premium' → wealth signal updated.
    'Travelling with my family' → family flag set.
    """
    profile = await get_or_create_profile(user_id, db)
    msg     = message.lower()
    changed = False

    # ── Special requests ──────────────────────────────────────────────────
    triggers = {
        "window seat":   "window seat",
        "aisle seat":    "aisle seat",
        "veg meal":      "vegetarian meal",
        "vegetarian":    "vegetarian meal",
        "wheelchair":    "wheelchair assistance",
        "extra legroom": "extra legroom",
        "bassinet":      "bassinet (infant)",
        "no pork":       "no pork",
        "halal":         "halal meal",
        "early checkin": "early check-in",
        "late checkout": "late check-out",
    }
    reqs = list(profile.special_requests or [])
    for trigger, label in triggers.items():
        if trigger in msg and label not in reqs:
            reqs.append(label)
            changed = True
    if changed:
        profile.special_requests = reqs

    # ── Wealth signals from language ──────────────────────────────────────
    ultra_words   = ["ferrari", "rolls royce", "bentley", "private jet",
                     "first class", "penthouse", "presidential suite"]
    luxury_words  = ["premium", "luxury", "finest", "best available",
                     "business class", "5 star", "five star", "suite"]
    budget_words  = ["cheapest", "budget", "lowest price", "affordable",
                     "economy", "backpack"]

    current_wealth = profile.wealth_signal or "budget"

    if any(w in msg for w in ultra_words):
        if current_wealth != "ultra":
            profile.wealth_signal = "ultra"
            profile.cab_preference = "luxury"
            changed = True

    elif any(w in msg for w in luxury_words):
        if current_wealth in ("budget", "comfortable"):
            profile.wealth_signal = "wealthy"
            changed = True

    elif any(w in msg for w in budget_words):
        if current_wealth in ("ultra", "wealthy"):
            pass   # don't downgrade an established wealthy user
        else:
            profile.wealth_signal = "budget"
            changed = True

    # ── Family signals ────────────────────────────────────────────────────
    family_words = ["my wife", "my husband", "my kids", "my children",
                    "family trip", "with my family", "my son", "my daughter",
                    "infant", "baby", "toddler"]
    if any(w in msg for w in family_words):
        if not profile.has_family:
            profile.has_family = True
            changed = True

    # ── Corporate signals ─────────────────────────────────────────────────
    corp_words = ["business trip", "work trip", "conference", "client meeting",
                  "company", "office", "corporate", "my team"]
    if any(w in msg for w in corp_words):
        if not profile.is_corp_traveller:
            profile.is_corp_traveller = True
            changed = True

    # ── Preferred airline signals ─────────────────────────────────────────
    airline_map = {
        "emirates":      "Emirates",
        "qatar":         "Qatar Airways",
        "vistara":       "Vistara",
        "air india":     "Air India",
        "indigo":        "IndiGo",
        "spicejet":      "SpiceJet",
        "british airways": "British Airways",
        "singapore airlines": "Singapore Airlines",
    }
    airlines = list(profile.preferred_airlines or [])
    for keyword, name in airline_map.items():
        if keyword in msg and name not in airlines:
            airlines.append(name)
            changed = True
    if changed:
        profile.preferred_airlines = airlines[:5]

    if changed:
        await db.commit()


# ─────────────────────────────────────────────────────────────────────────────
# CHAT SESSIONS
# ─────────────────────────────────────────────────────────────────────────────

async def get_or_create_session(
    db:         AsyncSession,
    user_id:    int,
    session_id: str = None,
) -> ChatSession:
    sid = session_id or str(uuid.uuid4())

    result = await db.execute(
        select(ChatSession).where(ChatSession.session_id == sid)
    )
    session = result.scalar_one_or_none()

    if not session:
        session = ChatSession(
            session_id = sid,
            user_id    = user_id,
        )
        db.add(session)
        await db.commit()
        await db.refresh(session)

    return session


async def update_session_entities(
    db:      AsyncSession,
    session: ChatSession,
    entities: dict,
) -> None:
    """Syncs extracted travel entities back to the session row."""
    field_map = {
        "origin":       "origin",
        "destination":  "destination",
        "depart_date":  "depart_date",
        "return_date":  "return_date",
        "passengers":   "passengers",
        "budget_min":   "budget_min",
        "budget_max":   "budget_max",
        "travel_style": "travel_style",
    }
    changed = False
    for entity_key, session_attr in field_map.items():
        val = entities.get(entity_key)
        if val is not None:
            setattr(session, session_attr, val)
            changed = True

    if changed:
        session.last_active = datetime.utcnow()
        await db.commit()


async def add_message(
    db:         AsyncSession,
    session_id: str,
    role:       str,
    content:    str,
    intent:     str    = None,
    tool_calls: list   = None,
) -> ChatMessage:
    msg = ChatMessage(
        session_id = session_id,
        role       = role,
        content    = content,
        intent     = intent,
        tool_calls = tool_calls or [],
    )
    db.add(msg)
    await db.commit()
    await db.refresh(msg)
    return msg


async def get_session_history(
    db:         AsyncSession,
    session_id: str,
    limit:      int = 20,
) -> list[dict]:
    """Returns last N messages formatted for Gemini history."""
    result = await db.execute(
        select(ChatMessage)
        .where(ChatMessage.session_id == session_id)
        .order_by(desc(ChatMessage.timestamp))
        .limit(limit)
    )
    messages = result.scalars().all()
    # Reverse so oldest is first (Gemini needs chronological order)
    return [
        {"role": m.role, "content": m.content}
        for m in reversed(messages)
    ]


async def list_user_sessions(
    db:      AsyncSession,
    user_id: int,
    limit:   int = 20,
) -> list[dict]:
    """For the chat history sidebar."""
    result = await db.execute(
        select(ChatSession)
        .where(ChatSession.user_id == user_id)
        .order_by(desc(ChatSession.last_active))
        .limit(limit)
    )
    sessions = result.scalars().all()
    return [
        {
            "session_id":  s.session_id,
            "destination": s.destination or "New conversation",
            "last_active": s.last_active.timestamp() if s.last_active else 0,
            "created_at":  s.created_at.timestamp()  if s.created_at  else 0,
        }
        for s in sessions
    ]


async def delete_session(
    db:         AsyncSession,
    session_id: str,
    user_id:    int,
) -> bool:
    result = await db.execute(
        select(ChatSession).where(
            and_(
                ChatSession.session_id == session_id,
                ChatSession.user_id    == user_id,
            )
        )
    )
    session = result.scalar_one_or_none()
    if not session:
        return False

    await db.delete(session)
    await db.commit()
    return True


# ─────────────────────────────────────────────────────────────────────────────
# BOOKINGS
# ─────────────────────────────────────────────────────────────────────────────

async def create_booking(
    db:           AsyncSession,
    user_id:      int,
    booking_type: str,
    booking_ref:  str,
    pnr:          str       = None,
    total_price:  float     = None,
    raw_data:     dict      = None,
    origin:       str       = None,
    destination:  str       = None,
    depart_date:  str       = None,
    return_date:  str       = None,
    passengers:   int       = 1,
) -> Booking:
    booking = Booking(
        user_id      = user_id,
        booking_type = booking_type,
        booking_ref  = booking_ref,
        pnr          = pnr,
        status       = "confirmed",
        total_price  = total_price,
        raw_data     = raw_data or {},
        origin       = origin,
        destination  = destination,
        depart_date  = depart_date,
        return_date  = return_date,
        passengers   = passengers,
    )
    db.add(booking)
    await db.commit()
    await db.refresh(booking)

    # Update profile from this booking automatically
    await update_profile_from_booking(user_id, db, {
        "booking_type": booking_type,
        "total_price":  total_price,
        "destination":  destination,
        "raw_data":     raw_data or {},
    })

    return booking


async def get_user_bookings(
    db:      AsyncSession,
    user_id: int,
    limit:   int = 20,
    offset:  int = 0,
    status:  str = None,   # None = all, "confirmed", "cancelled"
) -> tuple[list[Booking], int]:
    query = select(Booking).where(Booking.user_id == user_id)

    if status:
        query = query.where(Booking.status == status)

    # Total count
    count_result = await db.execute(
        select(func.count()).select_from(
            query.subquery()
        )
    )
    total = count_result.scalar() or 0

    # Paginated results
    result = await db.execute(
        query.order_by(desc(Booking.created_at)).limit(limit).offset(offset)
    )
    bookings = result.scalars().all()
    return bookings, total


async def get_booking_by_ref(
    db:          AsyncSession,
    booking_ref: str,
    user_id:     int = None,
) -> Optional[Booking]:
    query = select(Booking).where(Booking.booking_ref == booking_ref)
    if user_id:
        query = query.where(Booking.user_id == user_id)

    result = await db.execute(query)
    return result.scalar_one_or_none()


async def cancel_booking(
    db:          AsyncSession,
    booking_ref: str,
    user_id:     int,
    reason:      str = "user_requested",
) -> Optional[Booking]:
    booking = await get_booking_by_ref(db, booking_ref, user_id)

    if not booking:
        return None
    if booking.status == "cancelled":
        return booking   # already cancelled

    # Calculate refund
    refund_map = {
        "user_requested":   80,
        "flight_cancelled": 100,
        "medical":          90,
        "no_show":          0,
    }
    refund_pct = refund_map.get(reason, 80)

    booking.status       = "cancelled"
    booking.cancel_reason= reason
    booking.refund_pct   = refund_pct
    booking.cancelled_at = datetime.utcnow()

    await db.commit()
    await db.refresh(booking)
    return booking


async def get_booking_stats(
    db:      AsyncSession,
    user_id: int,
) -> dict:
    result = await db.execute(
        select(
            func.count(Booking.id).label("total"),
            func.sum(
                func.cast(Booking.status == "confirmed", db.bind.dialect.name == "sqlite" and "integer" or "integer")
            ).label("confirmed"),
            func.sum(Booking.total_price).label("total_spend"),
        ).where(Booking.user_id == user_id)
    )
    row = result.one()

    all_bookings, _ = await get_user_bookings(db, user_id, limit=1000)
    confirmed  = sum(1 for b in all_bookings if b.status == "confirmed")
    cancelled  = sum(1 for b in all_bookings if b.status == "cancelled")
    total_spend= sum(b.total_price or 0 for b in all_bookings)

    return {
        "total":       len(all_bookings),
        "confirmed":   confirmed,
        "cancelled":   cancelled,
        "total_spend": round(total_spend, 2),
    }


# ─────────────────────────────────────────────────────────────────────────────
# CACHE LOOKUPS  (flights / hotels / cabs)
# ─────────────────────────────────────────────────────────────────────────────

async def get_cached_flights(
    db:          AsyncSession,
    origin:      str,
    destination: str,
    tier:        str = None,
    limit:       int = 5,
) -> list[FlightCache]:
    query = select(FlightCache).where(
        and_(
            FlightCache.origin      == origin.upper(),
            FlightCache.destination == destination.upper(),
        )
    )
    if tier:
        query = query.where(FlightCache.tier == tier)

    result = await db.execute(query.limit(limit))
    return result.scalars().all()


async def get_cached_hotels(
    db:    AsyncSession,
    city:  str,
    tier:  str = None,
    limit: int = 5,
) -> list[HotelCache]:
    query = select(HotelCache).where(
        HotelCache.city.ilike(f"%{city}%")
    )
    if tier:
        query = query.where(HotelCache.tier == tier)

    result = await db.execute(
        query.order_by(desc(HotelCache.stars)).limit(limit)
    )
    return result.scalars().all()


async def get_cached_cabs(
    db:    AsyncSession,
    city:  str,
    tier:  str = None,
    limit: int = 3,
) -> list[CabCache]:
    query = select(CabCache).where(
        CabCache.city.ilike(f"%{city}%")
    )
    if tier:
        query = query.where(CabCache.tier == tier)

    result = await db.execute(query.limit(limit))
    return result.scalars().all()