# chatbot/services/gemini_service.py
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from groq import AsyncGroq
import asyncio, hashlib, time
from datetime import datetime
from typing import Optional

from google import genai
from google.genai import types

from google.genai import errors as genai_errors

from services.fallback_service import FallbackService
from config import settings

# ─────────────────────────────────────────────────────────────────────────────
# CLIENT  (single instance, reused across all requests)
# ─────────────────────────────────────────────────────────────────────────────

_client: Optional[genai.Client] = None

def _get_client() -> genai.Client:
    global _client
    if _client is None:
        _client = genai.Client(api_key=settings.GEMINI_API_KEY)
    return _client


# ─────────────────────────────────────────────────────────────────────────────
# IN-MEMORY RATE LIMIT STATE
# ─────────────────────────────────────────────────────────────────────────────

_rpm_window:   list  = []    # timestamps of recent Gemini calls
_rpd_counts:   dict  = {}    # { "YYYY-MM-DD": count }
_quota_until:  float = 0.0   # epoch time until quota cooldown clears
_response_cache: dict = {}   # { cache_key: (result, expires_at) }

RPM_LIMIT = 14
RPD_LIMIT = 1490
CACHE_TTL = 300   # 5 minutes


# ─────────────────────────────────────────────────────────────────────────────
# RATE LIMIT HELPERS
# ─────────────────────────────────────────────────────────────────────────────

def _check_rpm() -> tuple[bool, str]:
    global _rpm_window
    now          = time.time()
    window_start = now - 60
    _rpm_window  = [t for t in _rpm_window if t > window_start]

    if len(_rpm_window) >= RPM_LIMIT:
        wait = int(60 - (now - _rpm_window[0])) + 1
        return False, f"rpm_limit:retry_in_{wait}s"

    _rpm_window.append(now)
    return True, ""


def _check_rpd() -> tuple[bool, str]:
    today = time.strftime("%Y-%m-%d", time.gmtime())
    _rpd_counts[today] = _rpd_counts.get(today, 0) + 1

    if _rpd_counts[today] > RPD_LIMIT:
        return False, "rpd_limit:daily_quota_reached"
    return True, ""


def _is_quota_exhausted() -> bool:
    return time.time() < _quota_until


def _mark_quota_exhausted(seconds: int = 60) -> None:
    global _quota_until
    _quota_until = time.time() + seconds


def _gemini_rate_limit_check() -> tuple[bool, str]:
    if _is_quota_exhausted():
        return False, "quota_exhausted"

    rpm_ok, rpm_reason = _check_rpm()
    if not rpm_ok:
        return False, rpm_reason

    rpd_ok, rpd_reason = _check_rpd()
    if not rpd_ok:
        return False, rpd_reason

    return True, ""


# ─────────────────────────────────────────────────────────────────────────────
# RESPONSE CACHE
# ─────────────────────────────────────────────────────────────────────────────

def _cache_key(message: str) -> str:
    return hashlib.md5(message.lower().strip().encode()).hexdigest()


def _get_cached(message: str) -> Optional[dict]:
    key   = _cache_key(message)
    entry = _response_cache.get(key)
    if entry:
        result, expires_at = entry
        if time.time() < expires_at:
            print("[GeminiService] Cache hit — no API call used")
            return result
        del _response_cache[key]
    return None


def _set_cache(message: str, result: dict) -> None:
    key = _cache_key(message)
    _response_cache[key] = (result, time.time() + CACHE_TTL)

    # Evict oldest if over 200 entries
    if len(_response_cache) > 200:
        oldest = min(_response_cache, key=lambda k: _response_cache[k][1])
        del _response_cache[oldest]


# ─────────────────────────────────────────────────────────────────────────────
# TOOL DEFINITIONS  (new google-genai SDK format)
# ─────────────────────────────────────────────────────────────────────────────

