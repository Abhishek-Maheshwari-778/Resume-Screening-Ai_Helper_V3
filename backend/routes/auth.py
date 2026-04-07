from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel
from typing import Optional

from database.database import get_database
from utils.config import get_settings
from models.user import UserResponse
from services.auth_service import AuthService, get_current_user

router = APIRouter(tags=["Authentication"])
settings = get_settings()


# ─── Request / Response Models ──────────────────────────────────────────────

class GoogleAuthRequest(BaseModel):
    id_token: str
    role: Optional[str] = "candidate"   # "candidate" | "employer" | "hr" | "enterprise"
    company: Optional[str] = None

class EmailRegisterRequest(BaseModel):
    email: str
    password: str
    name: str
    role: str = "candidate"
    company: Optional[str] = None

class EmailLoginRequest(BaseModel):
    email: str
    password: str

class OnboardingRequest(BaseModel):
    role: str
    company: Optional[str] = None

class RoleUpdateRequest(BaseModel):
    role: str


# ─── Routes ─────────────────────────────────────────────────────────────────

@router.post("/google", response_model=dict)
async def google_auth(body: GoogleAuthRequest):
    """
    Firebase Google Auth flow.
    Accepts Firebase id_token, creates or finds user in MongoDB,
    returns JWT + user info with chosen role.
    """
    try:
        auth_service = AuthService()
        user, jwt_token = await auth_service.verify_google_token_and_login(
            body.id_token, role=body.role, company=body.company
        )
        if not user:
            raise HTTPException(status_code=401, detail="Invalid Google token")
        return {
            "access_token": jwt_token,
            "token_type": "bearer",
            "user": user,
        }
    except HTTPException as e:
        raise e
    except Exception as e:
        from fastapi.responses import JSONResponse
        print(f"FATAL ERROR in google-auth: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"error": "Authentication Failed", "detail": str(e)}
        )


@router.post("/register", response_model=dict)
async def register(body: EmailRegisterRequest):
    """Email/password registration with role selection."""
    auth_service = AuthService()
    user, jwt_token = await auth_service.create_user_with_email(
        email=body.email,
        password=body.password,
        name=body.name,
        role=body.role,
        company=body.company,
    )
    if not user:
        raise HTTPException(status_code=400, detail="Email already registered or invalid data")
    return {"access_token": jwt_token, "token_type": "bearer", "user": user}


@router.post("/login", response_model=dict)
async def login(body: EmailLoginRequest):
    """Email/password login."""
    auth_service = AuthService()
    user, jwt_token = await auth_service.authenticate_email_user(body.email, body.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return {"access_token": jwt_token, "token_type": "bearer", "user": user}


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: UserResponse = Depends(get_current_user)):
    """Get current authenticated user's profile."""
    return current_user


@router.put("/onboarding")
async def complete_onboarding(
    body: OnboardingRequest,
    current_user: UserResponse = Depends(get_current_user),
    db=Depends(get_database)   # FIX-2: was using invalid `db.get_db()` pattern
):
    """Update user role after onboarding step."""
    await db.users.update_one(
        {"email": current_user.email},
        {"$set": {"role": body.role, "company": body.company, "onboarding_complete": True}}
    )
    return {"message": "Onboarding complete", "role": body.role}


@router.post("/refresh", response_model=dict)
async def refresh_token(current_user: UserResponse = Depends(get_current_user)):
    """Refresh JWT token."""
    auth_service = AuthService()
    new_token = auth_service.create_access_token(current_user.id)
    return {"access_token": new_token, "token_type": "bearer"}


@router.post("/logout")
async def logout():
    """Logout (client-side token removal)."""
    return {"message": "Logged out successfully"}
