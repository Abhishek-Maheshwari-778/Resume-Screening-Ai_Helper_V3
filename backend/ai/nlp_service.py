import re
import os

# Safe imports for Serverless/Vercel (Mocks heavy libraries)
nlp = None
SKLEARN_AVAILABLE = False

try:
    import spacy
    # Only try to load if we're likely in a local environment with enough RAM
    if os.environ.get("ENVIRONMENT") != "production":
        try:
            nlp = spacy.load("en_core_web_sm")
        except:
            pass
except ImportError:
    pass

try:
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.metrics.pairwise import cosine_similarity
    SKLEARN_AVAILABLE = True
except ImportError:
    pass


# 
#  EXTRACTORS
# 

def extract_name(text: str) -> str:
    if nlp:
        doc = nlp(text[:2000])
        for ent in doc.ents:
            if ent.label_ == "PERSON":
                name = ent.text.split('\n')[0].strip()
                if 2 <= len(name.split()) <= 4:
                    return name
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    if lines:
        first_line = lines[0]
        name_candidate = first_line.split('|')[0].split(',')[0].strip()
        if 2 <= len(name_candidate.split()) <= 4 and all(c.isalpha() or c.isspace() for c in name_candidate):
            return name_candidate
    return "Unknown"


def extract_email(text: str) -> str:
    pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    emails = re.findall(pattern, text)
    return emails[0] if emails else ""


def extract_phone(text: str) -> str:
    pattern = r'\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b|\b\d{10}\b'
    phones = re.findall(pattern, text)
    return phones[0] if phones else ""


from datetime import datetime

def extract_experience(text: str) -> str:
    # 1. Look for explicit "X years experience"
    exp_pattern = r'(\d+\+?\s*(?:years?|yrs?))(?:\s+of)?\s+experience'
    match = re.search(exp_pattern, text, re.I)
    if match:
        return match.group(1)
        
    # 2. Heuristically calculate total years from date ranges (e.g. 2018 - 2021)
    # Match pairs of years or year-to-present
    range_pattern = r'\b(19\d{2}|20\d{2})\b\s*[-to]+\s*(Present|Current|\b19\d{2}\b|\b20\d{2}\b)'
    matches = re.findall(range_pattern, text, re.I)
    
    total_years = 0
    current_year = datetime.now().year
    
    # Process ranges
    for start_str, end_str in matches:
        start_year = int(start_str)
        if end_str.lower() in ("present", "current"):
            end_year = current_year
        else:
            end_year = int(end_str)
            
        # Avoid anomalies
        if start_year <= end_year <= current_year + 1 and start_year > 1950:
            total_years += max(1, end_year - start_year)  # Count at least 1 for same-year jobs
            
    if total_years > 0:
        return f"{total_years} years"
        
    return "Not Specified"


def extract_education(text: str) -> list:
    edu_patterns = [
        r'\bBachelor of [A-Za-z\s]+', r'\bMaster of [A-Za-z\s]+',
        r'\bB\.?Tech\b', r'\bM\.?Tech\b', r'\bB\.?E\b', r'\bM\.?E\b',
        r'\bB\.?Sc\b', r'\bM\.?Sc\b', r'\bMBA\b', r'\bMCA\b', r'\bPhD\b',
        r'\bB\.?Com\b', r'\bM\.?Com\b', r'\bBCA\b', r'\bB\.?A\b',
        r'\bBachelor of Computer Applications\b',
    ]
    education = []
    for pattern in edu_patterns:
        match = re.search(pattern, text, re.I)
        if match:
            education.append(match.group().strip())
    if not education:
        for kw in ["Bachelors", "Masters", "Graduate", "PhD", "Undergraduate"]:
            if kw.lower() in text.lower():
                education.append(kw)
    return sorted(list(set(education)))


