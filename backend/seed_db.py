"""
Re-seed script: clears users collection and inserts fresh demo users.
Run from the backend folder:
    python seed_db.py
"""
import asyncio
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from datetime import datetime
from passlib.context import CryptContext
from motor.motor_asyncio import AsyncIOMotorClient

# ── Read .env manually (no fastapi dependency) ──────────────────────
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

MONGODB_URL = os.getenv("MONGODB_URL", "")
if not MONGODB_URL:
    print("❌ MONGODB_URL not found in .env"); sys.exit(1)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

DEMO_USERS = [
    {"email": "admin@resume.ai",       "name": "Super Admin",        "password": "Admin@123",  "role": "admin",      "company": "Resume AI Inc."},
    {"email": "hr@techcorp.com",        "name": "Sarah HR Manager",   "password": "Hr@12345",   "role": "hr",         "company": "TechCorp"},
    {"email": "employer@globex.com",    "name": "Mr Employer",        "password": "Emp@12345",  "role": "employer",   "company": "Globex Corp"},
    {"email": "enterprise@bigfirm.com", "name": "Big Firm Ltd Team",  "password": "Ent@12345",  "role": "enterprise", "company": "Big Firm Ltd."},
    {"email": "john@example.com",       "name": "John Doe",           "password": "Cand@123",   "role": "candidate",  "company": None},
    {"email": "jane@example.com",       "name": "Jane Smith",         "password": "Cand@123",   "role": "candidate",  "company": None},
    {"email": "mike@example.com",       "name": "Mike Johnson",       "password": "Cand@123",   "role": "candidate",  "company": None},
    {"email": "alice@example.com",      "name": "Alice Williams",     "password": "Cand@123",   "role": "candidate",  "company": None},
]


async def seed():
    # Parse DB name from URL
    raw = MONGODB_URL.split("/")[-1].split("?")[0] or "resume_platform"
    db_name = raw

    is_srv = MONGODB_URL.startswith("mongodb+srv://")
    print(f"🌱 Connecting to MongoDB (db={db_name}, tls={is_srv})...")
    
    mongo_kwargs = {
        "serverSelectionTimeoutMS": 5000,
        "tls": is_srv
    }
    if is_srv:
        mongo_kwargs["tlsAllowInvalidCertificates"] = True

    client = AsyncIOMotorClient(MONGODB_URL, **mongo_kwargs)
    try:
        await client.admin.command("ping")
        print("✅ Connected")
    except Exception as e:
        print(f"❌ Cannot connect: {e}"); return

    db = client[db_name]

    # Wipe old seeded users
    emails = [u["email"] for u in DEMO_USERS]
    result = await db.users.delete_many({"email": {"$in": emails}})
    print(f"🗑  Removed {result.deleted_count} old demo user(s)")

    # Insert fresh
    docs = []
    for u in DEMO_USERS:
        docs.append({
            "email": u["email"],
            "name": u["name"],
            "password_hash": pwd_context.hash(u["password"]),
            "auth_provider": "email",
            "role": u["role"],
            "company": u.get("company"),
            "photo_url": None,
            "firebase_uid": None,
            "is_active": True,
            "onboarding_complete": True,
            "created_at": datetime.utcnow(),
            "last_login": datetime.utcnow(),
        })

    await db.users.insert_many(docs)
    client.close()

    print(f"\n✅ Inserted {len(docs)} demo users successfully!\n")
    print("━" * 55)
    print(f"{'ROLE':<12} {'EMAIL':<32} PASSWORD")
    print("━" * 55)
    for u in DEMO_USERS:
        print(f"{u['role']:<12} {u['email']:<32} {u['password']}")
    print("━" * 55)


if __name__ == "__main__":
    asyncio.run(seed())
