import asyncio
from google import genai
from ..config import settings
import json
import logging
from typing import Dict, Any, List, Optional
import PyPDF2
from io import BytesIO
from .text_matcher import TextMatcher

logger = logging.getLogger(__name__)

MODEL_NAME = "gemini-2.0-flash"

client = genai.Client(api_key=settings.GEMINI_API_KEY)
text_matcher = TextMatcher()


def _sync_generate_json(prompt: str) -> Dict[str, Any]:
    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=prompt,
        config={"response_mime_type": "application/json"}
    )
    if not response.text:
        raise ValueError("Empty response from Gemini")
    return json.loads(response.text)


def _sync_generate_text(prompt: str) -> str:
    response = client.models.generate_content(model=MODEL_NAME, contents=prompt)
    return response.text or ""


async def _generate_json(prompt: str) -> Dict[str, Any]:
    try:
        return await asyncio.to_thread(_sync_generate_json, prompt)
    except Exception as e:
        logger.exception("Gemini JSON generation failed")
        raise Exception(f"AI generation failed: {e}")


async def _generate_text(prompt: str) -> str:
    try:
        return await asyncio.to_thread(_sync_generate_text, prompt)
    except Exception as e:
        logger.exception("Gemini text generation failed")
        raise Exception(f"AI generation failed: {e}")


async def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    def _extract():
        try:
            reader = PyPDF2.PdfReader(BytesIO(pdf_bytes))
            pages_text = []
            for page in reader.pages:
                text = page.extract_text()
                if text:
                    pages_text.append(text)
            extracted = "\n".join(pages_text).strip()
            if not extracted:
                logger.warning("PDF extraction produced empty text — PDF may be image-based or corrupted.")
            else:
                logger.info("PDF extracted successfully: %d characters", len(extracted))
            return extracted
        except Exception as e:
            logger.exception("PDF extraction failed: %s", e)
            return ""
    return await asyncio.to_thread(_extract)


def _tfidf_score(resume_text: str, jd_text: str) -> int:
    """
    Compute a 0-100 resume-fit score using TF-IDF cosine similarity.
    Used as fallback when the Gemini API is unavailable.
    """
    try:
        raw = text_matcher.similarity(resume_text, jd_text)
        # Raw TF-IDF cosine similarity for good resume-JD matches is ~0.15-0.45.
        # Scale 0.0 → 5, 0.20 → 55, 0.40 → 105 → clamped to 100.
        return min(100, max(5, int(raw * 250)))
    except Exception:
        return 50


def _score_to_recommendation(score: float) -> str:
    if score >= 80:
        return "Strong Hire"
    elif score >= 65:
        return "Hire"
    elif score >= 45:
        return "Consider"
    return "Reject"


