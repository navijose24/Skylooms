# chatbot/database/models.py
from sqlalchemy import (
    Column, Integer, String, Float, Boolean,
    Text, DateTime, ForeignKey, JSON
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database.connection import Base


class User(Base):
    __tablename__ = "users"

    id            = Column(Integer, primary_key=True, index=True)
    name          = Column(String(150), nullable=False)
    email         = Column(String(255), unique=True, index=True, nullable=False)
    phone         = Column(String(20), nullable=True)
    password_hash = Column(String(255), nullable=False)
    created_at    = Column(DateTime, server_default=func.now())

    profile  = relationship("UserProfile",  back_populates="user",
                            uselist=False, cascade="all, delete-orphan")
    sessions = relationship("ChatSession",  back_populates="user",
                            cascade="all, delete-orphan")
    bookings = relationship("Booking",      back_populates="user",
                            cascade="all, delete-orphan")


class UserProfile(Base):
    """
    The personalization brain.
    Updated automatically after every booking and learned
    passively from what the user says in conversation.
    """
    __tablename__ = "user_profiles"

    id   = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)

    # Spending signals — learned from booking history
    avg_flight_spend      = Column(Float,   nullable=True)
    preferred_class       = Column(String(20), default="economy")
    preferred_airlines    = Column(JSON, default=list)
    preferred_hotel_stars = Column(Integer, default=3)
    preferred_hotel_chains= Column(JSON, default=list)
    cab_preference        = Column(String(20), default="budget")
    special_requests      = Column(JSON, default=list)

    # Behaviour signals — inferred from patterns
    typical_trip_days     = Column(Float,   default=3.0)
    is_corp_traveller     = Column(Boolean, default=False)
    has_family            = Column(Boolean, default=False)
    always_books_hotel    = Column(Boolean, default=False)
    always_books_cab      = Column(Boolean, default=False)
    last_destinations     = Column(JSON, default=list)

    # Wealth signal — drives Ferrari vs Maruti decisions
    wealth_signal         = Column(String(20), default="budget")
    # budget | comfortable | wealthy | ultra

    # Raw counts for inference
    total_bookings        = Column(Integer, default=0)
    total_spend           = Column(Float,   default=0.0)
    hotel_booking_count   = Column(Integer, default=0)
    cab_booking_count     = Column(Integer, default=0)

    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="profile")


class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id         = Column(Integer, primary_key=True)
    session_id = Column(String(100), unique=True, index=True, nullable=False)
    user_id    = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Extracted travel context — updated as conversation progresses
    origin       = Column(String(100), nullable=True)
    destination  = Column(String(100), nullable=True)
    depart_date  = Column(String(20),  nullable=True)
    return_date  = Column(String(20),  nullable=True)
    passengers   = Column(Integer, default=1)
    budget_min   = Column(Integer, nullable=True)
    budget_max   = Column(Integer, nullable=True)
    travel_style = Column(String(20), default="budget")
    current_intent = Column(String(50), nullable=True)

    created_at   = Column(DateTime, server_default=func.now())
    last_active  = Column(DateTime, server_default=func.now(), onupdate=func.now())

    user     = relationship("User", back_populates="sessions")
    messages = relationship("ChatMessage", back_populates="session",
                            cascade="all, delete-orphan")


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id         = Column(Integer, primary_key=True)
    session_id = Column(String(100), ForeignKey("chat_sessions.session_id"),
                        nullable=False)
    role       = Column(String(20), nullable=False)   # user | assistant
    content    = Column(Text, nullable=False)
    intent     = Column(String(50), nullable=True)
    tool_calls = Column(JSON, default=list)
    timestamp  = Column(DateTime, server_default=func.now())

    session = relationship("ChatSession", back_populates="messages")


class Booking(Base):
    __tablename__ = "bookings"

    id           = Column(Integer, primary_key=True)
    user_id      = Column(Integer, ForeignKey("users.id"), nullable=False)
    booking_type = Column(String(20), nullable=False)  # flight|hotel|cab
    booking_ref  = Column(String(50), unique=True, nullable=False)
    pnr          = Column(String(20), nullable=True)
    status       = Column(String(20), default="confirmed")

    origin       = Column(String(100), nullable=True)
    destination  = Column(String(100), nullable=True)
    depart_date  = Column(String(20),  nullable=True)
    return_date  = Column(String(20),  nullable=True)
    passengers   = Column(Integer, default=1)
    total_price  = Column(Float,   nullable=True)

    cancel_reason = Column(String(100), nullable=True)
    refund_pct    = Column(Integer,     nullable=True)
    cancelled_at  = Column(DateTime,    nullable=True)

    raw_data   = Column(JSON, default=dict)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="bookings")


class FlightCache(Base):
    """
    Seeded with demo data on startup.
    Real Amadeus data populates this when API is connected.
    """
    __tablename__ = "flights_cache"

    id           = Column(Integer, primary_key=True)
    origin       = Column(String(10), nullable=False, index=True)
    destination  = Column(String(10), nullable=False, index=True)
    depart_date  = Column(String(20), nullable=True)
    airline      = Column(String(100), nullable=False)
    flight_no    = Column(String(20),  nullable=False)
    depart_time  = Column(String(10),  nullable=False)
    arrive_time  = Column(String(10),  nullable=False)
    duration     = Column(String(20),  nullable=False)
    price        = Column(Float,       nullable=False)
    cabin_class  = Column(String(20),  default="economy")
    seats_left   = Column(Integer,     default=9)
    baggage      = Column(String(100), nullable=True)
    refundable   = Column(Boolean,     default=False)
    tier         = Column(String(20),  default="budget")
    cached_at    = Column(DateTime,    server_default=func.now())


class HotelCache(Base):
    __tablename__ = "hotels_cache"

    id              = Column(Integer, primary_key=True)
    city            = Column(String(100), nullable=False, index=True)
    name            = Column(String(200), nullable=False)
    stars           = Column(Integer,     nullable=False)
    rating          = Column(Float,       nullable=True)
    price_per_night = Column(Float,       nullable=False)
    amenities       = Column(JSON,        default=list)
    tier            = Column(String(20),  default="budget")
    free_cancellation = Column(Boolean,   default=False)
    cached_at       = Column(DateTime,    server_default=func.now())


class CabCache(Base):
    __tablename__ = "cabs_cache"

    id         = Column(Integer, primary_key=True)
    city       = Column(String(100), nullable=False, index=True)
    vehicle    = Column(String(100), nullable=False)
    tier       = Column(String(20),  default="budget")
    capacity   = Column(Integer,     default=4)
    base_price = Column(Float,       nullable=False)
    cached_at  = Column(DateTime,    server_default=func.now())