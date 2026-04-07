from motor.motor_asyncio import AsyncIOMotorClient
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import Optional
from contextlib import asynccontextmanager
import os
import asyncio
from datetime import datetime, timedelta

from utils.config import get_settings


class Database:
    client: Optional[AsyncIOMotorClient] = None
    database: Optional[AsyncIOMotorDatabase] = None

    async def connect(self):
        """Initialize MongoDB connection"""
        try:
            settings = get_settings()
            
            # detect if we should use TLS
            is_srv = settings.MONGODB_URL.startswith("mongodb+srv://")
            
            # Setup mongo options
            mongo_kwargs = {
                "serverSelectionTimeoutMS": 5000,
                "tls": is_srv
            }
            if is_srv:
                mongo_kwargs["tlsAllowInvalidCertificates"] = True

            self.client = AsyncIOMotorClient(settings.MONGODB_URL, **mongo_kwargs)
            
            # Parse database name from URL (handle query params like ?retryWrites=true)
            url_path = settings.MONGODB_URL.split('/')[-1]
            db_name = url_path.split('?')[0] or 'resume_platform'
            self.database = self.client[db_name]

            print(f"Connected to MongoDB: {db_name}")
            return True

        except Exception as e:
            print(f"Failed to connect to MongoDB: {e}")
            return False

    async def disconnect(self):
        """Close MongoDB connection"""
        if self.client:
            self.client.close()
            print(" Disconnected from MongoDB")

    async def get_db(self) -> AsyncIOMotorDatabase:
        """Get database instance, attempting to connect if not ready"""
        if self.database is None:
            # Fallback for code calling db.get_db() outside of FastAPI dependencies
            success = await self.connect()
            if not success:
                from fastapi import HTTPException
                raise HTTPException(
                    status_code=503, 
                    detail="Database connection failed. Ensure MONGODB_URL is valid."
                )
        return self.database

    async def create_indexes(self):
        """Create database indexes - non-fatal, each index individually tried."""
        try:
            database = await self.get_db()
        except Exception:
            return True  # DB not ready yet - skip indexes

        # Define indexes to create. Each is tried independently so Atlas
        # M0 free-tier limitations on index counts don't break startup.
        index_tasks = [
            ("users", "email", {"unique": True}),
            ("users", "firebase_uid", {"sparse": True}),
            ("resumes", "user_id", {}),
            ("resumes", "created_at", {}),
            ("resumes", "ats_score", {}),
            ("resumes", "company", {}),
            ("jobs", "company_id", {}),
            ("jobs", "status", {}),
            ("applications", "user_id", {}),
            ("ai_cache", "created_at", {"expireAfterSeconds": 86400}),  # TTL index 24h
        ]

        for collection_name, field, kwargs in index_tasks:
            try:
                col = database[collection_name]
                await col.create_index(field, background=True, **kwargs)
            except Exception:
                pass  # Non-fatal: Atlas M0 restricts index counts

        print(" Database indexes configured")
        return True

    async def cleanup_old_data(self, days: int = 30):
        """Clean up old data"""
        try:
            database = await self.get_db()
            cutoff_date = datetime.utcnow() - timedelta(days=days)
            result = await database.resumes.delete_many({
                "updated_at": {"$lt": cutoff_date},
                "is_active": False
            })
            print(f"Cleaned up {result.deleted_count} old inactive resumes")
            return True
        except Exception as e:
            print(f"Cleanup skipped: {e}")
            return False


# Global database instance
db = Database()


async def get_database():
    """Dependency for database access in routes"""
    if db.database is None:
        success = await db.connect()
        if not success:
            from fastapi import HTTPException
            raise HTTPException(
                status_code=503, 
                detail="Database connection failed. Please ensure MONGODB_URL is correctly set and the cluster is accessible."
            )
    return db.database


async def init_database():
    """Initialize database connection and indexes (in background)"""
    success = await db.connect()
    if success:
        # Create indexes in background so startup isn't blocked
        import asyncio
        asyncio.create_task(db.create_indexes())
    return success


async def close_database():
    """Close database connection"""
    await db.disconnect()
