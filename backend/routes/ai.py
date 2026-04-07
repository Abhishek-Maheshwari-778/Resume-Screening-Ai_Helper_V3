from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form, status, Request
from fastapi.responses import FileResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import List, Optional, Dict, Any

from services.auth_service import get_current_user, get_current_user_optional
from models.user import UserResponse
from ai.nlp_service import (
    extract_details, rank_candidates, compare_candidates, extract_skills, SKILLS_CATALOG
)

def _flatten_skills(skills) -> list:
    """Safely flatten a skills dict or list to a flat list."""
    if isinstance(skills, dict):
        return [s for cat in skills.values() for s in cat]
    if isinstance(skills, list):
        return list(skills)
    return []
from ai.parser_service import extract_text
from ai.groq_service import GroqService
from database.database import get_database
from utils.limiter import limiter
from utils.config import get_settings
settings = get_settings()
MAX_FILE_SIZE = settings.MAX_FILE_SIZE or 10485760  # 10MB default

router = APIRouter()


# ---- Request models ------------------------------------------------------------

class ResumeTextRequest(BaseModel):
    resume_text: str
    job_description: Optional[str] = None
    target_role: Optional[str] = None


class BulletRewriteRequest(BaseModel):
    bullet_point: str
    target_role: Optional[str] = None


class BuildSectionRequest(BaseModel):
    section_type: str
    context: Optional[str] = ""
    target_role: Optional[str] = ""
    # legacy fields
    job_title: Optional[str] = None
    user_info: Optional[str] = None


class CompareRequest(BaseModel):
    candidate_a: Dict[str, Any]
    candidate_b: Dict[str, Any]


class ScreeningResult(BaseModel):
    name: str
    email: str
    phone: str
    score: float
    matched_skills: List[str]
    missing_skills: List[str]
    summary: str
    experience: str
    titles: List[str]
    education: List[str]
    skills: Dict[str, List[str]]
    ai_summary: Optional[str] = None


# ─── Routes ────────────────────────────────────────────────────────────────────

import hashlib
from datetime import datetime
import asyncio

@router.post("/analyze")
@limiter.limit("5/minute")
async def analyze_resume(
    request: Request,
    analyze_req: ResumeTextRequest,
    current_user: UserResponse = Depends(get_current_user),
    db=Depends(get_database)
):
    """Full ATS analysis using DeepSeek AI. Caches responses using SHA-256 hash."""
    # Generate Cache Key
    content_hash = hashlib.sha256(
        f"analyze:{analyze_req.resume_text}:{analyze_req.job_description or ''}".encode()
    ).hexdigest()
    
    # Check Cache
    cached = await db.ai_cache.find_one({"_id": content_hash})
    if cached:
        return cached["result"]

    # Miss - Run AI (Groq is now primary)
    groq = GroqService()
    result = await groq.analyze_resume_ats(analyze_req.resume_text, analyze_req.job_description)
    
    # Run local NLP
    local = extract_details(analyze_req.resume_text)
    result["extracted"] = {
        "name": local["name"],
        "email": local["email"],
        "phone": local["phone"],
        "experience": local["experience"],
        "education": local["education"],
        "titles": local["titles"],
        "skills": local["skills"],
    }
    
    # Store in Cache
    await db.ai_cache.update_one(
        {"_id": content_hash},
        {"$set": {"result": result, "created_at": datetime.utcnow()}},
        upsert=True
    )
    
    return result


@router.post("/recommendations")
async def get_recommendations(
    request: ResumeTextRequest,
    current_user: UserResponse = Depends(get_current_user)
):
    """AI-powered improvement suggestions using Groq."""
    groq = GroqService()
    suggestions = await groq.get_resume_suggestions(request.resume_text, request.target_role)
    return {"suggestions": suggestions, "role": request.target_role}


@router.post("/rewrite")
async def rewrite_bullet(
    request: BulletRewriteRequest,
    current_user: UserResponse = Depends(get_current_user)
):
    """Rewrite a resume bullet point or section using Groq AI."""
    groq = GroqService()
    improved = await groq.rewrite_bullet_point(request.bullet_point)
    return {"original": request.bullet_point, "rewritten": improved}