TOOLS = [
    types.Tool(
        function_declarations=[
            types.FunctionDeclaration(
                name        = "search_flights",
                description = (
                    "Search for available flights between two cities. "
                    "Call this whenever the user mentions travel, "
                    "a destination, or a trip."
                ),
                parameters  = types.Schema(
                    type       = types.Type.OBJECT,
                    properties = {
                        "origin":       types.Schema(
                            type        = types.Type.STRING,
                            description = "Departure city or airport code e.g. BOM",
                        ),
                        "destination":  types.Schema(
                            type        = types.Type.STRING,
                            description = "Arrival city or airport code e.g. DEL",
                        ),
                        "depart_date":  types.Schema(
                            type        = types.Type.STRING,
                            description = "Departure date YYYY-MM-DD",
                        ),
                        "passengers":   types.Schema(
                            type        = types.Type.INTEGER,
                            description = "Number of passengers, default 1",
                        ),
                        "travel_class": types.Schema(
                            type        = types.Type.STRING,
                            description = "economy | business | first",
                        ),
                    },
                    required = ["origin", "destination", "depart_date"],
                ),
            ),
            types.FunctionDeclaration(
                name        = "search_hotels",
                description = (
                    "Search for hotels at a destination city. "
                    "AUTOMATICALLY call this when a round-trip return date "
                    "is more than 1 day after departure. "
                    "Do not wait for the user to ask."
                ),
                parameters  = types.Schema(
                    type       = types.Type.OBJECT,
                    properties = {
                        "location":  types.Schema(
                            type        = types.Type.STRING,
                            description = "City to search hotels in",
                        ),
                        "check_in":  types.Schema(
                            type        = types.Type.STRING,
                            description = "Check-in date YYYY-MM-DD",
                        ),
                        "check_out": types.Schema(
                            type        = types.Type.STRING,
                            description = "Check-out date YYYY-MM-DD",
                        ),
                        "guests":    types.Schema(
                            type        = types.Type.INTEGER,
                            description = "Number of guests",
                        ),
                        "tier":      types.Schema(
                            type        = types.Type.STRING,
                            description = "budget | business | luxury",
                        ),
                    },
                    required = ["location", "check_in", "check_out"],
                ),
            ),
            types.FunctionDeclaration(
                name        = "search_cabs",
                description = (
                    "Search for cab or airport transfer options. "
                    "AUTOMATICALLY call this whenever a hotel is also "
                    "being searched or booked."
                ),
                parameters  = types.Schema(
                    type       = types.Type.OBJECT,
                    properties = {
                        "pickup":  types.Schema(
                            type        = types.Type.STRING,
                            description = "Pickup location e.g. DEL Airport T3",
                        ),
                        "dropoff": types.Schema(
                            type        = types.Type.STRING,
                            description = "Drop-off location e.g. hotel or city centre",
                        ),
                        "tier":    types.Schema(
                            type        = types.Type.STRING,
                            description = "budget | business | luxury",
                        ),
                    },
                    required = ["pickup", "dropoff"],
                ),
            ),
            types.FunctionDeclaration(
                name        = "create_booking",
                description = (
                    "Confirm and create a booking after user explicitly approves. "
                    "Always summarise total cost and ask for confirmation first. "
                    "Never call without user approval."
                ),
                parameters  = types.Schema(
                    type       = types.Type.OBJECT,
                    properties = {
                        "booking_type": types.Schema(
                            type        = types.Type.STRING,
                            description = "flight | hotel | cab",
                        ),
                        "item_id":      types.Schema(
                            type        = types.Type.STRING,
                            description = "The flight_id, hotel_id, or cab_id",
                        ),
                        "passengers":   types.Schema(
                            type        = types.Type.INTEGER,
                            description = "Number of passengers",
                        ),
                        "user_notes":   types.Schema(
                            type        = types.Type.STRING,
                            description = "Special requests from the user",
                        ),
                    },
                    required = ["booking_type", "item_id"],
                ),
            ),
            types.FunctionDeclaration(
                name        = "cancel_booking",
                description = "Cancel an existing booking using its reference number.",
                parameters  = types.Schema(
                    type       = types.Type.OBJECT,
                    properties = {
                        "booking_ref": types.Schema(
                            type        = types.Type.STRING,
                            description = "Booking reference e.g. BK-1234567",
                        ),
                        "reason":      types.Schema(
                            type        = types.Type.STRING,
                            description = (
                                "user_requested | medical | "
                                "flight_cancelled | no_show"
                            ),
                        ),
                    },
                    required = ["booking_ref"],
                ),
            ),
        ]
    )
]


