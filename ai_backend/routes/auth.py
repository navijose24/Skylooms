# chatbot/routes/auth.py

import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
# from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timedelta
from typing import Optional

from database.connection import AsyncSessionLocal
from database import crud
from config import settings

router  = APIRouter()
bearer  = HTTPBearer()

import bcrypt as _bcrypt

class pwd_ctx:
    @staticmethod
    def hash(password: str) -> str:
        return _bcrypt.hashpw(
            password[:72].encode("utf-8"),
            _bcrypt.gensalt(rounds=12)
        ).decode("utf-8")

    @staticmethod
    def verify(password: str, hashed: str) -> bool:
        try:
            return _bcrypt.checkpw(
                password[:72].encode("utf-8"),
                hashed.encode("utf-8")
            )
        except Exception:
            return False



# ─────────────────────────────────────────────────────────────────────────────
# SCHEMAS
# ─────────────────────────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    name:     str
    email:    str
    password: str
    phone:    Optional[str] = None

class LoginRequest(BaseModel):
    email:    str
    password: str

class TokenResponse(BaseModel):
    access_token:  str
    refresh_token: str
    token_type:    str = "bearer"
    user:          dict

class RefreshRequest(BaseModel):
    refresh_token: str


# ─────────────────────────────────────────────────────────────────────────────
# TOKEN HELPERS
# ─────────────────────────────────────────────────────────────────────────────

def _make_access_token(user_id: int, email: str) -> str:
    payload = {
        "sub":   str(user_id),
        "email": email,
        "type":  "access",
        "exp":   datetime.utcnow() + timedelta(
                     minutes=settings.ACCESS_TOKEN_MINUTES
                 ),
    }
    return jwt.encode(
        payload,
        settings.JWT_SECRET,
        algorithm=settings.JWT_ALGORITHM,
    )


def _make_refresh_token(user_id: int) -> str:
    payload = {
        "sub":  str(user_id),
        "type": "refresh",
        "exp":  datetime.utcnow() + timedelta(
                    days=settings.REFRESH_TOKEN_DAYS
                ),
    }
    return jwt.encode(
        payload,
        settings.JWT_SECRET,
        algorithm=settings.JWT_ALGORITHM,
    )


# ─────────────────────────────────────────────────────────────────────────────
# AUTH DEPENDENCY  — use in any route that needs a logged-in user
# ─────────────────────────────────────────────────────────────────────────────

async def get_current_user(
    creds: HTTPAuthorizationCredentials = Depends(bearer),
) -> dict:
    token = creds.credentials
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM],
        )
    except JWTError:
        raise HTTPException(401, "Invalid or expired token")

    if payload.get("type") != "access":
        raise HTTPException(401, "Wrong token type")

    return {
        "user_id": int(payload["sub"]),
        "email":   payload.get("email", ""),
    }


# ─────────────────────────────────────────────────────────────────────────────
# ROUTES
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/register", response_model=TokenResponse)
async def register(body: RegisterRequest):
    async with AsyncSessionLocal() as db:

        # Check duplicate email
        existing = await crud.get_user_by_email(db, body.email)
        if existing:
            raise HTTPException(400, "Email already registered")

        # Create user
        password_hash = pwd_ctx.hash(body.password)
        user = await crud.create_user(
            db            = db,
            name          = body.name.strip(),
            email         = body.email.strip().lower(),
            password_hash = password_hash,
            phone         = body.phone,
        )

    access  = _make_access_token(user.id, user.email)
    refresh = _make_refresh_token(user.id)

    return TokenResponse(
        access_token  = access,
        refresh_token = refresh,
        user = {
            "id":    user.id,
            "name":  user.name,
            "email": user.email,
            "phone": user.phone,
        },
    )


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest):
    async with AsyncSessionLocal() as db:
        user = await crud.get_user_by_email(db, body.email)

        # Auto-create for demo convenience
        if not user:
            password_hash = pwd_ctx.hash(body.password)
            user = await crud.create_user(
                db            = db,
                name          = body.email.split("@")[0].title(),
                email         = body.email.strip().lower(),
                password_hash = password_hash,
            )
        else:
            if not pwd_ctx.verify(body.password, user.password_hash):
                raise HTTPException(401, "Incorrect password")

    access  = _make_access_token(user.id, user.email)
    refresh = _make_refresh_token(user.id)

    return TokenResponse(
        access_token  = access,
        refresh_token = refresh,
        user = {
            "id":    user.id,
            "name":  user.name,
            "email": user.email,
            "phone": user.phone,
        },
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(body: RefreshRequest):
    try:
        payload = jwt.decode(
            body.refresh_token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM],
        )
    except JWTError:
        raise HTTPException(401, "Invalid refresh token")

    if payload.get("type") != "refresh":
        raise HTTPException(401, "Wrong token type")

    user_id = int(payload["sub"])

    async with AsyncSessionLocal() as db:
        user = await crud.get_user_by_id(db, user_id)
        if not user:
            raise HTTPException(404, "User not found")

    access  = _make_access_token(user.id, user.email)
    refresh = _make_refresh_token(user.id)

    return TokenResponse(
        access_token  = access,
        refresh_token = refresh,
        user = {
            "id":    user.id,
            "name":  user.name,
            "email": user.email,
            "phone": user.phone,
        },
    )


@router.get("/me")
async def me(current_user: dict = Depends(get_current_user)):
    async with AsyncSessionLocal() as db:
        user = await crud.get_user_by_id(db, current_user["user_id"])
        if not user:
            raise HTTPException(404, "User not found")

        profile = await crud.get_profile_dict(user.id, db)

    return {
        "id":           user.id,
        "name":         user.name,
        "email":        user.email,
        "phone":        user.phone,
        "profile":      profile,
        "created_at":   user.created_at.isoformat() if user.created_at else None,
    }