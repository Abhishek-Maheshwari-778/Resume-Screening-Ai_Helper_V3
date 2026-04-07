from fastapi import APIRouter, Depends, HTTPException, status
from typing import Dict, Any, List
from datetime import datetime
from bson import ObjectId

from database.database import get_database
from models.user import UserResponse, UserUpdate, UserStats
from services.auth_service import get_current_user

router = APIRouter(tags=["Users"])

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: UserResponse = Depends(get_current_user)):
    """Get current user profile."""
    return current_user

@router.put("/profile", response_model=UserResponse)
async def update_profile(
    body: UserUpdate,
    current_user: UserResponse = Depends(get_current_user),
    db = Depends(get_database)
):
    """Update user profile details."""
    update_data = body.dict(exclude_unset=True)
    if not update_data:
        return current_user

    update_data["updated_at"] = datetime.utcnow()
    
    # Perform update in DB
    await db.users.update_one(
        {"_id": ObjectId(current_user.id)},
        {"$set": update_data}
    )
    
    # Fetch updated user
    updated_user_doc = await db.users.find_one({"_id": ObjectId(current_user.id)})
    
    # Use AuthService's helper if needed or manual map
    from services.auth_service import AuthService
    auth_service = AuthService()
    user_resp, _ = await auth_service._get_user_response(updated_user_doc, "")
    
    # Merge additional fields into response from doc
    user_resp.update({
        "phone": updated_user_doc.get("phone"),
        "location": updated_user_doc.get("location"),
        "bio": updated_user_doc.get("bio"),
        "linkedin": updated_user_doc.get("linkedin"),
        "github": updated_user_doc.get("github"),
        "website": updated_user_doc.get("website"),
    })
    
    return UserResponse(**user_resp)

@router.get("/stats", response_model=UserStats)
async def get_user_stats(
    current_user: UserResponse = Depends(get_current_user),
    db = Depends(get_database)
):
    """Get real-time dashboard stats for the user."""
    user_id_str = str(current_user.id)
    
    # 1. Count Resumes
    resumes_count = await db.resumes.count_documents({"user_id": user_id_str})
    
    # 2. Count AI Analyses (can be from a separate analytics collection if it exists, or resumes)
    # For now, let's assume each resume with an ats_score counts as an analysis.
    analyses_count = await db.resumes.count_documents({
        "user_id": user_id_str,
        "ats_score": {"$ne": None}
    })
    
    # 3. Calculate Avg Score
    avg_score = 0.0
    cursor = db.resumes.find({"user_id": user_id_str, "ats_score": {"$ne": None}})
    resumes_with_scores = await cursor.to_list(length=100)
    if resumes_with_scores:
        total_score = sum(r.get("ats_score", 0) for r in resumes_with_scores)
        avg_score = total_score / len(resumes_with_scores)
    
    # 4. Count Applications tracked
    apps_count = await db.applications.count_documents({"user_id": user_id_str})
    
    return UserStats(
        resumes_created=resumes_count,
        analyses_completed=analyses_count,
        templates_used=apps_count, # Misusing this field as 'Jobs Tracked' as per frontend
        average_score=round(avg_score, 1),
    )