# ─────────────────────────────────────────────────────────────────────────────
# SYSTEM PROMPT BUILDER
# ─────────────────────────────────────────────────────────────────────────────

def _build_system_prompt(session, user_profile: dict) -> str:
    core = """
You are SkyMind, an elite AI travel concierge. Calm, precise, premium.

CORE RULES — follow every time without exception:

1. ROUND-TRIP OVERNIGHT:
   Return date more than 1 day after departure → call ALL of:
   search_flights (outbound) + search_flights (return) +
   search_hotels + search_cabs simultaneously.
   Never wait to be asked about hotels or cabs.

2. SAME-DAY RETURN:
   Same calendar day → search_flights only. No hotels.

3. BEFORE BOOKING:
   Summarise full package + total ₹ cost.
   Ask "Shall I confirm?" before calling create_booking.
   Never book without explicit user approval.

4. CANCELLATION:
   Extract booking ref (BK/HT/CB-XXXXXXX).
   If not given, ask before proceeding.

5. LANGUAGE:
   Use ₹ for all prices.
   Concise and warm. Never say "I cannot."
   Always offer an alternative.
"""

    session_ctx = f"""
CURRENT SESSION:
- Origin:         {getattr(session, 'origin',       None) or 'not set'}
- Destination:    {getattr(session, 'destination',  None) or 'not set'}
- Depart date:    {getattr(session, 'depart_date',  None) or 'not set'}
- Return date:    {getattr(session, 'return_date',  None) or 'not set'}
- Passengers:     {getattr(session, 'passengers',   1)}
- Budget:         ₹{getattr(session, 'budget_min',  '?')} – ₹{getattr(session, 'budget_max', '?')}
- Travel style:   {getattr(session, 'travel_style', 'budget')}
- Active booking: {getattr(session, 'active_booking_id', None) or 'none'}
"""

    if not user_profile:
        return core + session_ctx

    wealth       = user_profile.get("wealth_signal",           "budget")
    cab_pref     = user_profile.get("cab_preference",          "budget")
    hotel_stars  = user_profile.get("preferred_hotel_stars",   3)
    airlines     = user_profile.get("preferred_airlines",      [])
    chains       = user_profile.get("preferred_hotel_chains",  [])
    special_reqs = user_profile.get("special_requests",        [])
    is_corp      = user_profile.get("is_corp_traveller",       False)
    has_family   = user_profile.get("has_family",              False)
    avg_spend    = user_profile.get("avg_flight_spend",        0)
    last_dests   = user_profile.get("last_destinations",       [])
    total_trips  = user_profile.get("total_bookings",          0)
    always_hotel = user_profile.get("always_books_hotel",      False)
    always_cab   = user_profile.get("always_books_cab",        False)
    name         = user_profile.get("name",                    "Passenger")

    wealth_rules = {
        "ultra": (
            "TIER: ULTRA PREMIUM\n"
            "- NEVER show economy or standard options.\n"
            "- Flights: first class only. Emirates, Qatar, Vistara First.\n"
            "- Hotels: 5-star minimum. Burj Al Arab, Aman, Four Seasons, Taj Palace.\n"
            "- Cabs: Ferrari, Rolls-Royce, Bentley. Mercedes S-Class is the minimum.\n"
            "- Never mention price as a concern. Never caveat cost.\n"
            "- Quiet confidence. No budget options ever."
        ),
        "wealthy": (
            "TIER: PREMIUM\n"
            "- Default to business class. Offer first class as upgrade.\n"
            "- Hotels: 5-star preferred. Taj, Leela, Hyatt, Four Seasons.\n"
            "- Cabs: Mercedes S-Class, BMW 7 Series minimum.\n"
            "  Mention Ferrari or Porsche as a special option.\n"
            "- Never lead with the cheapest option."
        ),
        "comfortable": (
            "TIER: BUSINESS/COMFORT\n"
            "- Default to business class. Economy as budget alternative.\n"
            "- Hotels: 4-star preferred. Marriott, Radisson, Novotel.\n"
            "- Cabs: Toyota Innova, Kia Carnival, executive sedans.\n"
            + ("- Likely corporate — mention company billing for amounts > ₹20,000.\n"
               if is_corp else "")
        ),
        "budget": (
            "TIER: VALUE\n"
            "- Best value options first. Economy class.\n"
            "- Hotels: 2-3 star, clean and well-rated. Ibis, Ginger, OYO.\n"
            "- Cabs: standard sedans. Maruti Dzire, Toyota Etios.\n"
            "- Mention savings and deals where possible."
        ),
    }

    personalisation = f"""
PASSENGER INTELLIGENCE:
- Name:              {name}
- Wealth tier:       {wealth}
- Total trips:       {total_trips}
- Avg flight spend:  ₹{int(avg_spend):,}
- Preferred airlines:{', '.join(airlines) if airlines else 'none'}
- Preferred chains:  {', '.join(chains)   if chains   else 'none'}
- Hotel stars:       {hotel_stars}★
- Cab preference:    {cab_pref}
- Special requests:  {', '.join(special_reqs) if special_reqs else 'none'}
- Corporate:         {is_corp}
- Family:            {has_family}
- Recent trips:      {', '.join(last_dests[-5:]) if last_dests else 'first trip'}
- Always books hotel:{always_hotel}
- Always books cab:  {always_cab}

{wealth_rules.get(wealth, wealth_rules['budget'])}

BEHAVIOUR:
{'- Proactively include hotels for every trip (user always books hotel).' if always_hotel else ''}
{'- Proactively include cabs for every trip (user always books cab).'    if always_cab   else ''}
{'- Show preferred airlines (' + ', '.join(airlines) + ') first.'        if airlines     else ''}
{'- Show preferred hotel chains (' + ', '.join(chains) + ') first.'      if chains       else ''}
{'- Always apply special requests: ' + ', '.join(special_reqs)           if special_reqs else ''}
{'- Family trip — suggest family rooms, adjoining seats, child amenities.' if has_family  else ''}
{'- Corporate traveller — prioritise flexible/refundable options.'         if is_corp     else ''}
"""

    return core + session_ctx + personalisation


