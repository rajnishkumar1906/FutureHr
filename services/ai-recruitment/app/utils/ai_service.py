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
    # Calculate scores using TextMatcher
    job_text = f"{job_title}\n{job_description}\n{job_requirements}"
    
    # Overall match between resume and job
    overall_score = text_matcher.similarity(resume_text, job_text) * 100
    
    # Skills match: focus on job requirements
    skills_match = text_matcher.similarity(resume_text, job_requirements) * 100
    
    # Experience match: focus on job description
    experience_match = text_matcher.similarity(resume_text, job_description) * 100
    
    # Determine recommendation based on overall score
    if overall_score >= 80:
        recommendation = "Strong Hire"
    elif overall_score >= 60:
        recommendation = "Hire"
    elif overall_score >= 40:
        recommendation = "Consider"
    else:
        recommendation = "Reject"

    prompt = f"""
You are an expert AI recruiter performing a detailed resume analysis.

Analyze the resume and extract key information (but do NOT calculate scores - scores have already been calculated).

RESUME:
{resume_text}

JOB TITLE:
{job_title}

JOB DESCRIPTION:
{job_description}

JOB REQUIREMENTS:
{job_requirements}

Return ONLY valid JSON in this exact structure:

{{
    "candidate_name": "Full Name extracted from the very top of the resume",
    "candidate_email": "email@example.com extracted from resume (empty string if not found)",
    "analysis": "brief AI analysis sentence explaining the candidate fit",
    "summary": "2-3 sentence candidate summary covering background and fit",
    "strengths": "comma-separated list of candidate strengths relevant to the role",
    "weaknesses": "comma-separated list of candidate weaknesses",
    "skill_gaps": "comma-separated list of required skills missing from resume",
    "top_skills": [
        {{"name": "Skill Name", "score": 85}},
        {{"name": "Skill Name", "score": 72}},
        {{"name": "Skill Name", "score": 65}},
        {{"name": "Skill Name", "score": 58}},
        {{"name": "Skill Name", "score": 45}}
    ],
    "extracted_skills": ["skill1", "skill2", "skill3", "skill4", "skill5", "skill6"],
    "extracted_projects": [
        {{"name": "Project Name", "description": "one-line: what it does and key tech used"}},
        {{"name": "Project Name 2", "description": "one-line: what it does and key tech used"}}
    ],
    "extracted_education": "Degree, Institution, Year",
    "extracted_certifications": "certifications or empty string"
}}
"""

    try:
        ai_result = await _generate_json(prompt)

        extracted_skills = ai_result.get("extracted_skills", [])
        extracted_projects = ai_result.get("extracted_projects", [])
        top_skills = ai_result.get("top_skills", [])

        if isinstance(extracted_skills, str):
            extracted_skills = [s.strip() for s in extracted_skills.split(",") if s.strip()]
        if not isinstance(extracted_projects, list):
            extracted_projects = []
        if not isinstance(top_skills, list):
            top_skills = []

        return {
            "candidate_score": overall_score,
            "skills_match": skills_match,
            "experience_match": experience_match,
            "overall_score": overall_score,
            "candidate_name": ai_result.get("candidate_name", ""),
            "candidate_email": ai_result.get("candidate_email", ""),
            "recommendation": recommendation,
            "analysis": ai_result.get("analysis", ""),
            "summary": ai_result.get("summary", ""),
            "strengths": ai_result.get("strengths", ""),
            "weaknesses": ai_result.get("weaknesses", ""),
            "skill_gaps": ai_result.get("skill_gaps", ""),
            "top_skills": top_skills,
            "extracted_skills": extracted_skills,
            "extracted_projects": extracted_projects,
            "extracted_education": ai_result.get("extracted_education", ""),
            "extracted_certifications": ai_result.get("extracted_certifications", ""),
        }

    except Exception as e:
        logger.exception("Error processing resume with AI")
        return {
            "candidate_score": overall_score,
            "skills_match": skills_match,
            "experience_match": experience_match,
            "overall_score": overall_score,
            "candidate_name": "",
            "candidate_email": "",
            "recommendation": recommendation,
            "analysis": "Resume analyzed using TF-IDF and cosine similarity",
            "summary": "", "strengths": "", "weaknesses": "", "skill_gaps": "",
            "top_skills": [],
            "extracted_skills": [], "extracted_projects": [],
            "extracted_education": "", "extracted_certifications": "",
        }


async def generate_voice_questions(
    job_title: str,
    job_description: str,
    job_requirements: str
) -> List[str]:
    prompt = f"""
You are an expert interviewer.

Generate 10 relevant voice screening questions for this job.

JOB TITLE:
{job_title}

JOB DESCRIPTION:
{job_description}

JOB REQUIREMENTS:
{job_requirements}

Return ONLY valid JSON in this structure:

{{
    "questions": [
        "Question 1", "Question 2", "Question 3", "Question 4", "Question 5",
        "Question 6", "Question 7", "Question 8", "Question 9", "Question 10"
    ]
}}
"""
    try:
        result = await _generate_json(prompt)
        return result.get("questions", [])
    except Exception:
        logger.exception("Question generation failed")
        return [
            "Tell me about yourself.",
            "Why are you interested in this role?",
            "What relevant experience do you have?",
            "What are your greatest strengths?",
            "What are your areas for improvement?",
            "Where do you see yourself in 5 years?",
            "Why should we hire you?",
            "Describe a challenging project you worked on.",
            "How do you handle pressure?",
            "Do you have any questions for us?",
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
