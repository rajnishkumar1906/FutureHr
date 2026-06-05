from fastapi import APIRouter, HTTPException, status, UploadFile, File
from typing import List
from ..database import get_db_connection
from ..schemas.schemas import (
    CandidateCreate, CandidateResponse,
    JobDescriptionCreate, JobDescriptionResponse,
    ResumeScreeningResponse,
    CandidateEvaluationResponse,
    VoiceScreeningResponse,
    ChatRequest
)
from ..utils.ai_service import analyze_resume, evaluate_candidate, analyze_voice_transcription, chat_with_recruiter

router = APIRouter(prefix="/api/ai-recruitment", tags=["ai-recruitment"])

# Candidate Routes
@router.post("/candidates", response_model=CandidateResponse, status_code=status.HTTP_201_CREATED)
async def create_candidate(candidate: CandidateCreate):
    conn = await get_db_connection()
    
    new_candidate = await conn.fetchrow(
        """
        INSERT INTO candidates (first_name, last_name, email, phone, resume_text, skills, education, experience, certifications, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id, first_name, last_name, email, phone, resume_text, skills, education, experience, certifications, status, created_at
        """,
        candidate.first_name, candidate.last_name, candidate.email, candidate.phone,
        candidate.resume_text, candidate.skills, candidate.education, candidate.experience,
        candidate.certifications, candidate.status
    )
    
    await conn.close()
    
    return dict(new_candidate)

@router.get("/candidates", response_model=List[CandidateResponse])
async def get_candidates():
    conn = await get_db_connection()
    
    candidates = await conn.fetch("SELECT * FROM candidates")
    
    await conn.close()
    return [dict(c) for c in candidates]

# Job Description Routes
@router.post("/job-descriptions", response_model=JobDescriptionResponse, status_code=status.HTTP_201_CREATED)
async def create_job_description(job: JobDescriptionCreate):
    conn = await get_db_connection()
    
    new_job = await conn.fetchrow(
        """
        INSERT INTO job_descriptions (title, description, required_skills, required_experience)
        VALUES ($1, $2, $3, $4)
        RETURNING id, title, description, required_skills, required_experience, created_at
        """,
        job.title, job.description, job.required_skills, job.required_experience
    )
    
    await conn.close()
    
    return dict(new_job)

@router.get("/job-descriptions", response_model=List[JobDescriptionResponse])
async def get_job_descriptions():
    conn = await get_db_connection()
    
    jobs = await conn.fetch("SELECT * FROM job_descriptions")
    
    await conn.close()
    return [dict(j) for j in jobs]

# Resume Screening Routes
@router.post("/resume-screening/{candidate_id}/{job_id}", response_model=ResumeScreeningResponse)
async def screen_resume(candidate_id: int, job_id: int):
    conn = await get_db_connection()
    
    candidate = await conn.fetchrow("SELECT * FROM candidates WHERE id = $1", candidate_id)
    if not candidate:
        await conn.close()
        raise HTTPException(status_code=404, detail="Candidate not found")
    
    job = await conn.fetchrow("SELECT * FROM job_descriptions WHERE id = $1", job_id)
    if not job:
        await conn.close()
        raise HTTPException(status_code=404, detail="Job description not found")
    
    # Use AI to analyze resume
    ai_result = analyze_resume(
        candidate["resume_text"] or "",
        job["description"],
        job["required_skills"],
        job["required_experience"]
    )
    
    # Update candidate with extracted info if available
    await conn.execute(
        """
        UPDATE candidates
        SET skills = $1, education = $2, experience = $3, certifications = $4
        WHERE id = $5
        """,
        ai_result.get("extracted_skills", candidate["skills"]),
        ai_result.get("extracted_education", candidate["education"]),
        ai_result.get("extracted_experience", candidate["experience"]),
        ai_result.get("extracted_certifications", candidate["certifications"]),
        candidate_id
    )
    
    # Save screening result
    screening = await conn.fetchrow(
        """
        INSERT INTO resume_screenings (candidate_id, job_description_id, candidate_score, skills_match, experience_match, recommendation, analysis)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id, candidate_id, job_description_id, candidate_score, skills_match, experience_match, recommendation, analysis, created_at
        """,
        candidate_id, job_id,
        ai_result["candidate_score"],
        ai_result["skills_match"],
        ai_result["experience_match"],
        ai_result["recommendation"],
        ai_result["analysis"]
    )
    
    await conn.close()
    
    return dict(screening)

