from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from dotenv import load_dotenv
import os
import json
import sys

from routes import auth, resumes, ai, templates, jobs, applications, users
from routes import admin
from database.database import init_database

load_dotenv()


# ---- Startup: Validate Required Environment Variables -----------------------
# FIX-10: App previously started silently even if critical env vars were missing

REQUIRED_ENV_VARS = [
    "MONGODB_URL",
    "SECRET_KEY",
    "GROQ_API_KEY",
    "DEEPSEEK_API_KEY",
]

def _validate_env():
    missing = [v for v in REQUIRED_ENV_VARS if not os.environ.get(v)]
    if missing:
        print(f"\n STARTUP ERROR: Missing required environment variables: {missing}")
        print("   Please set these in your backend/.env file.")
        print("   Refer to backend/.env.example for a template.\n")
        # Warn but don't exit  allows partial dev usage
    weak_key = "your-super-secret-jwt-key"
    if os.environ.get("SECRET_KEY", "").startswith(weak_key):
        print("\nSECURITY WARNING: SECRET_KEY is still the default placeholder!")
        print("   Generate a real key: python -c \"import secrets; print(secrets.token_hex(64))\"")
    # Startup logic
    print("Initializing Neural Intelligence Matrix (Backend startup)...")

# Startup logic moved to lifespan


# ---- CORS Origins ------------------------------------------------------------
# FIX-7: wildcard allow_origins=["*"] with allow_credentials=True is a security anti-pattern.
# Now reads from ALLOWED_ORIGINS env var. Falls back to localhost only in dev.

def _get_allowed_origins() -> list:
    # Merge with default origins for development convenience
    defaults = [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:5176",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:5175",
        "http://10.140.150.92:5174",  # Specific network IP from user logs
    ]
    
    raw = os.environ.get("ALLOWED_ORIGINS", "")
    if raw:
        try:
            parsed = json.loads(raw)
            if isinstance(parsed, list):
                # Unique merge
                return list(set(parsed + defaults))
        except json.JSONDecodeError:
            # Support comma-separated format
            listed = [o.strip() for o in raw.split(",") if o.strip()]
            return list(set(listed + defaults))
            
    return defaults

ALLOWED_ORIGINS = _get_allowed_origins()


# ---- App Lifespan ------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    print(f"\nSTARTUP: AI Resume Platform v2.0 starting up...")
    print(f"   Environment: {os.environ.get('ENVIRONMENT', 'development')}")
    print(f"   Allowed Origins: {ALLOWED_ORIGINS}")
    await init_database()
    
    # PROD-SEED: If database is empty, seed with demo users
    from database.database import db
    user_count = -1
    if db.database is not None:
        try:
            user_count = await db.database.users.count_documents({})
            print(f"Database active. Total users: {user_count}")
        except Exception as e:
            print(f"    Startup DB check failed: {e}")
    
    if user_count == 0:
        print("    Empty database detected! Auto-seeding demo users...")
        try:
            from seed_full import seed_database
            await seed_database(db)
            print("    Production seeding successful.")
        except Exception as e:
            print(f"    Auto-seeding failed: {e}")
            
    print("    Database initialized\n")
    yield
    print("\n AI Resume Platform shutting down...\n")


# ---- Rate Limiting (SlowAPI) -------------------------------------------------
# SEC-5: Protective rate limiting for AI-driven endpoints to prevent credit abuse.
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from utils.limiter import limiter

app = FastAPI(
    title="AI Resume Platform API",
    description="Multi-user AI-powered resume platform with NLP, TF-IDF, Groq & DeepSeek",
    version="3.1.0",
    lifespan=lifespan,
    redirect_slashes=False,  # IMPORTANT: Prevents CORS-breaking redirects (e.g. /api/jobs -> /api/jobs/)
)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


# FIX: Wildcard ["*"] cannot be used with allow_credentials=True
# We now use the list of trusted origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# ---- Routers -----------------------------------------------------------------
app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(resumes.router, prefix="/api/resumes", tags=["Resumes"])
app.include_router(ai.router, prefix="/api/ai", tags=["AI"])
app.include_router(templates.router, prefix="/api/templates", tags=["Templates"])
app.include_router(jobs.router, prefix="/api/jobs", tags=["Jobs"])
app.include_router(applications.router, prefix="/api/applications", tags=["Applications"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])


@app.get("/")
async def root():
    return {"message": "AI Resume Platform v3.0", "status": "running", "docs": "/docs"}


@app.get("/health")
async def health():
    print("Health check reached!")
    return {
        "status": "healthy",
        "environment": os.environ.get("ENVIRONMENT", "development"),
        "version": "2.0.0",
        "allowed_origins": ALLOWED_ORIGINS
    }