@router.post("/rewrite-bullet")
async def rewrite_bullet_legacy(
    request: BulletRewriteRequest,
    current_user: UserResponse = Depends(get_current_user)
):
    """Legacy endpoint: rewrite bullet point."""
    groq = GroqService()
    improved = await groq.rewrite_bullet_point(request.bullet_point)
    return {"original": request.bullet_point, "improved": improved}


@router.post("/build-section")
async def build_section(
    request: BuildSectionRequest,
    current_user: UserResponse = Depends(get_current_user)
):
    """Generate a resume section using AI (for Resume Builder)."""
    groq = GroqService()
    role = request.target_role or request.job_title or "Professional"
    info = request.context or request.user_info or ""
    content = await groq.build_resume_section(request.section_type, role, info)
    return {"section_type": request.section_type, "content": content}


@router.post("/optimize-keywords")
async def optimize_keywords(
    request: ResumeTextRequest,
    current_user: UserResponse = Depends(get_current_user)
):
    """Keyword optimization for specific JD."""
    if not request.job_description:
        raise HTTPException(status_code=400, detail="Job description is required for keyword optimization.")
    groq = GroqService()
    result = await groq.optimize_resume_keywords(request.resume_text, request.job_description)
    return result


@router.post("/screen")
@limiter.limit("3/minute")
async def screen_resumes(
    request: Request,
    job_description: str = Form(...),
    resumes: List[UploadFile] = File(...),
    current_user: UserResponse = Depends(get_current_user)
):
    """
    HR Feature: Bulk resume screening.
    Upload multiple resumes and a JD to get ranked candidates.
    Uses NLP (spaCy NER) + TF-IDF + Keyword matching.
    Always returns results — failed files are listed separately.
    """
    if current_user.role not in ("hr", "employer", "enterprise", "admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only HR, Employer, or Admin users can use batch screening."
        )

    # Parallel processing of files for extraction
    async def process_single_resume(file: UploadFile):
        try:
            file_bytes = await file.read()
            if len(file_bytes) > MAX_FILE_SIZE:
                return None, f"{file.filename} (Too large > 10MB)"
            
            # Efficient text extraction with multi-library fallback (PyMuPDF -> pypdf -> etc)
            text = extract_text(file_bytes, file.filename)
            if not text or len(text.strip()) < 30:
                return None, f"{file.filename} (No selectable text content found)"
            
            # 1. Try high-speed local NLP extraction (spaCy/Regex)
            details = extract_details(text)
            
            # 2. INTEL-FALLBACK: If local extraction is poor (e.g. name Unknown), use AI
            if details.get('name') == 'Unknown' or not details.get('email'):
                print(f"🧠 AI Extraction Fallback: {file.filename}")
                groq = GroqService()
                ai_details = await groq.extract_resume_details_ai(text)
                if ai_details and ai_details.get('name'):
                    # Merge - Prefer AI for entities, but keep local summary if needed
                    # Note: ai_details only has basic keys, extract_details has more
                    details.update(ai_details)
                    # Re-generate summary with new AI data
                    details['summary'] = generate_summary(details)

            details['text'] = text
            details['filename'] = file.filename
            return details, None
        except Exception as e:
            return None, f"{file.filename} (System Error: {str(e)})"

    # Parallel text extraction
    from ai.parser_service import extract_sections
    processed = []
    failed_files = []
    extraction_results = await asyncio.gather(*[process_single_resume(f) for f in resumes])
    
    for details, error in extraction_results:
        if details:
            # Inject structured sections for smarter ranking
            details['sections'] = extract_sections(details['text'])
            processed.append(details)
        if error:
            failed_files.append(error)

    if not processed:
        error_msg = f"Failed to extract intelligence from {len(resumes)} file(s)."
        if failed_files:
            error_msg += f" Issues: {', '.join(failed_files[:3])}..."
        raise HTTPException(status_code=400, detail=error_msg)

    # Vectorized Ranking (TF-IDF + NLP)
    ranked = rank_candidates(processed, job_description)

    # Parallel AI Summary Generation for Top Candidates
    groq = GroqService()
    results = []
    
    # Batch AI summaries (top 5 only for efficiency/cost)
    top_candidates = ranked[:5]
    other_candidates = ranked[5:]
    
    ai_summary_tasks = [groq.generate_candidate_summary(c) for c in top_candidates]
    ai_summaries = await asyncio.gather(*ai_summary_tasks, return_exceptions=True)

    for i, candidate in enumerate(top_candidates):
        summary = ai_summaries[i]
        if isinstance(summary, Exception):
            summary = candidate.get('summary', 'AI synthesis failed.')
            
        results.append({
            "name": candidate['name'],
            "email": candidate['email'],
            "phone": candidate['phone'],
            "score": candidate['score'],
            "ats_score": candidate['score'],
            "matched_skills": candidate['matched_skills'],
            "missing_skills": candidate['missing_skills'],
            "summary": summary,
            "experience": candidate['experience'],
            "titles": candidate['titles'],
            "education": candidate['education'],
            "filename": candidate.get('filename', ''),
            "breakdown": candidate.get('breakdown', {}),
        })

    # Append non-AI summarized candidates
    for candidate in other_candidates:
        results.append({
            "name": candidate['name'],
            "email": candidate['email'],
            "phone": candidate['phone'],
            "score": candidate['score'],
            "ats_score": candidate['score'],
            "matched_skills": candidate['matched_skills'],
            "missing_skills": candidate['missing_skills'],
            "summary": candidate.get('summary', ''),
            "experience": candidate['experience'],
            "titles": candidate['titles'],
            "education": candidate['education'],
            "filename": candidate.get('filename', ''),
            "breakdown": candidate.get('breakdown', {}),
        })

    response = {"results": results}
    if failed_files:
        response["warnings"] = [f"Extraction failed for: {', '.join(failed_files)}"]
    return response



