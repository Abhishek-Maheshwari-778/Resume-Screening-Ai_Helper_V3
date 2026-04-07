🚀 THE ULTIMATE AI RESUME PLATFORM v2.0 - ARCHITECTURE & MASTER GUIDE 🚀
========================================================================

This document provides a 360-degree technical and operational map of the entire system.
It covers every process, every AI model, and every data flow in extreme detail.

---

## 🏗️ 1. SYSTEM ARCHITECTURE (High-Level)

```text
       [ USER / HR ] 
             │
             ▼
    ┌──────────────────────┐
    │  REACT FRONTEND      │ (Vite, Tailwind, Zustand, React Query)
    │  (Port 5173)         │
    └───────────┬──────────┘
                │ (JSON / Multipart Data)
                ▼
    ┌──────────────────────┐
    │  Python FastAPI      │ (Async REST API, Port 8000)
    │  (Backend Logic)     │
    └───────────┬──────────┘
                │
    ┌───────────┴──────────┬───────────┐
    │                      │           │
    ▼                      ▼           ▼
[ MONGODB ATLAS ]    [ AI MODELS ]   [ FIREBASE AUTH ]
(Data Storage)       (Intelligence)  (User Management)
```

---

## 🧠 2. THE AI ENGINES - PROCESS FLOWS

### A. RESUME PARSING & ATS ANALYSIS (DeepSeek-V3)
This process happens when a Candidate uploads a resume or uses the Home Page widget.

**Diagram:**
```text
[FILE UPLOAD] ──► [ParserService] ──► [DeepSeekService] ──► [Frontend UI]
 (PDF/DOCX)       (Text Extraction)    (ATS Expert Role)      (Score & Tips)
```

1.  **Extraction**: `parser_service.py` uses `PyPDF2` or `python-docx` to convert binary files into raw strings.
2.  **Analysis**: The `DeepSeekService` sends the text with a specialized prompt: *"You are an ATS parser. JSON return only."*
3.  **Refinement**: We use **Regex Fallbacks** to clean the response if the AI adds markdown blocks (` ```json `).
4.  **Security**: Public uploads (Home page) have NO storage; logged-in uploads are stored in MongoDB.

### B. CONTENT GENERATION (Groq - Llama3-70B)
Used in the **Resume Builder** for "Improve Bullet Point" or "Generate Summary."

**Diagram:**
```text
[USER INPUT] ──► [GroqService] ──► [Resume Builder]
 (Weak Point)     (Fast Inference)   (Strong Point)
```

- **Speed**: Groq provides ultra-sub-second inference.
- **Context**: The `GroqService` sees the user's role (e.g., Software Engineer) and tailors the output specifically for that role.

### C. HR BULK SCREENING (NLP + TF-IDF)
This is the most complex backend process. It allows HR to rank 100+ candidates simultaneously.

**Diagram:**
```text
[JOB DESCRIPTION]                          [100s of RESUMES]
        │                                         │
        ▼                                         ▼
[NLP SKILL EXTRACTION] <───(Sync)───> [NLP SKILL EXTRACTION]
        │                                         │
        └──────────────┬──────────────────────────┘
                       ▼
            [TF-IDF VECTORIZATION] ──► [RANKED LIST]
             (Cosine Similarity)        (Scale 0-100)
```

1.  **Parallel Parsing**: Backend uses `asyncio.gather` to process all uploaded files at once.
2.  **Skill Mapping**: `nlp_service.py` (spaCy) extracts technical, soft, and tool-based skills.
3.  **TF-IDF Ranking**: We calculate the "Keyword Overlap" score and "Semantic Similarity" using Scikit-learn.
4.  **Skill Matrix**: The results are populated into a read-only matrix in the Frontend.

---

## 🛠️ 3. THE TECHNOLOGY STACK MATRIX

| COMPONENT | TECHNOLOGY USED | PURPOSE |
|-----------|-----------------|---------|
| **Frontend** | React, TypeScript, Vite | Fast, type-safe UI |
| **Styling** | Tailwind CSS, Framer Motion | Premium modern aesthetics |
| **State** | Zustand | Global auth and resume state |
| **Backend** | Python 3.10+, FastAPI | High-performance async API |
| **DB** | MongoDB (Atlas / Local) | NoSQL document storage |
| **Auth** | Firebase Auth + JWT | Google OAuth and secure logins |
| **AI (Hvy)** | DeepSeek-Chat | Deep ATS Scoring & Analysis |
| **AI (Fst)** | Groq (Llama3-70B) | Real-time Resume Assistant |
| **NLP** | spaCy (en_core_web_sm) | Name and Skill extraction |
| **Math** | Scikit-learn | TF-IDF Candidate Ranking |
| **Files** | PyPDF2, python-docx | Multi-format resume support |
| **Export** | WeasyPrint | High-fidelity PDF generation |

---

## 📂 4. DIRECTORY MAP (Detailed)

### /BACKEND
- `/ai`: Intelligence core. Contains adapters for Groq, DeepSeek, and NLP.
- `/routes`: API controllers (Auth, Resumes, AI, Admin).
- `/database`: Connection pool and MongoDB initializers.
- `/models`: Pydantic classes for strict data validation.
- `/services`: Helper logic for Auth and specialized file exports.
- `main.py`: The "Brain". Starts the server and wires all parts together.

### /FRONTEND
- `/src/pages`: 
    - `/public`: Landing, Auth, and Home.
    - `/hr`: The Dashboard, Skill Matrix, and Bulk Analysis tools.
    - `/app`: Personal Resume Builder and ATS Checker.
- `/src/components`: Resusable UI parts (Modals, Dropzones, AI Assistant).
- `/src/stores`: Zustand state management for persistence.
- `/src/lib`: External configurations (Firebase, Axios).

---

## 👥 5. DEMO USER GUIDE

Reset the system anytime by running `cd backend && python seed_db.py`.

| ROLE | USERNAME | PASSWORD | ACCESS LEVEL |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@resume.ai` | `Admin@123` | System stats, User management |
| **HR** | `hr@techcorp.com` | `Hr@12345` | Bulk screening, Skill matrix |
| **EMPLOYER** | `employer@globex.com` | `Emp@12345` | Candidate ranking, Comparison |
| **CANDIDATE** | `john@example.com` | `Cand@123` | Resume Builder, ATS Checker |

---

## 🛠️ 6. HOW TO RUN (THE MASTER COMMANDS)

### FOR BACKEND:
```bash
cd backend
.\venv\Scripts\activate           # Activate venv
pip install -r requirements.txt   # Sync libs
python seed_db.py                 # (Optional) Wipe & Seed DB
uvicorn main:app --reload --port 8000
```

### FOR FRONTEND:
```bash
cd frontend
npm install                       # Sync node_modules
npm run dev                       # Start Vite dev server (Port 5173)
```

---

## 🤖 7. SYSTEM CAPABILITIES SUMMARY
- ✅ **Multi-File Upload**: Process 100+ resumes in seconds.
- ✅ **Dynamic ATS Matching**: Deep analysis of keywords and structure.
- ✅ **Real-time AI Chat**: Persistent context-aware career assistant.
- ✅ **One-Click Export**: Download professional PDFs instantly.
- ✅ **Skill Gap Analysis**: See exactly what your candidate pool is missing.

---

🚀 PLATFORM v2.0 READY FOR PRODUCTION DEPLOYMENT 🚀
MAINTAINED BY: AI RESUME PLATFORM ENGINE
VERSION: 2.0.0 (MASTER STABLE)