# ─────────────────────────────────────────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────────────────────────────────────────

def _days_between(d1: str, d2: str) -> int:
    try:
        fmt = "%Y-%m-%d"
        return (datetime.strptime(d2, fmt) - datetime.strptime(d1, fmt)).days
    except Exception:
        return 0


def _extract_entities(tool_calls: list[dict]) -> dict:
    entities = {}
    for call in tool_calls:
        args = call.get("args", {})
        if call["tool"] == "search_flights":
            entities.setdefault("origin",      args.get("origin"))
            entities.setdefault("destination", args.get("destination"))
            entities.setdefault("depart_date", args.get("depart_date"))
            if args.get("passengers"):
                entities.setdefault("passengers", args["passengers"])
        elif call["tool"] == "search_hotels":
            entities.setdefault("return_date", args.get("check_out"))
    return {k: v for k, v in entities.items() if v is not None}


def _get_text_from_response(response) -> str:
    """Safely extract text from a Gemini response."""
    try:
        text = ""
        for part in response.candidates[0].content.parts:
            if hasattr(part, "text") and part.text:
                text += part.text
        return text
    except Exception:
        return ""


def _get_function_calls(response) -> list:
    """Safely extract function calls from a Gemini response."""
    calls = []
    try:
        for part in response.candidates[0].content.parts:
            if hasattr(part, "function_call") and part.function_call:
                fc = part.function_call
                if fc.name:
                    calls.append(fc)
    except Exception:
        pass
    return calls


# ─────────────────────────────────────────────────────────────────────────────
# TOOL EXECUTOR
# ─────────────────────────────────────────────────────────────────────────────