@router.post("/extract-skills")
async def extract_skills_bulk(
    resumes: List[UploadFile] = File(...),
    current_user: UserResponse = Depends(get_current_user)
):
    """HR Feature: Extract detailed skill matrix from multiple resumes."""
    if current_user.role not in ("hr", "employer", "enterprise", "admin"):
        raise HTTPException(status_code=403, detail="HR/Employer access required.")

    results = []
    for f in resumes:
        raw = await f.read()
        text = extract_text(raw, f.filename)
        if not text.strip():
            continue
        details = extract_details(text)
        skills = details.get('skills', {})
        results.append({
            "name": details.get('name', 'Unknown'),
            "email": details.get('email', ''),
            "experience": details.get('experience', 'N/A'),
            "education": details.get('education', []),
            "technical": skills.get('Technical Skills', []),
            "soft": skills.get('Soft Skills & Business', []),
            "domain": [],
            "languages": [s for s in skills.get('Technical Skills', []) if any(l in s.lower() for l in ['python','java','c++','javascript','typescript','go','ruby','php','r ','scala'])],
            "tools": skills.get('Tools & Platforms', []),
        })

    return results


@router.post("/compare")
async def compare_two_candidates(
    request: CompareRequest,
    current_user: UserResponse = Depends(get_current_user)
):
    """Compare two candidates side by side."""
    result = compare_candidates(request.candidate_a, request.candidate_b)
    return result


@router.post("/full-improve")
async def full_improve(
    request: ResumeTextRequest,
    current_user: UserResponse = Depends(get_current_user)
):
    """Rewrite entire resume with AI optimizations using Groq"""
    if not request.resume_text:
        raise HTTPException(status_code=400, detail="Resume text required")
    
    prompt = f"""
    You are an expert resume optimizer. Rewrite the following resume to be more impactful, using strong action verbs and professional language.
    Target Role: {request.target_role or 'Same as original'}
    Job Description context: {request.job_description or 'General improvement'}
    
    ORIGINAL RESUME:
    {request.resume_text}
    
    RULES:
    1. Keep the same structure (Summary, Experience, etc).
    2. Maintain all facts and technical skills.
    3. Use active voice and quantify achievements (e.g. 'Increased efficiency by 20%').
    4. Format the output clearly.
    
    RETURN ONLY THE REWRITTEN TEXT.
    """
    
    groq = GroqService()
    improved = await groq.generate_response(prompt)
    return {"improved_text": improved}


