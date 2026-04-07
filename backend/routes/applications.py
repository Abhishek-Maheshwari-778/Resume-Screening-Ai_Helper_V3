from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from datetime import datetime
from bson import ObjectId
from pydantic import BaseModel

from database.database import get_database
from models.user import UserResponse
from services.auth_service import get_current_user

router = APIRouter()

# ─── Models ────────────────────────────────────────────────────────────

class ApplicationCreate(BaseModel):
    job_id: Optional[str] = None  # Internal job ID if applied through platform
    company_name: str
    role_title: str
    status: str = "applied"   # wishlist, applied, interview, offer, rejected
    applied_date: datetime = None
    notes: Optional[str] = ""
    resume_id: Optional[str] = None # Which resume was used
    
    class Config:
        arbitrary_types_allowed = True

    def __init__(self, **data):
        # Normalise status to lowercase for consistency
        if 'status' in data and data['status']:
            data['status'] = data['status'].lower()
        super().__init__(**data)
        if self.applied_date is None:
            self.applied_date = datetime.utcnow()

# Workaround for pydantic missing Field in the imports above
from pydantic import Field

class ApplicationUpdate(BaseModel):
    company_name: Optional[str] = None
    role_title: Optional[str] = None
    status: Optional[str] = None
    applied_date: Optional[datetime] = None
    notes: Optional[str] = None
    resume_id: Optional[str] = None

class ApplicationResponse(BaseModel):
    id: str
    user_id: str
    job_id: Optional[str]
    company_name: str
    role_title: str
    status: str
    applied_date: datetime
    notes: str
    resume_id: Optional[str]
    created_at: datetime
    updated_at: datetime

# ─── Helper ────────────────────────────────────────────────────────────

def format_app(doc) -> dict:
    doc["id"] = str(doc.pop("_id"))
    return doc

# ─── Routes ────────────────────────────────────────────────────────────

@router.post("", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
async def create_application(
    request: ApplicationCreate,
    current_user: UserResponse = Depends(get_current_user),
    db=Depends(get_database)
):
    """Create a new tracked application for a candidate."""
    app_doc = request.dict()
    app_doc["user_id"] = str(current_user.id)
    app_doc["created_at"] = datetime.utcnow()
    app_doc["updated_at"] = datetime.utcnow()

    res = await db.applications.insert_one(app_doc)
    created_app = await db.applications.find_one({"_id": res.inserted_id})
    return format_app(created_app)


@router.get("")
async def list_applications(
    page: int = 1,
    limit: int = 20,
    current_user: UserResponse = Depends(get_current_user),
    db=Depends(get_database)
):
    """List all tracked applications for the current candidate."""
    query = {"user_id": str(current_user.id)}
    
    skip = (page - 1) * limit
    total = await db.applications.count_documents(query)
    cursor = db.applications.find(query).sort("applied_date", -1).skip(skip).limit(limit)
    apps = await cursor.to_list(length=limit)
    
    return {
        "items": [format_app(a) for a in apps],
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": (total + limit - 1) // limit
    }


@router.put("/{app_id}", response_model=ApplicationResponse)
async def update_application(
    app_id: str,
    request: ApplicationUpdate,
    current_user: UserResponse = Depends(get_current_user),
    db=Depends(get_database)
):
    """Update a tracked application (e.g. change status to Interview)."""
    try:
        query = {"_id": ObjectId(app_id), "user_id": str(current_user.id)}
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid application ID format.")

    app_doc = await db.applications.find_one(query)
    if not app_doc:
        raise HTTPException(status_code=404, detail="Application not found.")

    update_data = request.dict(exclude_unset=True)
    if not update_data:
        return format_app(app_doc)

    update_data["updated_at"] = datetime.utcnow()
    await db.applications.update_one(query, {"$set": update_data})
    
    updated_app = await db.applications.find_one(query)
    return format_app(updated_app)


@router.delete("/{app_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_application(
    app_id: str,
    current_user: UserResponse = Depends(get_current_user),
    db=Depends(get_database)
):
    """Delete a tracked application."""
    try:
        query = {"_id": ObjectId(app_id), "user_id": str(current_user.id)}
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid application ID format.")

    result = await db.applications.delete_one(query)
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Application not found.")
    
    return None