def extract_job_titles(text: str) -> list:
    titles_list = [
        # Engineering
        "Software Engineer", "Senior Software Engineer", "Staff Engineer", "Principal Engineer",
        "Frontend Developer", "Backend Developer", "Full Stack Developer",
        "Python Developer", "Java Developer", "React Developer", "Node.js Developer",
        "Mobile Developer", "iOS Developer", "Android Developer",
        "Machine Learning Engineer", "AI/ML Engineer", "Data Engineer",
        "DevOps Engineer", "Site Reliability Engineer", "SRE", "Platform Engineer",
        "Cloud Architect", "Solutions Architect", "Cloud Engineer",
        "System Administrator", "Network Engineer", "Security Engineer",
        "QA Engineer", "QA Automation Engineer", "Test Engineer", "SDET",
        "Embedded Engineer", "Firmware Engineer",
        # Data
        "Data Scientist", "Data Analyst", "Business Intelligence Analyst",
        "Research Scientist", "ML Researcher", "AI Researcher",
        # Product & Design
        "Product Manager", "Technical Product Manager", "Product Owner",
        "UI/UX Designer", "UX Researcher", "Graphic Designer", "UI Designer",
        "Scrum Master", "Agile Coach",
        # Management
        "Engineering Manager", "VP of Engineering", "CTO", "Technical Lead",
        "Team Lead", "Project Manager", "Program Manager",
        # Business
        "Business Analyst", "HR Manager", "Recruiter", "Technical Recruiter",
        "Sales Engineer", "Customer Success Manager", "Customer Tech Support",
        # Other
        "Undergraduate", "Intern", "Graduate Trainee",
    ]
    found = []
    for title in titles_list:
        if re.search(rf'\b{re.escape(title)}\b', text, re.I):
            found.append(title)
    return list(set(found))


#  Skill Aliases  maps alternate names to canonical names 
# So "JS" matches "javascript", "Postgres" matches "postgresql", etc.
SKILL_ALIASES = {
    "js": "javascript",
    "ts": "typescript",
    "node": "node.js",
    "nodejs": "node.js",
    "postgres": "postgresql",
    "pg": "postgresql",
    "mongo": "mongodb",
    "k8s": "kubernetes",
    "tf": "tensorflow",
    "ml": "machine learning",
    "ai": "artificial intelligence",
    "dl": "deep learning",
    "cv": "computer vision",
    "sklearn": "scikit-learn",
    "sklearn": "scikit-learn",
    "spring boot": "springboot",
    "react.js": "react",
    "reactjs": "react",
    "vuejs": "vue.js",
    "angularjs": "angular",
    "ci/cd": "jenkins",
    "devops": "docker",
    "gcloud": "gcp",
    "amazon web services": "aws",
    "microsoft azure": "azure",
    "powerbi": "power bi",
    "msexcel": "excel",
    "langchain": "langchain",
}


SKILLS_CATALOG = {
    "Technical Skills": [
        # Languages
        "python", "java", "javascript", "typescript", "c++", "c#", "c",
        "go", "golang", "rust", "swift", "kotlin", "ruby", "php", "scala",
        "r", "matlab", "perl", "bash", "shell scripting", "powershell",
        # Web & Frontend
        "html", "css", "react", "angular", "vue.js", "next.js", "nuxt.js",
        "svelte", "webpack", "vite", "tailwind css", "bootstrap", "sass",
        "redux", "zustand", "graphql", "rest api", "websocket",
        # Backend & APIs
        "node.js", "fastapi", "flask", "django", "express.js", "spring boot",
        "springboot", "laravel", "rails", "asp.net", "fastify",
        # Databases
        "sql", "mysql", "postgresql", "mongodb", "redis", "elasticsearch",
        "cassandra", "sqlite", "oracle", "dynamodb", "firestore", "neo4j",
        "influxdb",
        # AI/ML & Data Science
        "machine learning", "deep learning", "nlp", "computer vision",
        "tensorflow", "pytorch", "keras", "scikit-learn", "pandas", "numpy",
        "matplotlib", "seaborn", "plotly", "jupyter notebook",
        "hugging face", "transformers", "langchain", "llm", "rag",
        "vector database", "openai api", "generative ai", "prompt engineering",
        "artificial intelligence", "predictive modeling", "data analysis",
        "feature engineering", "model deployment", "mlflow",
        # Big Data
        "spark", "hadoop", "kafka", "airflow", "dbt", "snowflake",
        "bigquery", "databricks", "hive", "flink",
        # Cloud & Infrastructure
        "aws", "azure", "gcp", "cloud computing",
        "aws lambda", "ec2", "s3", "rds", "sagemaker", "ecs", "eks",
        "azure functions", "terraform", "ansible", "puppet", "chef",
        "serverless", "microservices", "service mesh",
        # DevOps & CI/CD
        "docker", "kubernetes", "jenkins", "github actions", "gitlab ci",
        "circleci", "argocd", "helm", "prometheus", "grafana",
        "linux", "ubuntu", "nginx", "apache",
        # Mobile
        "react native", "flutter", "android", "ios", "swift", "kotlin",
        "xamarin", "ionic",
        # Other Technical
        "opencv", "data visualization", "big data", "etl", "api design",
        "system design", "microservices architecture", "object-oriented programming",
        "functional programming", "test-driven development", "tdd",
        "data structures", "algorithms",
    ],
    "Soft Skills & Business": [
        "communication", "leadership", "problem solving", "critical thinking",
        "agile", "scrum", "kanban", "waterfall", "collaboration", "teamwork",
        "presentation", "negotiation", "strategy", "customer support",
        "customer success", "training", "mentoring", "management",
        "project management", "stakeholder management", "time management",
        "decision making", "analytical thinking", "adaptability",
        "cross-functional collaboration", "product thinking",
    ],
    "Tools & Platforms": [
        "git", "github", "gitlab", "bitbucket",
        "jira", "confluence", "trello", "notion", "asana", "monday.com",
        "tableau", "power bi", "looker", "metabase", "superset",
        "figma", "adobe xd", "sketch", "invision", "zeplin",
        "postman", "swagger", "insomnia",
        "vscode", "intellij", "pycharm", "xcode", "android studio",
        "excel", "google sheets", "google analytics",
        "salesforce", "hubspot", "zendesk",
        "firebase", "supabase", "vercel", "netlify", "heroku", "railway",
    ],
    "Security": [
        "cybersecurity", "penetration testing", "owasp", "siem",
        "vulnerability assessment", "ethical hacking", "network security",
        "ssl/tls", "oauth", "jwt", "sso", "identity management",
        "zero trust", "encryption", "firewall", "ids/ips",
    ],
}