@router.post("/chat")
async def ai_chat(
    data: Dict[str, Any],
    current_user: Optional[UserResponse] = Depends(get_current_user_optional)
):
    """AI Assistant Chatbot"""
    query = data.get("query", "")
    history = data.get("history", [])
    
    if not query:
        raise HTTPException(status_code=400, detail="Query is required")

    from ai.groq_service import GroqService
    groq_service = GroqService()
    
    user_context = f"The user is a {current_user.role if current_user else 'guest'}."
    if current_user:
        user_context += f" Their name is {current_user.name}."
    
    system_prompt = f"""
    You are a professional AI Career Assistant for 'Resume AI Platform'. 
    {user_context}
    Help the user with resume building, ATS optimization, and HR screening tips.
    Keep responses concise, professional, and helpful. 
    If the user asks about technical features, mention our ATS Checker (DeepSeek) and Bulk Screening tools.
    """
    
    # FIX: Normalize history keys — support both {role/text} and {role/content} formats
    hist_lines = []
    for h in history[-5:]:
        role = h.get('role', 'user')
        text = h.get('text') or h.get('content') or h.get('message', '')
        if text:
            hist_lines.append(f"{role}: {text}")
    hist_str = "\n".join(hist_lines)

    prompt = f"{system_prompt}\n\nRecent History:\n{hist_str}\n\nUser Question: {query}\n\nAssistant:"

    response = await groq_service.generate_suggestions(prompt)

    return {"response": response}


@router.post("/extract-text")
async def extract_file_text_endpoint(
    file: UploadFile = File(...)
):
    """Utility to extract text from a file for various purposes (JD, Resume, etc)"""
    if not file.filename.endswith(('.pdf', '.docx', '.txt')):
        raise HTTPException(status_code=400, detail="Invalid file type")
    
    file_bytes = await file.read()
    from ai.parser_service import extract_text as parse_text
    text = parse_text(file_bytes, file.filename)
    if not text:
        raise HTTPException(status_code=400, detail="Could not extract text from the file")
    
    return {"text": text, "filename": file.filename}


