# POLO/config.py
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):

    # ── AI ──────────────────────────────────────
    GROQ_API_KEY:    str = ""
    GEMINI_API_KEY:  str = ""  # leave empty if quota exhausted; routes to Groq
    #

    # ── Auth ────────────────────────────────────
    JWT_SECRET:            str = "change-me-in-production-minimum-32-chars"
    JWT_ALGORITHM:         str = "HS256"
    ACCESS_TOKEN_MINUTES:  int = 60
    REFRESH_TOKEN_DAYS:    int = 7

    # ── Database ─────────────────────────────────
    DATABASE_PATH: str = "./POLO.db"

    # ── App ──────────────────────────────────────
    APP_ENV:     str = "development"
    CORS_ORIGIN: str = "http://localhost:5173"

    # ── Django connector (fill later) ────────────
    DJANGO_API_URL:    str = ""
    DJANGO_SECRET_KEY: str = ""

    class Config:
        env_file = ".env"
        extra    = "ignore"


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()