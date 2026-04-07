from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid
import os

from database.database import get_database
from models.user import UserResponse
from models.resume import ResumeResponse, ResumeCreate, ResumeUpdate
from services.auth_service import get_current_user
from services.export_service import ExportService
from fastapi.responses import FileResponse
from bson import ObjectId

from ai.parser_service import extract_text as parse_text, extract_sections
from ai.nlp_service import extract_skills, extract_email as extract_email_from_text, extract_name

try:
    from pypdf import PdfReader
except ImportError:
    PdfReader = None

try:
    import docx
except ImportError:
    docx = None

router = APIRouter()

# ─── Max file size (10 MB default from env) ─────────────────────────────────
MAX_FILE_SIZE = int(os.environ.get("MAX_FILE_SIZE", 10485760))


# ─── Helpers ────────────────────────────────────────────────────────────────

def _flatten_skills(skills) -> list:
    """Safely flatten a skills dict or list to a flat list of strings."""
    if isinstance(skills, dict):
        return [s for cat in skills.values() for s in cat]
    if isinstance(skills, list):
        return skills
    return []


# ─── Standard Resume CRUD ───────────────────────────────────────────────────

@router.post("", response_model=ResumeResponse, status_code=status.HTTP_201_CREATED)
async def create_resume(
    resume: ResumeCreate,
    current_user: UserResponse = Depends(get_current_user),
    db = Depends(get_database)
):
    """Create a new resume"""
    resume_data = resume.dict()
    resume_data["user_id"] = current_user.id
    resume_data["created_at"] = datetime.utcnow()
    resume_data["updated_at"] = datetime.utcnow()

    result = await db.resumes.insert_one(resume_data)
    created_resume = await db.resumes.find_one({"_id": result.inserted_id})
    return ResumeResponse(**created_resume)


@router.get("", response_model=List[ResumeResponse])
async def get_user_resumes(
    current_user: UserResponse = Depends(get_current_user),
    db = Depends(get_database)
):
    """Get all resumes for the current user"""
    resumes_cursor = db.resumes.find({"user_id": current_user.id})
    resumes = await resumes_cursor.to_list(length=100)
    result = []
    for r in resumes:
        r["id"] = str(r["_id"])
        result.append(r)
    return result


@router.get("/public/{resume_id}")
async def get_public_resume(
    resume_id: str,
    db = Depends(get_database)
):
    """View a public resume by ID without authentication"""
    try:
        query = {"_id": ObjectId(resume_id)}
    except Exception:
        query = {"id": resume_id}

    resume = await db.resumes.find_one(query)

    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
        
    if not resume.get("is_public", False):
        raise HTTPException(status_code=403, detail="This resume is completely private and not publicly shareable.")

    resume["id"] = str(resume["_id"])
    return resume


@router.get("/{resume_id}", response_model=ResumeResponse)
async def get_resume(
    resume_id: str,
    current_user: UserResponse = Depends(get_current_user),
    db = Depends(get_database)
):
    """Get a specific resume"""
    try:
        query = {"user_id": current_user.id}
        try:
            query["_id"] = ObjectId(resume_id)
        except Exception:
            query["_id"] = resume_id

        resume = await db.resumes.find_one(query)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid resume ID: {str(e)}")

    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    resume["id"] = str(resume["_id"])
    return resume


@router.put("/{resume_id}", response_model=ResumeResponse)
async def update_resume(
    resume_id: str,
    resume_update: ResumeUpdate,
    current_user: UserResponse = Depends(get_current_user),
    db = Depends(get_database)
):
    """Update a resume"""
    query = {"_id": resume_id, "user_id": current_user.id}
    try:
        query = {"_id": ObjectId(resume_id), "user_id": current_user.id}
    except Exception:
        pass

    resume = await db.resumes.find_one(query)
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    update_data = resume_update.dict(exclude_unset=True)
    update_data["updated_at"] = datetime.utcnow()

    await db.resumes.update_one(query, {"$set": update_data})
    updated_resume = await db.resumes.find_one(query)
    return ResumeResponse(**updated_resume)


@router.delete("/{resume_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_resume(
    resume_id: str,
    current_user: UserResponse = Depends(get_current_user),
    db = Depends(get_database)
):
    """Delete a resume"""
    query = {"_id": resume_id, "user_id": current_user.id}
    try:
        query = {"_id": ObjectId(resume_id), "user_id": current_user.id}
    except Exception:
        pass

    result = await db.resumes.delete_one(query)
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Resume not found")
    return None


@router.get("/{resume_id}/export")
async def export_resume(
    resume_id: str,
    format: str = "pdf",
    current_user: UserResponse = Depends(get_current_user),
    db = Depends(get_database)
):
    """Export resume to PDF"""
    query = {"_id": resume_id, "user_id": current_user.id}
    try:
        query = {"_id": ObjectId(resume_id), "user_id": current_user.id}
    except Exception:
        pass

    resume = await db.resumes.find_one(query)
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    if format == "pdf":
        export_service = ExportService()
        file_path = await export_service.generate_pdf(resume)
        return FileResponse(
            path=file_path,
            filename=f"{resume.get('title', 'resume')}.pdf",
            media_type='application/pdf'
        )
    else:
        raise HTTPException(status_code=400, detail="Only PDF format is currently supported")


