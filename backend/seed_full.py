# seed_full.py
import asyncio
import os
from datetime import datetime
from passlib.context import CryptContext
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

MONGODB_URL = os.getenv("MONGODB_URL", "")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

DEMO_USERS = [
    {"email": "admin@resume.ai", "name": "Super Admin", "password": "Admin@123", "role": "admin", "company": "Resume AI Inc."},
    {"email": "hr@techcorp.com", "name": "Sarah HR", "password": "Hr@12345", "role": "hr", "company": "TechCorp"},
    {"email": "john@example.com", "name": "John Doe", "password": "Cand@123", "role": "candidate", "company": None},
    {"email": "jane@example.com", "name": "Jane Smith", "password": "Cand@123", "role": "candidate", "company": None},
]

DEMO_JOBS = [
    {
        "title": "Senior AI Engineer",
        "department": "Engineering",
        "location": "San Francisco, CA",
        "employment_type": "Full-Time",
        "description": "We are looking for an AI expert to build next-gen resume intelligence...",
        "requirements": ["Python", "PyTorch", "NLP", "FastAPI"],
        "status": "Open",
        "is_remote": True,
        "company_id": "TechCorp"
    },
    {
        "title": "Full Stack Developer",
        "department": "Product",
        "location": "New York, NY",
        "employment_type": "Contract",
        "description": "Help us build the most beautiful React dashboards...",
        "requirements": ["React", "TypeScript", "Tailwind", "Node.js"],
        "status": "Open",
        "is_remote": False,
        "company_id": "TechCorp"
    }
]

SAMPLE_RESUME_TEXT = """
JOHN DOE
Software Engineer | Python Expert
Email: john@example.com

SUMMARY:
Highly motivated software engineer with 5+ years of experience in Python, FastAPI, and React.

EXPERIENCE:
Senior Developer at GlobalTech (2020 - Present)
- Led a team of 5 developers to build a scalable microservices architecture.
- Improved system performance by 40% using Redis caching.

Software Engineer at StartupX (2018 - 2020)
- Developed RESTful APIs using Python and Flask.
- Mentored junior developers and improved code quality through peer reviews.

SKILLS:
Python, FastAPI, React, TypeScript, Docker, Kubernetes, AWS, SQL.

EDUCATION:
BS in Computer Science, University of Technology (2014 - 2018)
"""

async def seed_database(db):
    """Seed the provided database instance with demo data."""
    print("👤 Seeding Users...")
    user_docs = []
    for u in DEMO_USERS:
        user_docs.append({
            "email": u["email"],
            "name": u["name"],
            "password_hash": pwd_context.hash(u["password"]),
            "auth_provider": "email",
            "role": u["role"],
            "company": u.get("company"),
            "is_active": True,
            "onboarding_complete": True,
            "created_at": datetime.utcnow(),
            "last_login": datetime.utcnow()
        })
    res_users = await db.users.insert_many(user_docs)
    john_id = str(res_users.inserted_ids[2])
    
    print("💼 Seeding Jobs...")
    job_docs = []
    for j in DEMO_JOBS:
        j["created_by"] = str(res_users.inserted_ids[1]) # Sarah HR
        j["created_at"] = datetime.utcnow()
        j["updated_at"] = datetime.utcnow()
        job_docs.append(j)
    await db.jobs.insert_many(job_docs)

    print("📄 Seeding Resumes...")
    resume_doc = {
        "user_id": john_id,
        "title": "Master Software Engineering Resume",
        "raw_text": SAMPLE_RESUME_TEXT,
        "sections": {
            "summary": "Highly motivated software engineer...",
            "experience": "Senior Developer at GlobalTech...",
            "skills": "Python, FastAPI, React..."
        },
        "ats_score": 85,
        "is_public": True,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    await db.resumes.insert_one(resume_doc)
    print("✅ Full Seeding Complete!")

async def seed():
    client = AsyncIOMotorClient(MONGODB_URL)
    db_name = MONGODB_URL.split("/")[-1].split("?")[0] or "resume_platform"
    db = client[db_name]

    print("🧹 Cleaning collections...")
    await db.users.delete_many({})
    await db.resumes.delete_many({})
    await db.jobs.delete_many({})
    await db.applications.delete_many({})

    await seed_database(db)
    client.close()

if __name__ == "__main__":
    asyncio.run(seed())

if __name__ == "__main__":
    asyncio.run(seed())
