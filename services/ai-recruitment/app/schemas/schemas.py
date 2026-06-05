from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List

class CandidateBase(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone: str
    resume_text: Optional[str] = None
    skills: Optional[str] = None
    education: Optional[str] = None
    experience: Optional[str] = None
    certifications: Optional[str] = None
    status: str = "Pending"

class CandidateCreate(CandidateBase):
    pass

class CandidateResponse(CandidateBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

class JobDescriptionBase(BaseModel):
    title: str
    description: str
    required_skills: str
    required_experience: int

class JobDescriptionCreate(JobDescriptionBase):
    pass

class JobDescriptionResponse(JobDescriptionBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

class ResumeScreeningResponse(BaseModel):
    id: int
    candidate_id: int
    job_description_id: int
    candidate_score: float
    skills_match: float
    experience_match: float
    recommendation: str
    analysis: str
    created_at: datetime
    class Config:
        from_attributes = True

class CandidateEvaluationResponse(BaseModel):
    id: int
    candidate_id: int
    summary: str
    strengths: str
    weaknesses: str
    skill_gaps: str
    recommendation: str
    created_at: datetime
    class Config:
        from_attributes = True

class VoiceScreeningResponse(BaseModel):
    id: int
    candidate_id: int
    transcription: str
    communication_score: float
    confidence_score: float
    recommendation: str
    analysis: str
    created_at: datetime
    class Config:
        from_attributes = True

class ChatRequest(BaseModel):
    message: str
    candidate_ids: Optional[List[int]] = None