@router.post("/analyze-public")
@limiter.limit("3/minute")
async def analyze_public(
    request: Request,
    file: UploadFile = File(...),
    job_description: Optional[str] = Form(None),
    target_role: Optional[str] = Form(None),
    db=Depends(get_database)
):
    """
    Public ATS Analysis (No Auth). 
    AI (DeepSeek) first, falls back to local NLP+TF-IDF if AI fails.
    Results are cached by file hash to save API credits.
    """
    fname = file.filename or "unknown"
    supported = ('.pdf', '.docx', '.doc', '.txt')
    if not any(fname.lower().endswith(ext) for ext in supported):
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{fname}'. Please upload a PDF, DOCX, or TXT file."
        )

    try:
        file_bytes = await file.read()
        if len(file_bytes) > MAX_FILE_SIZE:
            raise HTTPException(status_code=413, detail=f"File too large. Max size is {MAX_FILE_SIZE // 1024 // 1024}MB.")
        if len(file_bytes) == 0:
            raise HTTPException(status_code=400, detail="The uploaded file appears to be empty.")

        # ── Cache Check ───────────────────────────────────────────────────────
        import hashlib
        hasher = hashlib.sha256()
        hasher.update(b"public_v3:")
        hasher.update(file_bytes)
        if job_description:
            hasher.update(job_description.encode())
        content_hash = hasher.hexdigest()

        cached = await db.ai_cache.find_one({"_id": content_hash})
        if cached and cached.get("result"):
            print(f"📦 Cache Hit: {content_hash[:16]}")
            return cached["result"]

        # ── Text Extraction ───────────────────────────────────────────────────
        from ai.parser_service import extract_text as parse_text, extract_sections
        text = parse_text(file_bytes, fname)

        if not text or len(text.strip()) < 30:
            raise HTTPException(
                status_code=422,
                detail=(
                    f"Could not extract text from '{fname}'. "
                    "Please ensure your PDF has selectable text (not a scanned image). "
                    "Try uploading a DOCX or TXT version instead."
                )
            )

        print(f"🧠 Analyzing: {fname} ({len(text)} chars)")
        sections = extract_sections(text)

        # ── Step 1: Try Groq (primary AI — DeepSeek expired) ─────────────────
        analysis = None
        ai_used = False
        try:
            groq_svc = GroqService()
            raw = await groq_svc.analyze_resume_ats(text, job_description, sections=sections)
            if raw and isinstance(raw.get("score"), (int, float)):
                analysis = raw
                ai_used = True
                print(f"✅ Groq AI analysis done. Score: {analysis['score']}")
        except Exception as ai_err:
            print(f"⚠️ Groq failed, trying DeepSeek: {ai_err}")
            # ── Step 1b: DeepSeek fallback (if key is valid) ─────────────────
            try:
                from ai.deepseek_service import DeepSeekService
                ds = DeepSeekService()
                raw = await ds.analyze_resume_ats(text, job_description)
                if raw and isinstance(raw.get("score"), (int, float)) and raw.get("score") != 70.0:
                    analysis = raw
                    ai_used = True
                    print(f"✅ DeepSeek fallback done. Score: {analysis['score']}")
            except Exception as ds_err:
                print(f"⚠️ DeepSeek also failed (local NLP fallback): {ds_err}")



        # ── Step 2: Local NLP Fallback ────────────────────────────────────────
        if not analysis:
            print("🔧 Running local NLP fallback...")
            from ai.nlp_service import extract_details, calculate_weighted_score
            details = extract_details(text)
            skills_by_cat = details.get('skills', {})
            tech_skills = skills_by_cat.get('Technical Skills', [])
            soft_skills = skills_by_cat.get('Soft Skills & Business', [])

            if job_description:
                score, matched, _ = calculate_weighted_score(text, job_description, details)
            else:
                skill_count = sum(len(v) for v in skills_by_cat.values())
                completeness = sum([
                    1 if details.get('email') else 0,
                    1 if details.get('experience', 'Not Specified') != 'Not Specified' else 0,
                    1 if details.get('education') else 0,
                    1 if details.get('titles') else 0,
                    min(skill_count / 10, 2),
                ])
                score = round(min(completeness / 5 * 100, 96), 1)
                matched = []

            strengths = []
            weaknesses = []
            if tech_skills:
                strengths.append(f"Technical skills detected: {', '.join(tech_skills[:5])}")
            if soft_skills:
                strengths.append(f"Soft skills present: {', '.join(soft_skills[:3])}")
            if details.get('education'):
                strengths.append(f"Education found: {', '.join(details['education'][:2])}")
            if details.get('email'):
                strengths.append("Contact information is present")
            if matched:
                strengths.append(f"{len(matched)} skills match the job description")

            if not details.get('email'):
                weaknesses.append("No email address detected — ensure contact info is included")
            if details.get('experience', 'Not Specified') == 'Not Specified':
                weaknesses.append("Work experience duration not clearly specified")
            if len(tech_skills) < 3:
                weaknesses.append("Expand your technical skills section with specific tools")
            if not details.get('titles'):
                weaknesses.append("Add a clear job title / professional headline")
            if score < 60:
                weaknesses.append("Low ATS match — tailor this resume for the specific role")

            if not strengths:
                strengths = ["Resume is readable by ATS parsers", "File processed successfully"]
            if not weaknesses:
                weaknesses = ["Add quantified achievements", "Tailor content more to target role"]

            analysis = {
                "score": max(10, min(96, score)),
                "strengths": strengths[:5],
                "weaknesses": weaknesses[:5],
                "recommendations": [
                    "Add 5-7 quantifiable achievements with numbers (e.g., 'Reduced load time by 40%')",
                    "Match skills to the exact keywords in the job description",
                    "Use consistent, ATS-safe formatting: no tables, no columns, no graphics",
                    "Include a 3-line professional summary at the top of the resume",
                    "Add measurable outcomes to every work experience bullet point",
                ],
                "ai_used": False,
            }

        result = {
            "name": fname,
            "score": analysis.get("score", 0),
            "strengths": analysis.get("strengths", []),
            "weaknesses": analysis.get("weaknesses", []),
            "recommendation": (
                analysis.get("career_advice") or 
                (analysis.get("recommendations", ["Tailor your resume for better results"])[0]
                if isinstance(analysis.get("recommendations"), list) and analysis.get("recommendations")
                else "Tailor your resume for better results")
            ),
            "recommendations": analysis.get("recommendations", []),
            "ai_powered": ai_used,
            "career_advice": analysis.get("career_advice"),
            "breakdown": {
                "Keywords": analysis.get("keyword_score", 70),
                "Formatting": analysis.get("formatting_score", 85),
                "Structure": analysis.get("structure_score", 75),
                "Readability": analysis.get("readability_score", 80)
            }
        }

        # ── Store in Cache ────────────────────────────────────────────────────
        try:
            await db.ai_cache.update_one(
                {"_id": content_hash},
                {"$set": {"result": result, "created_at": datetime.utcnow()}},
                upsert=True
            )
        except Exception as cache_err:
            print(f"Cache write failed (non-critical): {cache_err}")

        return result

    except HTTPException:
        raise
    except Exception as e:
        import traceback
        print(f"❌ Unexpected analyze-public error: {str(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Analysis error: {str(e)}")




