import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

async def test_conn():
    uri = os.getenv("MONGODB_URL")
    print(f"Testing connection to: {uri}")
    client = AsyncIOMotorClient(uri) # Use URL from .env
    try:
        await client.admin.command('ping')
        print("✅ Ping successful")
    except Exception as e:
        print(f"❌ Ping failed: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(test_conn())