async def _execute_tool(
    tool_name:    str,
    args:         dict,
    session,
    user_profile: dict,
) -> dict:
    wealth   = user_profile.get("wealth_signal", "budget")
    tier_map = {
        "ultra":       "luxury",
        "wealthy":     "luxury",
        "comfortable": "business",
        "budget":      "budget",
    }
    tier     = tier_map.get(wealth, getattr(session, "travel_style", "budget"))
    cab_pref = user_profile.get("cab_preference", tier)

    try:
        if tool_name == "search_flights":
            try:
                from services.flight_service import FlightService
                return await FlightService.search(
                    origin       = args.get("origin", "BOM"),
                    destination  = args.get("destination", "DEL"),
                    depart_date  = args.get("depart_date", ""),
                    passengers   = args.get("passengers", 1),
                    travel_class = args.get("travel_class", "economy"),
                )
            except Exception:
                return FallbackService.get_mock_flights(
                    origin      = args.get("origin", "BOM"),
                    destination = args.get("destination", "DEL"),
                    depart_date = args.get("depart_date"),
                    passengers  = args.get("passengers", 1),
                    tier        = tier,
                )

        elif tool_name == "search_hotels":
            try:
                from services.hotel_service import HotelService
                return await HotelService.search(
                    location  = args.get("location", "Delhi"),
                    check_in  = args.get("check_in", ""),
                    check_out = args.get("check_out", ""),
                    guests    = args.get("guests", 1),
                    tier      = args.get("tier", tier),
                )
            except Exception:
                return FallbackService.get_mock_hotels(
                    location  = args.get("location", "Delhi"),
                    check_in  = args.get("check_in"),
                    check_out = args.get("check_out"),
                    tier      = args.get("tier", tier),
                )

        elif tool_name == "search_cabs":
            return FallbackService.get_mock_cabs(
                pickup  = args.get("pickup", "Airport"),
                dropoff = args.get("dropoff", "City Centre"),
                tier    = args.get("tier", cab_pref),
            )

        elif tool_name == "create_booking":
            return FallbackService.create_mock_booking(
                booking_type = args.get("booking_type", "flight"),
                item_id      = args.get("item_id", ""),
                user_id      = str(getattr(session, "user_id", "unknown")),
                passengers   = args.get("passengers", 1),
                extra        = {"user_notes": args.get("user_notes", "")},
            )

        elif tool_name == "cancel_booking":
            return FallbackService.cancel_mock_booking(
                booking_ref = args.get("booking_ref", ""),
                reason      = args.get("reason", "user_requested"),
            )

        else:
            return {"error": f"Unknown tool: {tool_name}"}

    except Exception as e:
        return {"error": str(e), "source": "fallback_mock"}


# ─────────────────────────────────────────────────────────────────────────────
# ROUND-TRIP SAFETY NET
# ─────────────────────────────────────────────────────────────────────────────

async def _apply_roundtrip_safety_net(
    session,
    user_profile:     dict,
    tool_results_map: dict,
    tool_calls_made:  list,
) -> None:
    depart = getattr(session, "depart_date", None)
    ret    = getattr(session, "return_date",  None)
    dest   = getattr(session, "destination",  None)

    if not (depart and ret and dest):
        return
    if _days_between(depart, ret) <= 1:
        return
    if "search_hotels" in tool_results_map:
        return

    wealth   = user_profile.get("wealth_signal", "budget")
    tier_map = {
        "ultra":       "luxury",
        "wealthy":     "luxury",
        "comfortable": "business",
        "budget":      "budget",
    }
    tier     = tier_map.get(wealth, getattr(session, "travel_style", "budget"))
    cab_pref = user_profile.get("cab_preference", tier)

    print("[GeminiService] Safety net — injecting hotels + cabs")

    hotel_result = await _execute_tool("search_hotels", {
        "location":  dest,
        "check_in":  depart,
        "check_out": ret,
        "tier":      tier,
    }, session, user_profile)
    tool_results_map["search_hotels"] = hotel_result
    tool_calls_made.append({
        "tool": "search_hotels",
        "args": {"location": dest, "check_in": depart, "check_out": ret},
    })

    cab_result = await _execute_tool("search_cabs", {
        "pickup":  f"{dest} Airport",
        "dropoff": f"{dest} City Centre",
        "tier":    cab_pref,
    }, session, user_profile)
    tool_results_map["search_cabs"] = cab_result
    tool_calls_made.append({
        "tool": "search_cabs",
        "args": {"pickup": f"{dest} Airport"},
    })


# ─────────────────────────────────────────────────────────────────────────────
# GROQ FALLBACK  (free, fast, reliable — Llama 3.3 70B)
# ─────────────────────────────────────────────────────────────────────────────