@router.post("/export-public")
async def export_public(
    data: Dict[str, Any]
):
    """Public Export for Home Page (No Auth)"""
    resume_text = data.get("resume_text", "No content provided")
    name = data.get("name", "resume")
    
    # Simple structured data for export
    resume_data = {
        "title": f"Analyzed Resume - {name}",
        "sections": {
            "Resume Content": [{"content": resume_text}]
        }
    }
    
    from services.export_service import ExportService
    export_service = ExportService()
    file_path = await export_service.generate_pdf(resume_data)
    
    return FileResponse(
        path=file_path,
        filename=f"Analyzed_{name}.pdf",
        media_type='application/pdf'
    )


@router.get("/hr/candidates")
async def hr_list_candidates(
    page: int = 1,
    limit: int = 20,
    current_user: UserResponse = Depends(get_current_user),
    db=Depends(get_database)
):
    """List all candidate resumes with their skill extraction for HR matrix"""
    if current_user.role not in ("hr", "employer", "enterprise", "admin"):
        raise HTTPException(status_code=403, detail="HR access required")

    query = {}
    if current_user.role != "admin" and current_user.company:
        query["company"] = current_user.company

    skip = (page - 1) * limit
    total = await db.resumes.count_documents(query)
    
    resumes_cursor = db.resumes.find(query).sort("created_at", -1).skip(skip).limit(limit)
    resumes = await resumes_cursor.to_list(length=limit)

    result = []
    for r in resumes:
        raw_text = r.get("raw_text", "")
        skills_raw = r.get("extracted_skills", {})

        # FIX-4: extracted_skills is a dict — extract if missing, then flatten properly
        if not skills_raw and raw_text:
            skills_raw = extract_skills(raw_text)

        skills_flat = _flatten_skills(skills_raw)

        result.append({
            "id": str(r["_id"]),
            "name": r.get("candidate_name", "Anonymous"),
            "email": r.get("email", ""),
            "score": r.get("ats_score", 0),
            "skills": skills_flat[:15],   # FIX-4: was slicing a dict (returns keys only)
            "skills_by_category": skills_raw if isinstance(skills_raw, dict) else {}
        })

    return {
        "items": result,
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": (total + limit - 1) // limit
    }

@router.post("/hr/search")
async def hr_semantic_search(
    request: dict,
    current_user: UserResponse = Depends(get_current_user),
    db=Depends(get_database)
):
    """
    AI-12: Semantic Candidate Search.
    Finds candidates based on a natural language query with local TF-IDF vector embeddings 
    by scoring them across their parsed text and metadata.
    """
    if current_user.role not in ("hr", "employer", "enterprise", "admin"):
        raise HTTPException(status_code=403, detail="HR access required")
    
    search_text = request.get("query", "")
    if not search_text:
        return {"items": []}

    db_query = {}
    if current_user.role != "admin" and current_user.company:
        db_query["company"] = current_user.company

    # Fetch all company resumes
    resumes_cursor = db.resumes.find(db_query)
    resumes = await resumes_cursor.to_list(length=None)

    if not resumes:
        return {"items": []}
    
    from ai.nlp_service import calculate_weighted_score
    scored_candidates = []
    
    for r in resumes:
        # Using calculate_weighted_score which implements sklearn TF-IDF Vectorization
        score, matched, _ = calculate_weighted_score(r.get("raw_text", ""), search_text, r)
        
        # Lower threshold for semantic search vs full ATS
        if score > 3.0:  
            skills_raw = r.get("extracted_skills", {})
            if not skills_raw and r.get("raw_text"):
                skills_raw = extract_skills(r.get("raw_text"))
                
            skills_flat = _flatten_skills(skills_raw)
            scored_candidates.append({
                "id": str(r["_id"]),
                "name": r.get("candidate_name", "Anonymous"),
                "email": r.get("email", ""),
                "score": score,
                "skills": skills_flat[:15],
                "matched_skills": matched
            })
            
    # Sort by semantic match descending
    scored_candidates.sort(key=lambda x: x["score"], reverse=True)
    
    return {
        "items": scored_candidates[:20],
        "total": len(scored_candidates)
    }