def expand_text_with_aliases(text: str) -> str:
    """Expand alias terms so they match canonical skills in the catalog."""
    text_lower = text.lower()
    expansions = []
    for alias, canonical in SKILL_ALIASES.items():
        # If alias found, ensure canonical form is also added for matching
        if re.search(rf'\b{re.escape(alias)}\b', text_lower):
            expansions.append(canonical)
    return text_lower + " " + " ".join(expansions)


def extract_skills(text: str, categories: dict = None) -> dict:
    cats = categories or SKILLS_CATALOG
    found = {cat: [] for cat in cats}
    # Expand aliases first so "JS" matches "javascript"
    text_expanded = expand_text_with_aliases(text)
    for category, skills in cats.items():
        for skill in skills:
            if re.search(rf'\b{re.escape(skill)}\b', text_expanded):
                found[category].append(skill)
    return found


def generate_summary(details: dict) -> str:
    name = details.get('name', 'Candidate')
    title = details['titles'][0] if details.get('titles') else "Professional"
    exp = details.get('experience', 'N/A')
    tech_skills = details.get('skills', {}).get('Technical Skills', [])
    top_skills = ", ".join(tech_skills[:3]) if tech_skills else ""
    summary = f"{name} is a {title}"
    if exp not in ("Not Specified", "N/A"):
        summary += f" with {exp} of experience"
    if top_skills:
        summary += f", skilled in {top_skills}."
    else:
        summary += "."
    return summary


def extract_details(text: str, catalog: dict = None) -> dict:
    details = {
        "name": extract_name(text),
        "email": extract_email(text),
        "phone": extract_phone(text),
        "skills": extract_skills(text, categories=catalog),
        "education": extract_education(text),
        "experience": extract_experience(text),
        "titles": extract_job_titles(text),
    }
    details['summary'] = generate_summary(details)
    return details


# 
#  MATCHING / SCORING (TF-IDF + Keyword)
# 

BACKGROUND_CORPUS = [
    "software engineer python java sql javascript cloud architecture deployment",
    "data scientist machine learning deep learning python tensorflow pandas numpy analytics",
    "frontend developer react angular html css typescript ui ux web design",
    "devops engineer kubernetes docker aws jenkins ci cd linux infrastructure automation",
    "backend developer nodejs postgresql microservices scalable system design api",
    "product manager agile scrum roadmap stakeholder management analytics growth strategy",
    "cybersecurity engineer penetration testing owasp network security encryption firewalls",
    "project manager planning budgeting resources timeline delivery methodology",
    "designed developed implemented built created managed led supported maintained",
    "team collaboration problem solving leadership communication presentation mentor",
]