async def _groq_response(
    message:      str,
    session,
    user_profile: dict,
    full_system:  str,
    history:      list = None,
) -> dict:
    try:
        groq_key = settings.GROQ_API_KEY
        if not groq_key:
            return _full_fallback_response(
                message, session,
                error        = "no_groq_key",
                user_profile = user_profile,
            )

        client = AsyncGroq(api_key=groq_key)

        messages = [{"role": "system", "content": full_system}]
        for turn in (history or [])[-10:]:
            role = turn.get("role", "user")
            if role not in ("user", "assistant"):
                role = "user"
            messages.append({
                "role":    role,
                "content": turn.get("content", ""),
            })
        messages.append({"role": "user", "content": message})

        response = await client.chat.completions.create(
            model       = "llama-3.3-70b-versatile",
            messages    = messages,
            max_tokens  = 1024,
            temperature = 0.7,
        )

        reply_text = response.choices[0].message.content or ""

        # Keyword matching for tool results
        msg_lower    = message.lower()
        tool_results = {}
        tool_calls   = []

        wealth   = user_profile.get("wealth_signal", "budget")
        tier_map = {
            "ultra":       "luxury",
            "wealthy":     "luxury",
            "comfortable": "business",
            "budget":      "budget",
        }
        tier     = tier_map.get(wealth, "budget")
        cab_pref = user_profile.get("cab_preference", tier)
        origin   = (getattr(session, "origin",      None) or "BOM")
        dest     = (getattr(session, "destination", None) or "DEL")

        if any(w in msg_lower for w in
               ["flight", "fly", "ticket", "travel", "trip", "flies"]):
            tool_results["search_flights"] = FallbackService.get_mock_flights(
                origin, dest,
                depart_date = getattr(session, "depart_date", None),
                passengers  = getattr(session, "passengers", 1),
                tier        = tier,
            )
            tool_calls.append({"tool": "search_flights", "args": {}})

        if any(w in msg_lower for w in
               ["hotel", "stay", "room", "night", "accommodation"]):
            tool_results["search_hotels"] = FallbackService.get_mock_hotels(
                dest,
                check_in  = getattr(session, "depart_date", None),
                check_out = getattr(session, "return_date",  None),
                tier      = tier,
            )
            tool_calls.append({"tool": "search_hotels", "args": {}})

        if any(w in msg_lower for w in
               ["cab", "taxi", "transfer", "pickup", "car", "uber"]):
            tool_results["search_cabs"] = FallbackService.get_mock_cabs(
                f"{dest} Airport",
                f"{dest} City Centre",
                tier = cab_pref,
            )
            tool_calls.append({"tool": "search_cabs", "args": {}})

        if any(w in msg_lower for w in
               ["cancel", "refund", "cancellation"]):
            tool_results["cancel_info"] = {
                "message": (
                    "Please share your booking reference (BK-XXXXXXX) "
                    "and I'll cancel it right away."
                )
            }
            tool_calls.append({"tool": "cancel_booking", "args": {}})

        # Auto round-trip safety net
        depart = getattr(session, "depart_date", None)
        ret    = getattr(session, "return_date",  None)
        if (depart and ret and dest
                and "search_hotels" not in tool_results
                and _days_between(depart, ret) > 1):
            tool_results["search_hotels"] = FallbackService.get_mock_hotels(
                dest,
                check_in  = depart,
                check_out = ret,
                tier      = tier,
            )
            tool_results["search_cabs"] = FallbackService.get_mock_cabs(
                f"{dest} Airport",
                f"{dest} City Centre",
                tier = cab_pref,
            )
            tool_calls.append({"tool": "search_hotels", "args": {}})
            tool_calls.append({"tool": "search_cabs",   "args": {}})

        print(f"[Groq] Success — llama-3.3-70b-versatile")

        return {
            "reply":           reply_text,
            "tool_calls":      tool_calls,
            "tool_results":    tool_results,
            "entities":        {},
            "fallback_used":   False,
            "fallback_reason": None,
        }

    except Exception as e:
        print(f"[Groq] Error: {e}")
        return _full_fallback_response(
            message, session,
            error        = str(e),
            user_profile = user_profile,
        )