# ─── Cover Letter Endpoint ───────────────────────────────────────────────────

class CoverLetterRequest(BaseModel):
    resume_text: str
    job_description: str
    job_title: Optional[str] = ""


@router.post("/cover-letter")
async def generate_cover_letter(
    request: CoverLetterRequest,
    current_user: UserResponse = Depends(get_current_user)
):
    """Generate a tailored cover letter using Groq AI."""
    if not request.resume_text or not request.job_description:
        raise HTTPException(
            status_code=400,
            detail="Both resume_text and job_description are required."
        )
    groq = GroqService()
    
    prompt = f"""
    You are an expert career consultant. Generate a highly professional and tailored cover letter.
    Target Role: {request.job_title or 'Professional Role'}
    
    JOB DESCRIPTION:
    {request.job_description}
    
    CANDIDATE RESUME:
    {request.resume_text}
    
    RULES:
    1. Use a modern, persuasive tone.
    2. Highlight specific technical skills and experiences from the resume that match the job description.
    3. Quantify achievements where possible.
    4. Keep it under 400 words.
    5. Use [My Name], [Date], etc. as placeholders.
    6. Return ONLY the cover letter text.
    """
    
    cover_letter = await groq.generate_response(prompt)
    return {"cover_letter": cover_letter}

async def multi_job_match(
    resume: UploadFile = File(...),
    jds: List[UploadFile] = File(...),
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Candidate Feature: Check one resume against multiple JDs.
    Returns a ranked list of which JD matches the resume best.
    """
    # 1. Parse Resume
    res_bytes = await resume.read()
    res_text = extract_text(res_bytes, resume.filename)
    if not res_text.strip():
        raise HTTPException(status_code=400, detail="Invalid resume content")
    
    # 2. Extract Resume Details (for ranking)
    res_details = extract_details(res_text)
    res_details['text'] = res_text # Required for ranking engine

    # 3. Parse all JDs
    jd_list = []
    for jd_file in jds:
        jd_bytes = await jd_file.read()
        jd_text = extract_text(jd_bytes, jd_file.filename)
        if jd_text.strip():
            jd_list.append({"text": jd_text, "filename": jd_file.filename})
            
    if not jd_list:
        raise HTTPException(status_code=400, detail="No valid job descriptions uploaded")

    # 4. Rank JDs (Using the existing rank_candidates logic but treating JDs as candidates for the Resume)
    # Actually, rank_candidates(candidates, jd) -> we need to adapt it.
    # Logic: For each JD, calculate score vs the one resume.
    from ai.nlp_service import calculate_weighted_score
    
    results = []
    for item in jd_list:
        score, matched, missing = calculate_weighted_score(res_text, item['text'], res_details)
        results.append({
            "job_filename": item['filename'],
            "score": score,
            "matched_skills": matched,
            "missing_skills": missing
        })
        
    # Sort by score
    results.sort(key=lambda x: x['score'], reverse=True)
    return results


@router.post("/generate-interview")
async def generate_interview(
    request: dict,
    current_user: UserResponse = Depends(get_current_user)
):
    """Generate structured behavioral and technical interview questions."""
    role = request.get("role", "Professional Role")
    jd = request.get("jd", "")
    resume_text = request.get("resume_text", "")

    prompt = f"""
    You are an AI Interview Coach. Generate a JSON list of 10 interview questions for a candidate applying for the role of {role}.
    
    JOB DESCRIPTION: {jd}
    CANDIDATE RESUME: {resume_text}
    
    The JSON should be a list of objects with the following keys:
    "type": "behavioral" or "technical"
    "question": "The interview question"
    "expert_sample": "A short tip on how to answer this question effectively based on their resume"
    
    RULES:
    1. Ensure 5 are behavioral and 5 are technical.
    2. Tailor them specifically to the candidate's skills and the job requirements.
    3. Quantify achievement-based questions.
    
    RETURN ONLY THE JSON ARRAY.
    """
    
    groq = GroqService()
    import json
    response = await groq.generate_response(prompt)
    try:
        # Strip any markdown backticks if present
        cleaned = response.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("```")[1]
            if cleaned.startswith("json"):
                cleaned = cleaned[4:]
        questions = json.loads(cleaned)
        return questions
    except Exception:
        # Fallback if AI fails JSON
        return [
            {"type": "behavioral", "question": f"Tell me about a time you solved a complex problem as a {role}?", "expert_sample": "Use the STAR method."},
            {"type": "technical", "question": "Explain a difficult technical challenge from your recent projects.", "expert_sample": "Focus on the technologies mentioned in your resume."}
        ]


@router.get("/hr/stats")
async def hr_dashboard_stats(
    current_user: UserResponse = Depends(get_current_user),
    db=Depends(get_database)
):
    """Metrics for the HR Dashboard."""
    if current_user.role not in ("hr", "employer", "enterprise", "admin"):
        raise HTTPException(status_code=403, detail="HR access required")

    query = {}
    if current_user.role != "admin" and current_user.company:
        query["company"] = current_user.company

    candidates_screened = await db.resumes.count_documents(query)
    
    # Simple logic for "Top Matches" (resumes with score > 80)
    top_matches = await db.resumes.count_documents({**query, "ats_score": {"$gte": 80}})
    
    # Active sessions can be mocked or based on token refresh activity (simplified here)
    active_sessions = 5 # Mock or real based on user activity log if available

    return {
        "candidates_screened": candidates_screened,
        "top_matches": top_matches,
        "active_sessions": active_sessions
    }

class ChatResumeRequest(BaseModel):
    resume_text: str
    message: str
    target_role: Optional[str] = None
    context: Optional[str] = None

@router.post("/chat-resume")
async def chat_with_resume(
    body: ChatResumeRequest,
    current_user = Depends(get_current_user_optional)
):
    """
    Conversational AI interaction focused on the resume content.
    """
    if not body.resume_text or not body.message:
        raise HTTPException(status_code=400, detail="Missing resume text or message")
    
    role_ctx = f"Target Role: {body.target_role}\n" if body.target_role else ""
    
    system_prompt = f"""You are an elite career coach and resume strategist.
A candidate is asking you questions about their resume. Use the context below to give sharp, actionable advice.
Be professional, encouraging, but clinical in your critique. Keep answers concise but punchy.

RESUME CONTENT:
{body.resume_text[:8000]}

{role_ctx}
"""
    
    try:
        from ai.groq_service import GroqService
        groq = GroqService()
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": body.message}
        ]
        response = await groq.chat_completion(messages, max_tokens=800)
        return {"response": response}
    except Exception as e:
        print(f"❌ Chat with Resume error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate-jd")
async def generate_jd(
    request: dict,
    current_user = Depends(get_current_user)
):
    """
    AI-driven Job Description generation for HR.
    """
    role = request.get("role", "Professional Role")
    skills = request.get("skills", "")
    experience = request.get("experience", "Not specified")
    tone = request.get("tone", "Professional & Modern")
    
    prompt = f"""You are an elite HR consultant and technical recruiter. 
Generate a world-class, high-conversion Job Description for the following role:
Role: {role}
Key Skills: {skills}
Experience Required: {experience}
Tone: {tone}

The JD should be structured with:
1. Role Summary (Catchy and professional)
2. Core Responsibilities (Action-oriented)
3. Technical Requirements (Bullet points)
4. Preferred Qualifications
5. Why Join Us (A few selling points)

Use professional and engineering-grade language.
"""
    
    try:
        groq = GroqService()
        jd_text = await groq.generate_response(prompt)
        return {"jd": jd_text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