# ─── Upload Endpoint ────────────────────────────────────────────────────────

@router.post("/upload")
async def upload_resume(
    file: UploadFile = File(...),
    current_user: UserResponse = Depends(get_current_user)
):
    """Upload and parse a resume file into structured sections"""
    if not file.filename.lower().endswith(('.pdf', '.docx', '.txt')):
        raise HTTPException(status_code=400, detail="Invalid file type. Only PDF, DOCX, and TXT are accepted.")

    # FIX: Enforce file size limit
    file_bytes = await file.read()
    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Max size is {MAX_FILE_SIZE // 1024 // 1024}MB."
        )

    content: str = ""
    try:
        content = parse_text(file_bytes, file.filename)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse file: {str(e)}")

    # Expanded section map — FIX-6: was missing many common section names
    sections: Dict[str, str] = {
        "summary": "",
        "experience": "",
        "education": "",
        "skills": "",
        "projects": "",
        "certifications": "",
        "achievements": "",
    }

    if not content:
        return {"filename": file.filename, "raw_text": "", "sections": sections, "text_truncated": False}

    lines = content.split('\n')
    current_section = "summary"

    # FIX-6: Expanded section keyword map with more coverage
    section_map = {
        "experience": [
            "experience", "work history", "employment history", "work experience",
            "professional experience", "professional background", "career history",
            "work background", "employment"
        ],
        "education": [
            "education", "academic background", "academic qualifications",
            "educational background", "university", "schooling", "qualifications"
        ],
        "skills": [
            "skills", "technical skills", "expertise", "competencies",
            "core competencies", "key skills", "skill set", "technologies"
        ],
        "projects": [
            "projects", "personal projects", "academic projects", "key projects",
            "notable projects", "portfolio", "side projects"
        ],
        "certifications": [
            "certifications", "certificates", "licenses", "credentials",
            "professional certifications", "training"
        ],
        "achievements": [
            "achievements", "awards", "honors", "accomplishments",
            "recognition", "publications", "languages", "volunteer",
            "volunteer work", "extracurricular", "interests", "references"
        ],
        "summary": [
            "summary", "objective", "profile", "about me",
            "career objective", "professional summary", "overview",
            "personal statement"
        ]
    }

    section_buffers: Dict[str, List[str]] = {k: [] for k in sections.keys()}

    for line in lines:
        clean_line: str = line.strip().lower()
        if not clean_line:
            continue

        found_new: bool = False
        for sec, keywords in section_map.items():
            # FIX-6: Use 'in' containment check instead of only startswith/exact match
            if any(kw in clean_line or clean_line.startswith(kw) for kw in keywords):
                current_section = sec
                found_new = True
                break

        if not found_new and current_section in section_buffers:
            section_buffers[current_section].append(line)

    for sec in sections.keys():
        sections[sec] = "\n".join(section_buffers[sec]).strip()

    # FIX-5: Increased raw_text limit from 5000 to 15000 chars
    text_truncated = len(content) > 15000
    return {
        "filename": file.filename,
        "raw_text": content[:15000],
        "sections": sections,
        "text_truncated": text_truncated  # UI can warn user if true
    }


# ─── Bulk Upload ────────────────────────────────────────────────────────────

@router.post("/bulk-upload")
async def bulk_upload_resumes(
    files: List[UploadFile] = File(...),
    current_user: UserResponse = Depends(get_current_user),
    db=Depends(get_database)
):
    """Bulk upload and parse multiple resumes for HR"""
    if current_user.role not in ("hr", "employer", "enterprise", "admin"):
        raise HTTPException(status_code=403, detail="HR access required")

    async def process_file(file: UploadFile):
        try:
            file_bytes = await file.read()

            # Enforce file size limit per file
            if len(file_bytes) > MAX_FILE_SIZE:
                return {"name": file.filename, "status": "Failed", "error": "File too large"}

            content = parse_text(file_bytes, file.filename)
            sections = extract_sections(content)

            # High-fidelity entity extraction
            skills_dict = extract_skills(content)
            skills_flat = _flatten_skills(skills_dict)
            real_email = extract_email_from_text(content)
            name = extract_name(content) or file.filename.split('.')[0].replace('_', ' ').replace('-', ' ').title()

            resume_doc = {
                "user_id": str(current_user.id),
                "company": current_user.company or "default",
                "candidate_name": name,
                "email": real_email or "",
                "raw_text": content[:15000],
                "extracted_skills": skills_dict,
                "sections": sections,
                "status": "Analyzed",
                "created_at": datetime.utcnow()
            }
            res = await db.resumes.insert_one(resume_doc)

            return {
                "id": str(res.inserted_id),
                "name": resume_doc["candidate_name"],
                "email": resume_doc["email"],
                "score": 0,
                "status": "Analyzed",
                "tags": skills_flat[:4]
            }
        except Exception as e:
            return {"name": file.filename, "status": "Failed", "error": str(e)}

    import asyncio
    results = await asyncio.gather(*[process_file(f) for f in files])
    return results
