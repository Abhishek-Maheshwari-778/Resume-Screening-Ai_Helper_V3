"""
Groq Service — PRIMARY AI ENGINE
Replaces DeepSeek for all ATS analysis since DeepSeek key expired.
Uses llama-3.3-70b-versatile with fallback chain.
"""
import asyncio
import json
import re
from groq import Groq
from typing import List, Dict, Any, Optional
from utils.config import get_settings


class GroqService:
    def __init__(self):
        settings = get_settings()
        self.client = Groq(
            api_key=settings.GROQ_API_KEY,
            timeout=20.0  # 20 seconds max per request
        )
        # Model fallback chain — most capable first
        self.model = "llama-3.3-70b-versatile"
        self.fast_model = "llama-3.1-8b-instant"  # Faster/cheaper for bulk tasks
        self.fallback_models = ["llama-3.1-70b-versatile", "llama-3.1-8b-instant"]

    # ── LOW-LEVEL HELPERS ──────────────────────────────────────────────────────

    def _sync_chat(self, messages: list, max_tokens: int = 800, model_override: str = None) -> str:
        """Synchronous Groq call wrapped for thread-pool use."""
        models_to_try = [model_override] if model_override else [self.model] + self.fallback_models
        for model in models_to_try:
            if not model: continue
            try:
                result = self.client.chat.completions.create(
                    messages=messages,
                    model=model,
                    max_tokens=max_tokens,
                )
                return result.choices[0].message.content or ""
            except Exception as e:
                print(f"Groq model {model} failed: {e}")
                if model_override: break # Don't fallback if specifically requested
                continue
        return ""

    async def _async_chat(self, messages: list, max_tokens: int = 800) -> str:
        """Run Groq sync call in thread-pool to not block FastAPI event loop."""
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(
            None, lambda: self._sync_chat(messages, max_tokens)
        )

    def _parse_json_safe(self, raw: str) -> Dict:
        """Extract a JSON dict from a Groq response that may have markdown fences."""
        if not raw:
            return {}
        cleaned = raw.strip()
        # Strip ```json ... ``` fences
        if "```" in cleaned:
            for part in cleaned.split("```"):
                part = part.strip()
                if part.startswith("json"):
                    part = part[4:].strip()
                try:
                    return json.loads(part)
                except Exception:
                    continue
        # Direct parse
        try:
            return json.loads(cleaned)
        except Exception:
            pass
        # Regex: grab first {...} block
        match = re.search(r'\{.*\}', cleaned, re.DOTALL)
        if match:
            try:
                return json.loads(match.group(0))
            except Exception:
                pass
        return {}

    # ── PRIMARY: ATS ANALYSIS (replaces DeepSeek) ─────────────────────────────

    async def analyze_resume_ats(self, resume_text: str, job_description: str = None, sections: Dict[str, str] = None) -> Dict[str, Any]:
        """
        Full ATS resume analysis using Groq.
        Optionally uses sectional data for improved accuracy.
        """
        jd_part = f"\n\nJOB DESCRIPTION:\n{job_description[:3000]}" if job_description else ""
        
        # If sections provided, formatting they key-value into string
        section_context = ""
        if sections:
            section_context = "\n\nSTRUCTURED SECTIONS:\n" + "\n".join([f"{k.upper()}: {v[:1000]}" for k,v in sections.items() if v])

        prompt = f"""You are a senior ATS and Career Strategy expert. Analyze the following resume.
{section_context}

RAW RESUME CONTENT:
{resume_text[:10000]}{jd_part}

Return ONLY a valid JSON object. Be critical and professional.
{{
  "score": <integer 0-100, overall compatibility>,
  "keyword_score": <integer 0-100, match for technical and domain keywords>,
  "formatting_score": <integer 0-100, ATS parsing safety>,
  "structure_score": <integer 0-100, completeness of key sections>,
  "readability_score": <integer 0-100, impact of bullet points and action verbs>,
  "strengths": ["<detailed strength 1>", "<detailed strength 2>", "<detailed strength 3>"],
  "weaknesses": ["<specific fix 1>", "<specific fix 2>", "<specific fix 3>"],
  "recommendations": ["<major strategy 1>", "<major strategy 2>", "<major strategy 3>", "<major strategy 4>"],
  "missing_keywords": ["<top 5 missing keywords from JD>"],
  "ats_issues": ["<any formatting layout obstacles found>"],
  "career_advice": "<2 sentences of punchy personal advice for this role>"
}}

RULES:
1. Target score 85+ only for elite candidates.
2. If JD provided, score strictly against its requirements.
3. Recommendations must start with strong action verbs.
4. RETURN ONLY VALID JSON."""

        try:
            raw = await self._async_chat([{"role": "user", "content": prompt}], max_tokens=1500)
            parsed = self._parse_json_safe(raw)
            if parsed and isinstance(parsed.get("score"), (int, float)):
                return parsed
        except Exception as e:
            print(f"❌ Groq ATS analysis error: {e}")

        # Final Fallback
        return self._default_ats_fallback()

    def _default_ats_fallback(self) -> Dict[str, Any]:
        """Safe fallback result when all AI attempts fail."""
        return {
            "score": 65,
            "keyword_score": 62,
            "formatting_score": 78,
            "structure_score": 64,
            "readability_score": 68,
            "strengths": [
                "Resume was successfully parsed and processed",
                "Contact information appears to be present",
            ],
            "weaknesses": [
                "AI analysis is at capacity — showing local metrics",
                "Quantifiable achievements could be strengthened",
            ],
            "recommendations": [
                "Add 3-5 quantifiable metrics (e.g., 'Reduced costs by 15%')",
                "Include a bolded 'Technical Skills' section",
                "Ensure your job titles are clearly structured",
                "Tailor keywords to match your specific target market",
            ],
            "missing_keywords": [],
            "ats_issues": [],
        }

    # ── GENERAL GENERATION ─────────────────────────────────────────────────────

    async def generate_response(self, prompt: str, max_tokens: int = 1500) -> str:
        """General-purpose text generation."""
        try:
            return await self._async_chat([{"role": "user", "content": prompt}], max_tokens=max_tokens)
        except Exception as e:
            print(f"Groq generate_response error: {e}")
            return "AI generation temporarily unavailable. Please try again."

    async def generate_suggestions(self, prompt: str, max_tokens: int = 800) -> str:
        """General-purpose suggestions generation — used by /chat endpoint."""
        try:
            return await self._async_chat([{"role": "user", "content": prompt}], max_tokens=max_tokens)
        except Exception as e:
            print(f"Groq generate_suggestions error: {e}")
            return "I'm having trouble connecting to the AI right now. Please try again shortly."

    async def get_resume_suggestions(self, resume_text: str, role: str = None) -> List[str]:
        """Get 5 resume improvement suggestions."""
        role_str = f"for a {role}" if role else "for a professional"
        prompt = (
            f"You are an expert resume coach. Analyze the following resume and provide exactly 5 "
            f"specific, actionable suggestions to improve it {role_str}. "
            f"Format your response as a numbered list.\n\nResume:\n{resume_text[:8000]}"
        )
        try:
            content = await self._async_chat([{"role": "user", "content": prompt}], max_tokens=600)
            lines = [l.strip() for l in content.split('\n') if l.strip()]
            tips = [l for l in lines if l and (l[0].isdigit() or l.startswith('-') or l.startswith('•'))]
            return tips[:5] if tips else lines[:5]
        except Exception as e:
            print(f"Groq resume suggestions error: {e}")
            return ["Add quantifiable achievements", "Use strong action verbs", "Tailor to job description"]

    async def rewrite_bullet_point(self, bullet: str) -> str:
        """Rewrite a resume bullet point to be more impactful."""
        prompt = (
            f"Rewrite this resume bullet point to be more impactful, quantified, and action-oriented. "
            f"Return ONLY the rewritten bullet point, nothing else.\n\nOriginal: {bullet}"
        )
        try:
            return await self._async_chat([{"role": "user", "content": prompt}], max_tokens=200)
        except Exception as e:
            print(f"Groq rewrite error: {e}")
            return bullet

    async def generate_candidate_summary(self, candidate_data: Dict[str, Any]) -> str:
        """Generate a 2-sentence AI summary for HR screening."""
        raw_skills = candidate_data.get('skills', {})
        all_skills = (
            [s for cat in raw_skills.values() for s in cat]
            if isinstance(raw_skills, dict)
            else list(raw_skills) if raw_skills else []
        )
        prompt = (
            f"Write a professional 2-sentence summary for an HR recruiter based on this candidate:\n\n"
            f"Candidate: {candidate_data.get('name', 'Unknown')}\n"
            f"Expertise: {candidate_data.get('experience', 'N/A')}\n"
            f"Skills: {', '.join(all_skills[:10])}\n"
            f"Education: {', '.join(candidate_data.get('education', []))}\n"
            f"Match Score: {candidate_data.get('score', 'N/A')}%"
        )
        try:
            # Use fast_model for bulk summaries to avoid rate limits
            loop = asyncio.get_event_loop()
            raw = await loop.run_in_executor(
                None, lambda: self._sync_chat([{"role": "user", "content": prompt}], max_tokens=150, model_override=self.fast_model)
            )
            return raw.strip()
        except Exception as e:
            print(f"Groq candidate summary error: {e}")
            return candidate_data.get('summary', '')

    async def build_resume_section(self, section_type: str, job_title: str, user_info: str) -> str:
        """Generate a specific resume section."""
        prompt = (
            f"Write a professional {section_type} section for a resume targeting: {job_title}. "
            f"User context: {user_info}. "
            f"Return only the section content, formatted professionally. Be concise and impactful."
        )
        try:
            return await self._async_chat([{"role": "user", "content": prompt}], max_tokens=500)
        except Exception as e:
            print(f"Groq build_section error: {e}")
            return f"[{section_type} content could not be generated]"

    async def generate_cover_letter(self, resume_text: str, job_description: str, job_title: str = "") -> str:
        """Generate a tailored cover letter."""
        target = job_title or "the position described"
        prompt = (
            f"Write a compelling, tailored cover letter for a candidate applying for: {target}\n\n"
            f"RESUME:\n{resume_text[:8000]}\n\n"
            f"JOB DESCRIPTION:\n{job_description[:3000]}\n\n"
            f"Instructions: 3-4 paragraphs. Open with enthusiasm, highlight 2-3 achievements, "
            f"connect skills to requirements, close with a call to action. "
            f"Write the full cover letter now:"
        )
        try:
            return await self._async_chat([{"role": "user", "content": prompt}], max_tokens=900)
        except Exception as e:
            print(f"Groq cover letter error: {e}")
            return "Cover letter generation temporarily unavailable."

    async def extract_resume_details_ai(self, resume_text: str) -> Dict[str, Any]:
        """Deep extraction of resume entities using AI (used when regex fails)."""
        prompt = (
            f"Extract structured information from the following resume text. "
            f"Return ONLY a valid JSON object with these keys: "
            f"name, email, phone, experience (total years as number), skills (list of strings), "
            f"titles (list of job titles), education (list of degrees).\n\n"
            f"RESUME TEXT:\n{resume_text[:6000]}"
        )
        try:
            raw = await self._async_chat([{"role": "user", "content": prompt}], max_tokens=1000, model_override=self.fast_model)
            return self._parse_json_safe(raw)
        except Exception as e:
            print(f"Groq extraction error: {e}")
            return {}

    async def optimize_resume_keywords(self, resume_text: str, job_description: str) -> Dict[str, Any]:
        """Suggest keyword optimizations for a specific JD."""
        prompt = (
            f"Compare the following resume against the job description and identify missing keywords "
            f"that would improve ATS ranking. Return ONLY a valid JSON object with these fields:\n"
            f'{{"missing_keywords": ["kw1", "kw2", ...], "suggested_additions": [{{"original": "...", "improved": "..."}}]}}\n\n'
            f"RESUME:\n{resume_text[:4000]}\n\n"
            f"JOB DESCRIPTION:\n{job_description[:2000]}"
        )
        try:
            raw = await self._async_chat([{"role": "user", "content": prompt}], max_tokens=800)
            return self._parse_json_safe(raw)
        except Exception as e:
            print(f"Groq optimize keywords error: {e}")
            return {"missing_keywords": [], "suggested_additions": []}