def calculate_weighted_score(resume_text: str, jd_text: str, resume_details: dict, catalog: dict = None):
    """AI-6 & AI-8: Returns total ATS score and sub-score breakdown"""
    if not resume_text or not jd_text:
        return 0.0, [], {}

    # 1. TF-IDF Score (20% weight)
    tfidf_score_raw = 0.0
    if SKLEARN_AVAILABLE:
        try:
            corpus = BACKGROUND_CORPUS + [resume_text, jd_text]
            vectorizer = TfidfVectorizer(stop_words='english')
            tfidf_matrix = vectorizer.fit_transform(corpus)
            tfidf_score_raw = float(cosine_similarity(tfidf_matrix[-2:-1], tfidf_matrix[-1:])[0][0])
        except Exception:
            pass

    # 2. Keyword/Skills Score (40% weight)
    resume_skills_dict = resume_details.get('skills', extract_skills(resume_text, categories=catalog))
    jd_skills_dict = extract_skills(jd_text, categories=catalog)
    
    resume_skills = set(s for cat in resume_skills_dict.values() for s in cat)
    jd_skills = set(s for cat in jd_skills_dict.values() for s in cat)
    matched_skills = list(resume_skills & jd_skills)
    
    skill_score_raw = len(matched_skills) / len(jd_skills) if jd_skills else 1.0

    # 3. Experience Match (25% weight)
    # Extract JD required years
    jd_exp_match = re.search(r'(\d+)\+?\s*(?:years?|yrs?)', jd_text, re.I)
    jd_years = int(jd_exp_match.group(1)) if jd_exp_match else 0
    # Extract Resume years
    res_exp_match = re.search(r'(\d+)', resume_details.get('experience', '0'))
    res_years = int(res_exp_match.group(1)) if res_exp_match else 0
    
    exp_score_raw = 1.0
    if jd_years > 0:
        exp_score_raw = min(1.0, res_years / jd_years)
    elif res_years > 0:
        exp_score_raw = 1.0 # Bonus for having exp when none explicitly demanded

    # 4. Education Match (15% weight)
    edu_score_raw = 0.0
    jd_edus = extract_education(jd_text)
    res_edus = resume_details.get('education', [])
    
    if not jd_edus:
        edu_score_raw = 1.0  # If JD doesn't ask for edu, full points
    else:
        # Check if any required degree appears in resume
        jd_edu_str = " ".join(jd_edus).lower()
        res_edu_str = " ".join(res_edus).lower()
        if any(req.lower() in res_edu_str for req in ["bachelor", "master", "phd", "degree", "mba", "ms", "bs"]):
             edu_score_raw = 1.0
        elif any(e.lower() in res_edu_str for e in jd_edus):
             edu_score_raw = 1.0
        elif len(res_edus) > 0:
             edu_score_raw = 0.5  # Has some edu, maybe not exact match

    # Calculate Weighted Total
    total_score = (
        (skill_score_raw * 0.40) +
        (exp_score_raw * 0.25) +
        (tfidf_score_raw * 0.20) +
        (edu_score_raw * 0.15)
    )

    breakdown = {
        "Skills (40%)": round(skill_score_raw * 100),
        "Experience (25%)": round(exp_score_raw * 100),
        "Context/TF-IDF (20%)": round(tfidf_score_raw * 100),
        "Education (15%)": round(edu_score_raw * 100)
    }

    return round(total_score * 100, 2), matched_skills, breakdown


def rank_candidates(resumes: list, job_description: str, catalog: dict = None) -> list:
    jd_skills_dict = extract_skills(job_description, categories=catalog)
    jd_skills = set(s for cat in jd_skills_dict.values() for s in cat)
    rankings = []
    
    for resume in resumes:
        score, matched, breakdown = calculate_weighted_score(
            resume.get('text', ''), 
            job_description, 
            resume, 
            catalog=catalog
        )
        rankings.append({
            "name": resume.get('name', 'Unknown'),
            "email": resume.get('email', ''),
            "phone": resume.get('phone', ''),
            "score": score,
            "breakdown": breakdown,
            "skills": resume.get('skills', {}),
            "summary": resume.get('summary', ''),
            "matched_skills": matched,
            "missing_skills": list(jd_skills - set(matched)),
            "experience": resume.get('experience', 'N/A'),
            "titles": resume.get('titles', []),
            "education": resume.get('education', []),
        })
    return sorted(rankings, key=lambda x: x['score'], reverse=True)


def compare_candidates(cand_a: dict, cand_b: dict) -> dict:
    skills_a = set(s for cat in cand_a.get('skills', {}).values() for s in cat)
    skills_b = set(s for cat in cand_b.get('skills', {}).values() for s in cat)
    return {
        "common": list(skills_a & skills_b),
        "only_a": list(skills_a - skills_b),
        "only_b": list(skills_b - skills_a),
    }
