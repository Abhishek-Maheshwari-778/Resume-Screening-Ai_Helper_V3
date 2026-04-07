from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from datetime import datetime
from bson import ObjectId
from pydantic import BaseModel, Field

from database.database import get_database
from models.user import UserResponse
from services.auth_service import get_current_user

router = APIRouter()

# ─── Models ────────────────────────────────────────────────────────────

class JobCreate(BaseModel):
    title: str
    department: str
    location: str
    employment_type: str = "Full-Time"  # Full-Time, Part-Time, Contract, Internship
    description: str
    requirements: List[str] = []
    status: str = "Open"
    is_remote: bool = False
    deadline: Optional[str] = None

class JobUpdate(BaseModel):
    title: Optional[str] = None
    department: Optional[str] = None
    location: Optional[str] = None
    employment_type: Optional[str] = None
    description: Optional[str] = None
    requirements: Optional[List[str]] = None
    status: Optional[str] = None
    is_remote: Optional[bool] = None
    deadline: Optional[str] = None

class JobResponse(BaseModel):
    id: str
    company_id: str
    created_by: str
    title: str
    department: str
    location: str
    employment_type: str
    description: str
    requirements: List[str]
    status: str
    is_remote: bool
    deadline: Optional[str] = None
    created_at: datetime
    updated_at: datetime

# ─── Helper ────────────────────────────────────────────────────────────

def format_job(doc) -> dict:
    doc["id"] = str(doc.pop("_id"))
    return doc

# ─── Routes ────────────────────────────────────────────────────────────

@router.post("", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
async def create_job(
    request: JobCreate,
    current_user: UserResponse = Depends(get_current_user),
    db=Depends(get_database)
):
    """Create a new job posting for the HR's company."""
    if current_user.role not in ("hr", "employer", "enterprise", "admin"):
        raise HTTPException(status_code=403, detail="HR access required to post jobs.")
    
    company_id = current_user.company or str(current_user.id)
    
    job_doc = request.dict()
    job_doc["company_id"] = company_id
    job_doc["created_by"] = str(current_user.id)
    job_doc["created_at"] = datetime.utcnow()
    job_doc["updated_at"] = datetime.utcnow()

    res = await db.jobs.insert_one(job_doc)
    created_job = await db.jobs.find_one({"_id": res.inserted_id})
    return format_job(created_job)


@router.get("")
async def list_jobs(
    page: int = 1,
    limit: int = 20,
    current_user: UserResponse = Depends(get_current_user),
    db=Depends(get_database)
):
    """List all jobs. Candidates see Open jobs, HR sees their company's jobs."""
    query = {}
    
    if current_user.role in ("candidate"):
        query["status"] = "Open"
    elif current_user.role != "admin" and current_user.company:
        query["company_id"] = current_user.company

    skip = (page - 1) * limit
    total = await db.jobs.count_documents(query)
    cursor = db.jobs.find(query).sort("created_at", -1).skip(skip).limit(limit)
    jobs = await cursor.to_list(length=limit)
    
    return {
        "items": [format_job(j) for j in jobs],
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": (total + limit - 1) // limit
    }


@router.get("/{job_id}", response_model=JobResponse)
async def get_job(
    job_id: str,
    current_user: UserResponse = Depends(get_current_user),
    db=Depends(get_database)
):
    """Get a specific job."""
    try:
        query = {"_id": ObjectId(job_id)}
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid job ID format.")
        
    job = await db.jobs.find_one(query)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found.")
        
    # Tenant isolation for HR
    if current_user.role not in ("candidate", "admin"):
        user_company = current_user.company or str(current_user.id)
        if job.get("company_id") != user_company:
            raise HTTPException(status_code=403, detail="Access denied to this job posting.")
            
    return format_job(job)


@router.put("/{job_id}", response_model=JobResponse)
async def update_job(
    job_id: str,
    request: JobUpdate,
    current_user: UserResponse = Depends(get_current_user),
    db=Depends(get_database)
):
    """Update a job posting."""
    if current_user.role not in ("hr", "employer", "enterprise", "admin"):
        raise HTTPException(status_code=403, detail="HR access required to edit jobs.")

    try:
        query = {"_id": ObjectId(job_id)}
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid job ID format.")

    # Apply tenant isolation
    if current_user.role != "admin":
        user_company = current_user.company or str(current_user.id)
        query["company_id"] = user_company

    job = await db.jobs.find_one(query)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found or access denied.")

    update_data = request.dict(exclude_unset=True)
    if not update_data:
        return format_job(job)

    update_data["updated_at"] = datetime.utcnow()
    await db.jobs.update_one(query, {"$set": update_data})
    
    updated_job = await db.jobs.find_one(query)
    return format_job(updated_job)


@router.delete("/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_job(
    job_id: str,
    current_user: UserResponse = Depends(get_current_user),
    db=Depends(get_database)
):
    """Delete a job posting."""
    if current_user.role not in ("hr", "employer", "enterprise", "admin"):
        raise HTTPException(status_code=403, detail="HR access required to delete jobs.")

    try:
        query = {"_id": ObjectId(job_id)}
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid job ID format.")

    if current_user.role != "admin":
        user_company = current_user.company or str(current_user.id)
        query["company_id"] = user_company

    result = await db.jobs.delete_one(query)
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Job not found or access denied.")
    
    return None


@router.post("/{job_id}/apply")
async def apply_to_job(
    job_id: str,
    resume_id: Optional[str] = None,
    current_user: UserResponse = Depends(get_current_user),
    db=Depends(get_database)
):
    """Candidate apply to a specific job posting."""
    if current_user.role != "candidate":
        raise HTTPException(status_code=403, detail="Only candidates can apply to jobs.")

    try:
        j_oid = ObjectId(job_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid job ID format.")

    job = await db.jobs.find_one({"_id": j_oid})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found.")

    # Check if already applied
    existing = await db.applications.find_one({
        "user_id": str(current_user.id),
        "job_id": job_id
    })
    if existing:
        raise HTTPException(status_code=400, detail="You have already applied to this job.")

    # Create application entry
    app_doc = {
        "user_id": str(current_user.id),
        "job_id": job_id,
        "company_id": job["company_id"],
        "company_name": job.get("company_name", "Unknown Company"), # Should ideally be in job doc
        "role_title": job["title"],
        "status": "applied",
        "applied_date": datetime.utcnow(),
        "resume_id": resume_id,
        "notes": "",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }

    res = await db.applications.insert_one(app_doc)
    return {"message": "Application submitted successfully", "application_id": str(res.inserted_id)}