async def extract_resume_profile(resume_text: str) -> Dict[str, Any]:
    """
    Dedicated extraction step: reads resume text (from PyPDF2) and asks Gemini
    to pull out name, email, top 10 skills, and projects with 1-line descriptions.
    Runs independently from scoring so profile data is never lost if scoring fails.
    """
    if not resume_text or not resume_text.strip():
        logger.warning("extract_resume_profile: resume_text is empty — cannot extract profile.")
        return {
            "full_name": "", "email": "",
            "top_skills": [], "projects": [],
            "education": "", "certifications": "",
        }

    prompt = f"""You are a resume parser. Read the resume below and extract structured information.

RESUME:
{resume_text}

Return ONLY valid JSON — no markdown, no explanation, raw JSON only:

{{
    "full_name": "candidate full name from resume header",
    "email": "email address from resume or empty string",
    "education": "highest degree, institution, year — e.g. B.Tech Computer Science, IIT Delhi, 2022",
    "certifications": "comma-separated certifications or empty string",
    "top_skills": [
        "Skill 1", "Skill 2", "Skill 3", "Skill 4", "Skill 5",
        "Skill 6", "Skill 7", "Skill 8", "Skill 9", "Skill 10"
    ],
    "projects": [
        {{"name": "Project Name", "description": "one sentence: what it does and key technologies used"}},
        {{"name": "Project Name 2", "description": "one sentence: what it does and key technologies used"}},
        {{"name": "Project Name 3", "description": "one sentence: what it does and key technologies used"}}
    ]
}}

Rules:
- top_skills must have exactly 10 entries (pad with most-mentioned skills if fewer found)
- projects: include all projects found in the resume, each with a single clear description sentence
- If a field is not found in the resume, use an empty string or empty list
"""
    try:
        result = await _generate_json(prompt)
        logger.info(
            "extract_resume_profile succeeded: name=%r skills_count=%d projects_count=%d",
            result.get("full_name"), len(result.get("top_skills", [])), len(result.get("projects", []))
        )

        skills = result.get("top_skills", [])
        # Normalise: could come back as list of strings or list of objects
        if skills and isinstance(skills[0], dict):
            skills = [s.get("name", str(s)) for s in skills]
        # Keep only strings, cap at 10
        skills = [str(s).strip() for s in skills if s][:10]

        projects = result.get("projects", [])
        if not isinstance(projects, list):
            projects = []

        return {
            "full_name": result.get("full_name", "").strip(),
            "email": result.get("email", "").strip(),
            "education": result.get("education", "").strip(),
            "certifications": result.get("certifications", "").strip(),
            "top_skills": skills,
            "projects": projects,
        }
    except Exception as e:
        logger.exception("extract_resume_profile failed: %s", e)
        return {
            "full_name": "", "email": "",
            "top_skills": [], "projects": [],
            "education": "", "certifications": "",
        }


