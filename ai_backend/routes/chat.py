# chatbot/routes/chat.py

import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional

from routes.auth import get_current_user
from services.gemini_service import get_response
from services.profile_engine import ProfileEngine

router = APIRouter()


# ─────────────────────────────────────────────────────────────────────────────
# SCHEMAS
# ─────────────────────────────────────────────────────────────────────────────

class ChatRequest(BaseModel):
    message:    str
    session_id: Optional[str] = None

class ChatResponse(BaseModel):
    reply:            str
    session_id:       str
    tool_calls:       list         = []
    flights:          Optional[list] = None
    hotels:           Optional[list] = None
    cabs:             Optional[list] = None
    booking:          Optional[dict] = None
    cancellation:     Optional[dict] = None
    fallback_used:    bool           = False
    fallback_reason:  Optional[str]  = None


# ─────────────────────────────────────────────────────────────────────────────
# HELPER — extract list from tool result dict
# ─────────────────────────────────────────────────────────────────────────────

def _extract_list(tool_results: dict, key: str) -> Optional[list]:
    result = tool_results.get(key)
    if not result:
        return None
    if isinstance(result, dict):
        return (
            result.get("data") or
            result.get("flights") or
            result.get("hotels") or
            result.get("cabs")
        )
    if isinstance(result, list):
        return result
    return None


# ─────────────────────────────────────────────────────────────────────────────
# POST /chat  — the main endpoint that ties everything together
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/chat", response_model=ChatResponse)
async def chat(
    body:         ChatRequest,
    current_user: dict = Depends(get_current_user),
):
    user_id = current_user["user_id"]

    # ── 1. Load user profile (personalization context) ────────────────────
    # Runs in parallel with session load — profile never blocks the response
    user_profile = await ProfileEngine.get_profile_dict(user_id)

    # ── 2. Passively learn from what the user just said ───────────────────
    # Fire and forget — doesn't block the response
    # Updates wealth signals, special requests, family flags etc.
    await ProfileEngine.learn_from_message(user_id, body.message)

    # ── 3. Load or create session ─────────────────────────────────────────
    session = await ProfileEngine.get_or_create_session(
        user_id    = user_id,
        session_id = body.session_id,
    )

    # ── 4. Load conversation history for multi-turn context ───────────────
    history = await ProfileEngine.get_history(
        session_id = session.session_id,
        limit      = 10,
    )

    # ── 5. Call Gemini with full profile + history ────────────────────────
    # gemini_service handles:
    #   - rate limiting (RPM + RPD)
    #   - response caching (5 min)
    #   - parallel tool execution
    #   - round-trip safety net (auto hotels + cabs)
    #   - personalized fallback if Gemini is down
    ai_result = await get_response(
        message      = body.message,
        session      = session,
        history      = history,
        user_profile = user_profile,
    )

    reply          = ai_result["reply"]
    tool_calls     = ai_result.get("tool_calls",     [])
    tool_results   = ai_result.get("tool_results",   {})
    entities       = ai_result.get("entities",       {})
    fallback_used  = ai_result.get("fallback_used",  False)
    fallback_reason= ai_result.get("fallback_reason", None)

    # ── 6. Save user message to DB ────────────────────────────────────────
    await ProfileEngine.save_message(
        session_id = session.session_id,
        role       = "user",
        content    = body.message,
    )

    # ── 7. Save assistant reply to DB ─────────────────────────────────────
    await ProfileEngine.save_message(
        session_id = session.session_id,
        role       = "assistant",
        content    = reply,
        intent     = entities.get("intent"),
        tool_calls = tool_calls,
    )

    # ── 8. Sync extracted travel entities back to session ─────────────────
    # So next message in same conversation knows origin/destination/dates
    if entities:
        await ProfileEngine.save_session_entities(session, entities)

    # ── 9. If a booking was confirmed — save it and update profile ─────────
    booking_result = tool_results.get("create_booking")
    if booking_result and booking_result.get("status") == "confirmed":
        await ProfileEngine.save_booking(
            user_id      = user_id,
            booking_type = booking_result.get("booking_type", "flight"),
            booking_ref  = booking_result.get("booking_ref", ""),
            pnr          = booking_result.get("pnr"),
            total_price  = booking_result.get("total_price"),
            raw_data     = booking_result,
            origin       = getattr(session, "origin",      None),
            destination  = getattr(session, "destination", None),
            depart_date  = getattr(session, "depart_date", None),
            return_date  = getattr(session, "return_date", None),
            passengers   = getattr(session, "passengers",  1),
        )

    # ── 10. If a cancellation was processed — update booking in DB ─────────
    cancel_result = tool_results.get("cancel_booking")
    if cancel_result and cancel_result.get("status") == "cancelled":
        await ProfileEngine.cancel_booking(
            user_id     = user_id,
            booking_ref = cancel_result.get("booking_ref", ""),
            reason      = cancel_result.get("reason", "user_requested"),
        )

    # ── 11. Unpack tool results for the response ───────────────────────────
    flights      = _extract_list(tool_results, "search_flights")
    hotels       = _extract_list(tool_results, "search_hotels")
    cabs         = _extract_list(tool_results, "search_cabs")
    booking      = tool_results.get("create_booking")
    cancellation = tool_results.get("cancel_booking")

    return ChatResponse(
        reply           = reply,
        session_id      = session.session_id,
        tool_calls      = tool_calls,
        flights         = flights,
        hotels          = hotels,
        cabs            = cabs,
        booking         = booking,
        cancellation    = cancellation,
        fallback_used   = fallback_used,
        fallback_reason = fallback_reason,
    )


# ─────────────────────────────────────────────────────────────────────────────
# SESSION ROUTES  (for chat history sidebar)
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/sessions")
async def list_sessions(
    current_user: dict = Depends(get_current_user),
):
    sessions = await ProfileEngine.list_sessions(current_user["user_id"])
    return {"sessions": sessions}


@router.delete("/sessions/{session_id}")
async def delete_session(
    session_id:   str,
    current_user: dict = Depends(get_current_user),
):
    deleted = await ProfileEngine.delete_session(
        session_id = session_id,
        user_id    = current_user["user_id"],
    )
    if not deleted:
        raise HTTPException(404, "Session not found")
    return {"message": "Session deleted"}


# ─────────────────────────────────────────────────────────────────────────────
# BOOKINGS ROUTES
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/bookings")
async def get_bookings(
    limit:        int  = 20,
    offset:       int  = 0,
    status:       str  = None,
    current_user: dict = Depends(get_current_user),
):
    return await ProfileEngine.get_bookings(
        user_id = current_user["user_id"],
        limit   = limit,
        offset  = offset,
        status  = status,
    )


@router.delete("/bookings/{booking_ref}")
async def cancel_booking(
    booking_ref:  str,
    body:         dict,
    current_user: dict = Depends(get_current_user),
):
    reason = body.get("reason", "user_requested")
    result = await ProfileEngine.cancel_booking(
        user_id     = current_user["user_id"],
        booking_ref = booking_ref,
        reason      = reason,
    )
    if "error" in result:
        raise HTTPException(404, result["error"])
    return result