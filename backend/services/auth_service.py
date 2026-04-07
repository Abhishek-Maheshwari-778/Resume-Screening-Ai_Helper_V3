import httpx
import json
from jose import jwt, JWTError
from datetime import datetime, timedelta
from typing import Optional, Tuple
from passlib.context import CryptContext

from database.database import db as _db
from utils.config import get_settings
from models.user import UserInDB, UserCreate, UserResponse

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

settings = get_settings()
security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


class AuthService:
    def create_access_token(self, user_id: str) -> str:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        return jwt.encode(
            {"sub": str(user_id), "exp": expire},
            settings.SECRET_KEY,
            algorithm=settings.JWT_ALGORITHM,
        )

    def verify_token(self, token: str) -> Optional[str]:
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
            return payload.get("sub")
        except JWTError:
            return None

    async def _get_user_response(self, doc: dict, token: str) -> Tuple[dict, str]:
        """Convert a MongoDB user doc to a clean dict and return with token."""
        return {
            "id": str(doc["_id"]),
            "name": doc.get("name", ""),
            "email": doc.get("email", ""),
            "role": doc.get("role", "candidate"),
            "auth_provider": doc.get("auth_provider", "email"),
            "company": doc.get("company"),
            "photo_url": doc.get("photo_url"),
            "onboarding_complete": doc.get("onboarding_complete", False),
            "is_active": doc.get("is_active", True),
            "created_at": str(doc.get("created_at", "")),
        }, token

    async def verify_google_token_and_login(self, id_token: str, role: str = "candidate", company: str = None):
        """Verify Firebase ID token using Identity Toolkit API."""
        try:
            # We use the Identity Toolkit lookup endpoint which works with Firebase ID tokens
            # using the Web API Key. This doesn't require a service account JSON.
            url = f"https://identitytoolkit.googleapis.com/v1/accounts:lookup?key={settings.FIREBASE_WEB_API_KEY}"
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.post(url, json={"idToken": id_token})
                if resp.status_code != 200:
                    print(f"Firebase verification failed: {resp.text}")
                    return None, None
                
                res_data = resp.json()
                if not res_data.get("users"):
                    return None, None
                
                user_data = res_data["users"][0]
                firebase_uid = user_data.get("localId")
                email = user_data.get("email")
                name = user_data.get("displayName", email.split("@")[0] if email else "User")
                photo_url = user_data.get("photoUrl", "")

            database = await _db.get_db()
            existing = await database.users.find_one({"email": email})

            if existing:
                # Update last login
                await database.users.update_one(
                    {"email": email},
                    {"$set": {"last_login": datetime.utcnow(), "photo_url": photo_url}}
                )
                token = self.create_access_token(str(existing["_id"]))
                return await self._get_user_response(existing, token)

            # New user
            new_user = {
                "firebase_uid": firebase_uid,
                "email": email,
                "name": name,
                "auth_provider": "google",
                "role": role,
                "company": company,
                "photo_url": photo_url,
                "is_active": True,
                "onboarding_complete": role != "candidate",
                "created_at": datetime.utcnow(),
                "last_login": datetime.utcnow(),
            }
            result = await database.users.insert_one(new_user)
            new_user["_id"] = result.inserted_id
            token = self.create_access_token(str(result.inserted_id))
            
            # Send Welcome Email asynchronously
            from services.email_service import EmailService
            import asyncio
            asyncio.create_task(EmailService().send_welcome_email(email, name))
            
            return await self._get_user_response(new_user, token)

        except Exception as e:
            print(f"Google auth error: {e}")
            return None, None

    async def create_user_with_email(self, email: str, password: str, name: str,
                                      role: str = "candidate", company: str = None):
        """Email/password registration."""
        try:
            database = await _db.get_db()
            existing = await database.users.find_one({"email": email})
            if existing:
                return None, None

            new_user = {
                "email": email,
                "password_hash": hash_password(password),
                "name": name,
                "auth_provider": "email",
                "role": role,
                "company": company,
                "is_active": True,
                "onboarding_complete": role != "candidate",
                "created_at": datetime.utcnow(),
                "last_login": datetime.utcnow(),
            }
            result = await database.users.insert_one(new_user)
            new_user["_id"] = result.inserted_id
            token = self.create_access_token(str(result.inserted_id))
            
            # Send Welcome Email asynchronously
            from services.email_service import EmailService
            import asyncio
            asyncio.create_task(EmailService().send_welcome_email(email, name))
            
            return await self._get_user_response(new_user, token)
        except Exception as e:
            print(f"Register error: {e}")
            return None, None

    async def authenticate_email_user(self, email: str, password: str):
        """Email/password login with database-backed authentication."""
        try:
            database = await _db.get_db()
            user = await database.users.find_one({"email": email})
            if user:
                pw_hash = user.get("password_hash", "")
                if pw_hash and verify_password(password, pw_hash):
                    # Update last login timestamp
                    from datetime import datetime
                    await database.users.update_one({"email": email}, {"$set": {"last_login": datetime.utcnow()}})
                    token = self.create_access_token(str(user["_id"]))
                    return await self._get_user_response(user, token)
        except Exception as e:
            print(f"Login DB error: {e}")
            return None, None

        return None, None

    async def get_user_by_id(self, user_id: str) -> Optional[UserResponse]:
        try:
            from bson import ObjectId
            database = await _db.get_db()
            user = await database.users.find_one({"_id": ObjectId(user_id)})
            if not user:
                return None
            return UserResponse(
                id=str(user["_id"]),
                firebase_uid=user.get("firebase_uid", ""),
                email=user["email"],
                name=user.get("name", ""),
                auth_provider=user.get("auth_provider", "email"),
                role=user.get("role", "candidate"),
                company=user.get("company"),
                photo_url=user.get("photo_url"),
                created_at=user.get("created_at", datetime.utcnow()),
                updated_at=user.get("last_login", datetime.utcnow()),
                is_active=user.get("is_active", True),
            )
        except Exception as e:
            print(f"get_user_by_id error: {e}")
            return None


#  FastAPI dependency 

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> UserResponse:
    auth_service = AuthService()
    user_id = auth_service.verify_token(credentials.credentials)
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")
    user = await auth_service.get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user


async def get_current_user_optional(
    auth: Optional[HTTPAuthorizationCredentials] = Depends(security),
) -> Optional[UserResponse]:
    if not auth:
        return None
    try:
        auth_service = AuthService()
        user_id = auth_service.verify_token(auth.credentials)
        if not user_id: return None
        return await auth_service.get_user_by_id(user_id)
    except:
        return None