# ─────────────────────────────────────────────────────────────────────────────
# FULL FALLBACK
# ─────────────────────────────────────────────────────────────────────────────

def _full_fallback_response(
    message:      str,
    session,
    error:        str = "",
    user_profile: dict = None,
) -> dict:
    return FallbackService.get_personalized_fallback(
        message      = message,
        session      = session,
        user_profile = user_profile or {},
    )


# ─────────────────────────────────────────────────────────────────────────────
# MAIN — get_response()
# ─────────────────────────────────────────────────────────────────────────────

async def get_response(
    message:      str,
    session,
    history:      list[dict] | None = None,
    user_profile: dict | None       = None,
) -> dict:
    profile     = user_profile or {}
    full_system = _build_system_prompt(session, profile)

    # ── Use Groq if Gemini quota is exhausted or key missing ──────────────
    if _is_quota_exhausted() or not settings.GEMINI_API_KEY:
        if settings.GROQ_API_KEY:
            print("[GeminiService] Routing to Groq — Gemini unavailable")
            return await _groq_response(
                message      = message,
                session      = session,
                user_profile = profile,
                full_system  = full_system,
                history      = history,
            )
        return _full_fallback_response(
            message, session,
            error        = "no_ai_available",
            user_profile = profile,
        )

    # ── 1. Cache check ────────────────────────────────────────────────────
    cached = _get_cached(message)
    if cached:
        return cached

    # # ── 2-4. Rate limit guards ────────────────────────────────────────────
    # allowed, limit_reason = _gemini_rate_limit_check()
    # if not allowed:
    #     print(f"[GeminiService] Throttled: {limit_reason}")
    #     return _full_fallback_response(
    #         message, session,
    #         error        = limit_reason,
    #         user_profile = profile,
    #     )

    # ── 5. Build inputs ───────────────────────────────────────────────────
    full_system = _build_system_prompt(session, profile)

    # Build contents list from history
    contents = []
    for turn in (history or [])[-10:]:
        role = "user" if turn.get("role") == "user" else "model"
        contents.append(
            types.Content(
                role  = role,
                parts = [types.Part(text=turn.get("content", ""))],
            )
        )

    # Add current user message
    contents.append(
        types.Content(
            role  = "user",
            parts = [types.Part(text=message)],
        )
    )

    # ── 6. Call Gemini ────────────────────────────────────────────────────
    try:
        client = _get_client()

        config = types.GenerateContentConfig(
            system_instruction = full_system,
            tools              = TOOLS,
        )

        response = await asyncio.to_thread(
            client.models.generate_content,
            model    = "gemini-2.0-flash",
            contents = contents,
            config   = config,
        )

        tool_calls_made  = []
        tool_results_map = {}

        # ── Agentic tool loop ─────────────────────────────────────────────
        MAX_ROUNDS  = 4
        round_count = 0

        while round_count < MAX_ROUNDS:
            round_count    += 1
            function_calls  = _get_function_calls(response)

            if not function_calls:
                break   # Gemini has a text answer — done

            # Add model's tool call turn to contents
            contents.append(
                types.Content(
                    role  = "model",
                    parts = [
                        types.Part(function_call=fc)
                        for fc in function_calls
                    ],
                )
            )

            # Execute all tools in parallel
            tasks   = [
                _execute_tool(fc.name, dict(fc.args), session, profile)
                for fc in function_calls
            ]
            results = await asyncio.gather(*tasks)

            # Record what was called
            for fc, result in zip(function_calls, results):
                tool_calls_made.append({
                    "tool": fc.name,
                    "args": dict(fc.args),
                })
                tool_results_map[fc.name] = result

            # Build function response parts
            function_response_parts = [
                types.Part(
                    function_response = types.FunctionResponse(
                        name     = fc.name,
                        response = result,
                    )
                )
                for fc, result in zip(function_calls, results)
            ]

            # Add tool results to contents
            contents.append(
                types.Content(
                    role  = "user",
                    parts = function_response_parts,
                )
            )

            # Send back to Gemini with all results
            response = await asyncio.to_thread(
                client.models.generate_content,
                model    = "gemini-2.0-flash",
                contents = contents,
                config   = config,
            )

        # ── Extract final text reply ──────────────────────────────────────
        reply_text = _get_text_from_response(response)

        if not reply_text:
            reply_text = (
                "I've found the best options for you above. "
                "Shall I confirm a booking?"
            )

        # ── Round-trip safety net ─────────────────────────────────────────
        await _apply_roundtrip_safety_net(
            session, profile, tool_results_map, tool_calls_made
        )

        # ── Extract entities for session sync ─────────────────────────────
        entities = _extract_entities(tool_calls_made)

        result = {
            "reply":           reply_text,
            "tool_calls":      tool_calls_made,
            "tool_results":    tool_results_map,
            "entities":        entities,
            "fallback_used":   False,
            "fallback_reason": None,
        }

        # Cache successful response
        _set_cache(message, result)
        return result

    # ── Error handling ────────────────────────────────────────────────────

    
    # Remove these two:
    except genai_errors.ClientError as e:
        err_str = str(e).lower()
        if "429" in str(e) or "resource_exhausted" in err_str or "quota" in err_str:
            print(f"[GeminiService] 429 quota exhausted — cooling 60s")
            _mark_quota_exhausted(seconds=60)
            return _full_fallback_response(
                message, session,
                error        = "quota_exhausted",
                user_profile = profile,
            )
        print(f"[GeminiService] ClientError: {e}")
        return _full_fallback_response(
            message, session,
            error        = str(e),
            user_profile = profile,
        )

    except genai_errors.ServerError as e:
        print(f"[GeminiService] ServerError: {e}")
        return _full_fallback_response(
            message, session,
            error        = "service_unavailable",
            user_profile = profile,
        )

    except Exception as e:
        err_str = str(e).lower()
        if any(kw in err_str for kw in
               ["quota", "429", "resource_exhausted", "exhausted"]):
            print(f"[GeminiService] Quota error: {e}")
            _mark_quota_exhausted(seconds=60)
            return _full_fallback_response(
                message, session,
                error        = "quota_exhausted",
                user_profile = profile,
            )
        print(f"[GeminiService] Unexpected error: {e}")
        return _full_fallback_response(
            message, session,
            error        = str(e),
            user_profile = profile,
        )

