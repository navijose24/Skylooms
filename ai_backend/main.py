# chatbot/main.py

import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from config import settings
from database.connection import init_db
from database.seed import seed
from routes.auth import router as auth_router
from routes.chat import router as chat_router


# ─────────────────────────────────────────────────────────────────────────────
# STARTUP / SHUTDOWN
# ─────────────────────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):

    # ── Database ──────────────────────────────────────────────────────────
    await init_db()
    await seed()

    # ── AI backend ────────────────────────────────────────────────────────
    if settings.GEMINI_API_KEY:
        try:
            from google import genai
            genai.Client(api_key=settings.GEMINI_API_KEY)
            print("✅  Gemini client ready")
        except Exception as e:
            print(f"⚠️   Gemini client error: {e}")
    else:
        print("⚠️   GEMINI_API_KEY not set — routing AI calls to Groq")

    if settings.GROQ_API_KEY:
        print("✅  Groq client ready (llama-3.3-70b-versatile)")
    else:
        print("⚠️   GROQ_API_KEY missing — only fallback mock data available")

    print("🚀  SkyMind chatbot service ready")
    print(f"📍  Running on http://localhost:8001")
    print(f"📖  API docs at http://localhost:8001/docs")

    yield

    print("👋  Shutting down SkyMind")


# ─────────────────────────────────────────────────────────────────────────────
# APP
# ─────────────────────────────────────────────────────────────────────────────

app = FastAPI(
    title       = "SkyMind Chatbot API",
    description = "AI-powered travel assistant with personalization",
    version     = "1.0.0",
    lifespan    = lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins = [
        settings.CORS_ORIGIN,
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ],
    allow_credentials = True,
    allow_methods     = ["*"],
    allow_headers     = ["*"],
)


# ─────────────────────────────────────────────────────────────────────────────
# ROUTERS
# ─────────────────────────────────────────────────────────────────────────────

app.include_router(auth_router, prefix="/auth", tags=["auth"])
app.include_router(chat_router, prefix="",      tags=["chat"])


# ─────────────────────────────────────────────────────────────────────────────
# HEALTH
# ─────────────────────────────────────────────────────────────────────────────

@app.get("/health", tags=["system"])
async def health():
    """
    Called by the frontend status panel every 30 seconds.
    Returns live status of every dependency.
    """
    import time

    # Safe import of rate limit state
    try:
        from services.gemini_service import (
            _is_quota_exhausted,
            _rpm_window,
            _rpd_counts,
        )
        today     = time.strftime("%Y-%m-%d", time.gmtime())
        rpm_used  = len([t for t in _rpm_window if t > time.time() - 60])
        rpd_used  = _rpd_counts.get(today, 0)
        exhausted = _is_quota_exhausted()
    except Exception:
        rpm_used  = 0
        rpd_used  = 0
        exhausted = False

    # Gemini status
    if not settings.GEMINI_API_KEY:
        gemini_status = "not_configured"
    elif exhausted:
        gemini_status = "quota_exceeded"
    else:
        gemini_status = "online"

    # Groq status
    groq_status = "online" if settings.GROQ_API_KEY else "not_configured"

    # Active model
    if settings.GEMINI_API_KEY and not exhausted:
        active_model = "gemini-2.0-flash"
    elif settings.GROQ_API_KEY:
        active_model = "llama-3.3-70b-versatile (Groq)"
    else:
        active_model = "fallback_mock"

    # DB status
    try:
        from database.connection import engine
        from sqlalchemy import text
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        db_status = "online"
    except Exception:
        db_status = "error"

    return {
        "app":             "online",
        "gemini":          gemini_status,
        "groq":            groq_status,
        "active_model":    active_model,
        "database":        db_status,
        "fallback_active": exhausted or not settings.GEMINI_API_KEY,
        "rpm_used":        rpm_used,
        "rpm_limit":       14,
        "rpd_used":        rpd_used,
        "rpd_limit":       1490,
    }


# ─────────────────────────────────────────────────────────────────────────────
# ROOT
# ─────────────────────────────────────────────────────────────────────────────

@app.get("/", tags=["system"])
async def root():
    return {
        "message": "SkyMind Chatbot API ✈️",
        "docs":    "http://localhost:8001/docs",
        "health":  "http://localhost:8001/health",
        "status":  "running",
    }