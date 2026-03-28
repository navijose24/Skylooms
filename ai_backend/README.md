# SkyMind AI Module

This folder contains the **SkyMind AI travel assistant** — a FastAPI backend with Groq (llama-3.3-70b) powering the chatbot.

## What it does
- Conversational flight, hotel, and cab search
- Auto-bundles hotels + cabs for multi-night trips
- Personalized recommendations based on user history
- Cancellation flow

## Structure
```
ai_backend/
├── main.py              # FastAPI app entry point
├── config.py            # Settings (reads from .env)
├── requirements.txt     # Python dependencies
├── routes/
│   ├── auth.py          # JWT register/login
│   └── chat.py          # /chat endpoint
├── services/
│   ├── gemini_service.py   # LLM routing (Groq/Gemini)
│   ├── fallback_service.py # Mock data fallback
│   └── profile_engine.py   # User personalization
└── database/
    ├── models.py        # SQLAlchemy models
    ├── crud.py          # DB operations
    └── connection.py    # SQLite connection
```

## Setup & Run

```bash
cd ai_backend

# Create virtualenv
python -m venv venv
.\venv\Scripts\activate          # Windows
# source venv/bin/activate       # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Create .env file with your keys
# GROQ_API_KEY=your_key_here
# JWT_SECRET=any_random_secret_32chars {python -c "import secrets; print(secrets.token_hex(32))"}

# Start the server
python -m uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

Server runs on **http://localhost:8001**
API docs at **http://localhost:8001/docs**

## Frontend integration
The `SkyMindChat` component (`frontend/src/components/SkyMindChat.jsx`) connects to this backend automatically. It is rendered in `App.jsx` and appears as a floating button on every page.
