
import asyncio
import os
import sys
from dotenv import load_dotenv

# Add backend to sys.path
backend_path = r"c:\Users\princ\Downloads\Resume\Resume-\backend"
if backend_path not in sys.path:
    sys.path.append(backend_path)

load_dotenv(os.path.join(backend_path, ".env"))

from database.database import init_database, db
from ai.groq_service import GroqService
from ai.deepseek_service import DeepSeekService

async def test_connectivity():
    print("--- Connectivity Test ---")
    
    # Test MongoDB
    print("\nTesting MongoDB...")
    success = await init_database()
    if success:
        print("✅ MongoDB Connected")
    else:
        print("❌ MongoDB Connection Failed")
        # Check env
        print(f"MONGODB_URL: {os.environ.get('MONGODB_URL')}")

    # Test Groq
    print("\nTesting Groq...")
    try:
        groq = GroqService()
        resp = await groq.generate_response("Hi, say 'Groq is active'.", max_tokens=10)
        print(f"Response: {resp}")
        if "active" in resp.lower():
            print("✅ Groq AI Working")
        else:
            print("⚠️ Groq AI returned unexpected response")
    except Exception as e:
        print(f"❌ Groq AI Failed: {e}")

    # Test DeepSeek
    print("\nTesting DeepSeek...")
    try:
        ds = DeepSeekService()
        # Just a small test
        resp = await ds.analyze_resume("John Doe. Python Developer.", "Python Expert")
        if resp and resp.get("score"):
            print(f"✅ DeepSeek AI Working (Score: {resp.get('score')})")
        else:
            print("⚠️ DeepSeek AI returned fallback or invalid data")
    except Exception as e:
        print(f"❌ DeepSeek AI Failed: {e}")

    await db.disconnect()

if __name__ == "__main__":
    asyncio.run(test_connectivity())