async def analyze_resume(
    resume_text: str,
    job_title: str,
    job_description: str,
    job_requirements: str
) -> Dict[str, Any]:
    if not resume_text or not resume_text.strip():
        logger.warning("analyze_resume called with empty resume_text — scoring will be based on JD only.")

    prompt = f"""
You are an expert AI recruiter performing a detailed resume analysis.

Carefully read the resume and the job details below. Score the candidate semantically —
consider equivalent skills, transferable experience, and related technologies, not just
exact keyword matches.

RESUME:
{resume_text}

JOB TITLE:
{job_title}

JOB DESCRIPTION:
{job_description}

JOB REQUIREMENTS:
{job_requirements}

Return ONLY valid JSON. Do NOT include any explanation, markdown, or code blocks — raw JSON only.

{{
    "overall_score": 75,
    "skills_match": 80,
    "experience_match": 70,
    "recommendation": "Hire",
    "candidate_name": "Candidate Full Name",
    "candidate_email": "candidate@email.com",
    "analysis": "One concise sentence explaining the match or mismatch.",
    "summary": "2-3 sentences covering the candidate background and fit.",
    "strengths": "strength1, strength2, strength3",
    "weaknesses": "weakness1, weakness2",
    "skill_gaps": "missing_skill1, missing_skill2",
    "top_skills": [
        {{"name": "Skill Name", "score": 90}},
        {{"name": "Skill Name", "score": 85}},
        {{"name": "Skill Name", "score": 80}},
        {{"name": "Skill Name", "score": 75}},
        {{"name": "Skill Name", "score": 70}},
        {{"name": "Skill Name", "score": 65}},
        {{"name": "Skill Name", "score": 60}},
        {{"name": "Skill Name", "score": 55}},
        {{"name": "Skill Name", "score": 50}},
        {{"name": "Skill Name", "score": 45}}
    ],
    "extracted_skills": ["skill1", "skill2", "skill3", "skill4", "skill5", "skill6", "skill7", "skill8", "skill9", "skill10"],
    "extracted_projects": [
        {{"name": "Project Name", "description": "What it does and key tech used"}},
        {{"name": "Project Name 2", "description": "What it does and key tech used"}}
    ],
    "extracted_education": "Degree, Institution, Year",
    "extracted_certifications": "certifications or empty string"
}}

Replace ALL placeholder values above with actual values from the resume and job analysis.
overall_score, skills_match, experience_match MUST be integers between 0 and 100.
recommendation MUST be exactly one of: "Strong Hire", "Hire", "Consider", "Reject".

Scoring guidance:
- 80-100: Strong match — most required skills present, relevant experience
- 60-79: Good match — core skills present, minor gaps
- 40-59: Partial match — some relevant skills, notable gaps
- 0-39: Poor match — significant skill or experience mismatch
"""

    try:
        ai_result = await _generate_json(prompt)
        logger.info("Gemini resume analysis succeeded: overall=%s rec=%s",
                    ai_result.get("overall_score"), ai_result.get("recommendation"))

        overall_score   = float(ai_result.get("overall_score", 50))
        skills_match    = float(ai_result.get("skills_match", 50))
        experience_match = float(ai_result.get("experience_match", 50))
        recommendation  = ai_result.get("recommendation", "Consider")

        # Sanity-check: if Gemini returned obvious placeholder values, fall back to TF-IDF
        if overall_score == 75 and skills_match == 80 and experience_match == 70:
            logger.warning("Gemini returned placeholder values — overriding with TF-IDF scores")
            jd_combined = f"{job_title}\n{job_description}\n{job_requirements}"
            overall_score = float(_tfidf_score(resume_text, jd_combined) if resume_text.strip() else 5)
            skills_match = float(_tfidf_score(resume_text, job_requirements) if resume_text.strip() else 5)
            experience_match = float(max(5, int((overall_score + skills_match) / 2 * 0.9)))
            recommendation = _score_to_recommendation(overall_score)

        extracted_skills  = ai_result.get("extracted_skills", [])
        extracted_projects = ai_result.get("extracted_projects", [])
        top_skills        = ai_result.get("top_skills", [])

        if isinstance(extracted_skills, str):
            extracted_skills = [s.strip() for s in extracted_skills.split(",") if s.strip()]
        if not isinstance(extracted_projects, list):
            extracted_projects = []
        if not isinstance(top_skills, list):
            top_skills = []

        return {
            "candidate_score":    overall_score,
            "skills_match":       skills_match,
            "experience_match":   experience_match,
            "overall_score":      overall_score,
            "candidate_name":     ai_result.get("candidate_name", ""),
            "candidate_email":    ai_result.get("candidate_email", ""),
            "recommendation":     recommendation,
            "analysis":           ai_result.get("analysis", ""),
            "summary":            ai_result.get("summary", ""),
            "strengths":          ai_result.get("strengths", ""),
            "weaknesses":         ai_result.get("weaknesses", ""),
            "skill_gaps":         ai_result.get("skill_gaps", ""),
            "top_skills":         top_skills,
            "extracted_skills":   extracted_skills,
            "extracted_projects": extracted_projects,
            "extracted_education":      ai_result.get("extracted_education", ""),
            "extracted_certifications": ai_result.get("extracted_certifications", ""),
        }

    except Exception as e:
        logger.exception("Gemini resume analysis failed — falling back to TF-IDF scorer. Error: %s", e)

        # Use TF-IDF cosine similarity to compute a real score instead of returning flat 50.
        jd_combined = f"{job_title}\n{job_description}\n{job_requirements}"
        overall = _tfidf_score(resume_text, jd_combined) if resume_text.strip() else 5
        skills = _tfidf_score(resume_text, job_requirements) if resume_text.strip() else 5
        experience = max(5, int((overall + skills) / 2 * 0.9))
        recommendation = _score_to_recommendation(overall)

        return {
            "candidate_score": float(overall),
            "skills_match": float(skills),
            "experience_match": float(experience),
            "overall_score": float(overall),
            "candidate_name": "", "candidate_email": "",
            "recommendation": recommendation,
            "analysis": f"Scored via TF-IDF keyword analysis (AI service unavailable). Score: {overall}/100.",
            "summary": "Resume was scored using keyword matching — AI semantic analysis was temporarily unavailable.",
            "strengths": "", "weaknesses": "", "skill_gaps": "",
            "top_skills": [], "extracted_skills": [], "extracted_projects": [],
            "extracted_education": "", "extracted_certifications": "",
        }