@router.get("/resume-screenings", response_model=List[ResumeScreeningResponse])
async def get_resume_screenings():
    conn = await get_db_connection()
    
    screenings = await conn.fetch("SELECT * FROM resume_screenings")
    
    await conn.close()
    return [dict(s) for s in screenings]

# Candidate Evaluation Routes
@router.post("/candidate-evaluation/{candidate_id}", response_model=CandidateEvaluationResponse)
async def evaluate_candidate_route(candidate_id: int):
    conn = await get_db_connection()
    
    candidate = await conn.fetchrow("SELECT * FROM candidates WHERE id = $1", candidate_id)
    if not candidate:
        await conn.close()
        raise HTTPException(status_code=404, detail="Candidate not found")
    
    ai_result = evaluate_candidate(candidate)
    
    evaluation = await conn.fetchrow(
        """
        INSERT INTO candidate_evaluations (candidate_id, summary, strengths, weaknesses, skill_gaps, recommendation)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, candidate_id, summary, strengths, weaknesses, skill_gaps, recommendation, created_at
        """,
        candidate_id,
        ai_result["summary"],
        ai_result["strengths"],
        ai_result["weaknesses"],
        ai_result["skill_gaps"],
        ai_result["recommendation"]
    )
    
    await conn.close()
    
    return dict(evaluation)

@router.get("/candidate-evaluations", response_model=List[CandidateEvaluationResponse])
async def get_candidate_evaluations():
    conn = await get_db_connection()
    
    evaluations = await conn.fetch("SELECT * FROM candidate_evaluations")
    
    await conn.close()
    return [dict(e) for e in evaluations]

# Voice Screening Routes
@router.post("/voice-screening/{candidate_id}", response_model=VoiceScreeningResponse)
async def screen_voice(candidate_id: int, transcription: str):
    conn = await get_db_connection()
    
    candidate = await conn.fetchrow("SELECT * FROM candidates WHERE id = $1", candidate_id)
    if not candidate:
        await conn.close()
        raise HTTPException(status_code=404, detail="Candidate not found")
    
    ai_result = analyze_voice_transcription(transcription)
    
    screening = await conn.fetchrow(
        """
        INSERT INTO voice_screenings (candidate_id, transcription, communication_score, confidence_score, recommendation, analysis)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, candidate_id, transcription, communication_score, confidence_score, recommendation, analysis, created_at
        """,
        candidate_id, transcription,
        ai_result["communication_score"],
        ai_result["confidence_score"],
        ai_result["recommendation"],
        ai_result["analysis"]
    )
    
    await conn.close()
    
    return dict(screening)

@router.get("/voice-screenings", response_model=List[VoiceScreeningResponse])
async def get_voice_screenings():
    conn = await get_db_connection()
    
    screenings = await conn.fetch("SELECT * FROM voice_screenings")
    
    await conn.close()
    return [dict(s) for s in screenings]

# AI Chat Route
@router.post("/chat")
async def chat_route(request: ChatRequest):
    candidates_data = []
    if request.candidate_ids:
        conn = await get_db_connection()
        for cid in request.candidate_ids:
            cand = await conn.fetchrow("SELECT * FROM candidates WHERE id = $1", cid)
            if cand:
                candidates_data.append(dict(cand))
        await conn.close()
    
    return chat_with_recruiter(request.message, candidates_data)