# ─────────────────────────────────────────────────────────────────────────────
# QUICK TEST
# ─────────────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    from dataclasses import dataclass

    @dataclass
    class MockSession:
        user_id:           int  = 1
        session_id:        str  = "test-session"
        origin:            str  = "BOM"
        destination:       str  = "GOA"
        depart_date:       str  = "2025-04-10"
        return_date:       str  = "2025-04-13"
        passengers:        int  = 2
        budget_min:        int  = 5000
        budget_max:        int  = 80000
        travel_style:      str  = "luxury"
        active_booking_id: str  = None
        current_intent:    str  = None

    wealthy_profile = {
        "name":                   "Arjun Mehta",
        "wealth_signal":          "wealthy",
        "cab_preference":         "luxury",
        "preferred_hotel_stars":  5,
        "preferred_airlines":     ["Emirates", "Qatar Airways"],
        "preferred_hotel_chains": ["Taj", "Leela"],
        "special_requests":       ["window seat", "veg meal"],
        "is_corp_traveller":      True,
        "has_family":             False,
        "avg_flight_spend":       55000,
        "total_bookings":         12,
        "last_destinations":      ["Dubai", "Singapore", "London"],
        "always_books_hotel":     True,
        "always_books_cab":       True,
    }

    async def test():
        session = MockSession()

        print("=" * 55)
        print("TEST — 3-night trip (should auto-bundle hotel + cabs)")
        print("=" * 55)
        result = await get_response(
            message      = "I want to fly to Goa for 3 nights next Friday",
            session      = session,
            history      = [],
            user_profile = wealthy_profile,
        )
        print(f"Reply:         {result['reply'][:100]}...")
        print(f"Tools fired:   {[t['tool'] for t in result['tool_calls']]}")
        print(f"Fallback used: {result['fallback_used']}")
        if result.get("fallback_reason"):
            print(f"Reason:        {result['fallback_reason']}")

    asyncio.run(test())