async def generate_voice_questions(
    job_title: str,
    job_description: str,
    job_requirements: str,
    resume_text: Optional[str] = None
) -> List[str]:
    resume_section = f"""
CANDIDATE RESUME:
{resume_text}

Generate questions specifically based on this candidate's resume — ask about their actual projects,
skills, technologies, and experiences listed above. Do NOT ask generic questions.
""" if resume_text else ""

    prompt = f"""
You are an expert interviewer.

Generate 6 unique, specific voice interview questions for this candidate applying to the role below.
Each question must be different — no duplicate or similar questions.

JOB TITLE:
{job_title}

JOB DESCRIPTION:
{job_description}

JOB REQUIREMENTS:
{job_requirements}
{resume_section}
Return ONLY valid JSON in this structure:

{{
    "questions": [
        "Question 1", "Question 2", "Question 3",
        "Question 4", "Question 5", "Question 6"
    ]
}}
"""
    try:
        result = await _generate_json(prompt)
        return result.get("questions", [])
    except Exception:
        logger.exception("Question generation failed")
        return [
            "Tell me about yourself and your background.",
            "Why are you interested in this specific role?",
            "Describe your most relevant technical experience.",
            "Walk me through a challenging project and how you solved it.",
            "What are your key strengths that make you suitable for this position?",
            "Where do you see yourself growing professionally in the next 2 years?",
        ]


async def evaluate_candidate(candidate_data: Dict[str, Any]) -> Dict[str, Any]:
    prompt = f"""
You are an expert recruiter.

Evaluate this candidate.

CANDIDATE DATA:
{json.dumps(candidate_data, indent=2)}

Return ONLY valid JSON:

{{
    "summary": "",
    "strengths": "",
    "weaknesses": "",
    "skill_gaps": "",
    "recommendation": ""
}}
"""
    try:
        return await _generate_json(prompt)
    except Exception:
        return {
            "summary": "Failed to evaluate candidate",
            "strengths": "", "weaknesses": "", "skill_gaps": "",
            "recommendation": "Consider",
        }


async def analyze_voice_answers(
    answers: List[str],
    questions: List[str]
) -> Dict[str, Any]:
    transcript = "\n".join(f"Q: {q}\nA: {a}" for q, a in zip(questions, answers))

    prompt = f"""
You are an interview assessment specialist.

Analyze the following interview responses.

INTERVIEW TRANSCRIPT:
{transcript}

Return ONLY valid JSON:

{{
    "communication_score": 0,
    "confidence_score": 0,
    "recommendation": "",
    "analysis": ""
}}
"""
    try:
        return await _generate_json(prompt)
    except Exception:
        return {
            "communication_score": 50,
            "confidence_score": 50,
            "recommendation": "Consider",
            "analysis": "Failed to analyze answers",
        }


async def chat_with_recruiter(
    message: str,
    candidates_data: Optional[List[Dict[str, Any]]] = None
) -> Dict[str, str]:
    context = ""
    if candidates_data:
        context = f"\nCANDIDATES DATA:\n{json.dumps(candidates_data, indent=2)}\n"

    prompt = f"""
You are FutureHR AI Recruitment Assistant.

Your responsibilities:
- Candidate evaluation
- Resume screening
- Hiring recommendations
- Recruitment analytics
- Skill gap analysis
- Interview feedback

{context}

Recruiter Query:
{message}

Provide a clear professional response.
"""
    try:
        response = await _generate_text(prompt)
        return {"response": response}
    except Exception as e:
        return {"response": f"Unable to process request: {e}"}
