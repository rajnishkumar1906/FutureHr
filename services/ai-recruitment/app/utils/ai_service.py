from google import genai
from ..config import settings
import json
import logging
from typing import Dict, Any, List, Optional

logger = logging.getLogger(__name__)

MODEL_NAME = "gemini-2.0-flash"

client = genai.Client(
    api_key=settings.GEMINI_API_KEY
)


def _generate_json(prompt: str) -> Dict[str, Any]:
    """
    Generate structured JSON response from Gemini.
    """
    try:
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt,
            config={
                "response_mime_type": "application/json"
            }
        )

        if not response.text:
            raise ValueError("Empty response from Gemini")

        return json.loads(response.text)

    except Exception as e:
        logger.exception("Gemini JSON generation failed")
        raise Exception(f"AI generation failed: {str(e)}")


def _generate_text(prompt: str) -> str:
    """
    Generate plain text response from Gemini.
    """
    try:
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt
        )

        return response.text or ""

    except Exception as e:
        logger.exception("Gemini text generation failed")
        raise Exception(f"AI generation failed: {str(e)}")


def analyze_resume(
    resume_text: str,
    job_description: str,
    required_skills: str,
    required_experience: int
) -> Dict[str, Any]:

    prompt = f"""
You are an expert AI recruiter.

Analyze the resume against the job requirements.

RESUME:
{resume_text}

JOB DESCRIPTION:
{job_description}

REQUIRED SKILLS:
{required_skills}

REQUIRED EXPERIENCE:
{required_experience} years

Return ONLY valid JSON in this exact structure:

{{
    "candidate_score": 0,
    "skills_match": 0,
    "experience_match": 0,
    "recommendation": "",
    "analysis": "",
    "extracted_skills": "",
    "extracted_education": "",
    "extracted_experience": "",
    "extracted_certifications": ""
}}
"""

    try:
        return _generate_json(prompt)

    except Exception:
        return {
            "candidate_score": 0,
            "skills_match": 0,
            "experience_match": 0,
            "recommendation": "Reject",
            "analysis": "Failed to analyze resume",
            "extracted_skills": "",
            "extracted_education": "",
            "extracted_experience": "",
            "extracted_certifications": ""
        }


def evaluate_candidate(candidate_data: Dict[str, Any]) -> Dict[str, Any]:

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
        return _generate_json(prompt)

    except Exception:
        return {
            "summary": "Failed to evaluate candidate",
            "strengths": "",
            "weaknesses": "",
            "skill_gaps": "",
            "recommendation": "Consider"
        }


def analyze_voice_transcription(
    transcription: str
) -> Dict[str, Any]:

    prompt = f"""
You are an interview assessment specialist.

Analyze the following interview transcription.

TRANSCRIPTION:
{transcription}

Return ONLY valid JSON:

{{
    "communication_score": 0,
    "confidence_score": 0,
    "recommendation": "",
    "analysis": ""
}}
"""

    try:
        return _generate_json(prompt)

    except Exception:
        return {
            "communication_score": 50,
            "confidence_score": 50,
            "recommendation": "Consider",
            "analysis": "Failed to analyze transcription"
        }


def chat_with_recruiter(
    message: str,
    candidates_data: Optional[List[Dict[str, Any]]] = None
) -> Dict[str, str]:

    context = ""

    if candidates_data:
        context = f"""
CANDIDATES DATA:
{json.dumps(candidates_data, indent=2)}
"""

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
        response = _generate_text(prompt)

        return {
            "response": response
        }

    except Exception as e:
        return {
            "response": f"Unable to process request: {str(e)}"
        }