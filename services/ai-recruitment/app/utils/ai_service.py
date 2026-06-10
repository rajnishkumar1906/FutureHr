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
            return "".join(page.extract_text() or "" for page in reader.pages)
        except Exception:
            return ""
    return await asyncio.to_thread(_extract)


async def analyze_resume(
    resume_text: str,
    job_title: str,
    job_description: str,
    job_requirements: str
) -> Dict[str, Any]:
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

Return ONLY valid JSON in this exact structure (no markdown, no extra text):

{{
    "overall_score": <0-100 integer — holistic fit of this candidate for this specific role>,
    "skills_match": <0-100 integer — how well candidate's skills match the job requirements>,
    "experience_match": <0-100 integer — how well candidate's experience/projects match the role>,
    "recommendation": "<one of: Strong Hire | Hire | Consider | Reject>",
    "candidate_name": "Full name from the top of the resume",
    "candidate_email": "email extracted from resume or empty string",
    "analysis": "One concise sentence explaining the match or mismatch.",
    "summary": "2-3 sentences covering the candidate's background and overall fit for this role.",
    "strengths": "comma-separated list of 3-5 strengths relevant to this role",
    "weaknesses": "comma-separated list of 2-3 weaknesses or missing areas",
    "skill_gaps": "comma-separated list of required skills clearly absent from the resume",
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
        {{"name": "Project Name", "description": "One-liner: what it does and key tech used"}},
        {{"name": "Project Name 2", "description": "One-liner: what it does and key tech used"}}
    ],
    "extracted_education": "Degree, Institution, Year",
    "extracted_certifications": "certifications or empty string"
}}

Scoring guidance:
- 80-100: Strong match — most required skills present, relevant experience
- 60-79: Good match — core skills present, minor gaps
- 40-59: Partial match — some relevant skills, notable gaps
- 0-39: Poor match — significant skill or experience mismatch
"""

    try:
        ai_result = await _generate_json(prompt)

        overall_score   = float(ai_result.get("overall_score", 50))
        skills_match    = float(ai_result.get("skills_match", 50))
        experience_match = float(ai_result.get("experience_match", 50))
        recommendation  = ai_result.get("recommendation", "Consider")

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
        logger.exception("Error processing resume with AI")
        return {
            "candidate_score": 50, "skills_match": 50, "experience_match": 50,
            "overall_score": 50,
            "candidate_name": "", "candidate_email": "",
            "recommendation": "Consider",
            "analysis": "AI analysis unavailable — please review the resume manually.",
            "summary": "", "strengths": "", "weaknesses": "", "skill_gaps": "",
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
