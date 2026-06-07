from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List, Dict, Any

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
    status: str = "Applied"

class CandidateCreate(CandidateBase):
    pass

class CandidateResponse(CandidateBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

class JobBase(BaseModel):
    title: str
    department: str
    location: str
    type: str
    experience: Optional[str] = None
    salary_range: Optional[str] = None
    description: Optional[str] = None
    requirements: Optional[str] = None
    status: str = "Open"
    positions: Optional[int] = 1

class JobCreate(JobBase):
    pass

class JobUpdate(JobBase):
    pass

class JobResponse(JobBase):
    id: int
    posted_date: Optional[datetime] = None
    applicants: Optional[int] = 0
    positions: Optional[int] = 1
    class Config:
        from_attributes = True

class ApplicationBase(BaseModel):
    candidate_id: int
    job_id: int
    application_form_data: Optional[Dict[str, Any]] = None

class ApplicationCreate(ApplicationBase):
    pass

class ApplicationResponse(ApplicationBase):
    id: int
    status: str
    voice_screening_code: Optional[str] = None
    created_at: datetime
    class Config:
        from_attributes = True

class ResumeScreeningResponse(BaseModel):
    id: int
    application_id: int
    candidate_id: int
    job_id: int
    candidate_score: float
    skills_match: float
    experience_match: float
    overall_score: float
    recommendation: str
    analysis: str
    summary: Optional[str] = None
    strengths: Optional[str] = None
    weaknesses: Optional[str] = None
    skill_gaps: Optional[str] = None
    extracted_skills: Optional[List[Any]] = None
    extracted_projects: Optional[List[Any]] = None
    top_skills: Optional[List[Any]] = None
    candidate_name: Optional[str] = None
    candidate_email: Optional[str] = None
    job_title: Optional[str] = None
    created_at: datetime
    class Config:
        from_attributes = True

class CandidateEvaluationResponse(BaseModel):
    id: int
    application_id: int
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
    application_id: int
    candidate_id: int
    communication_score: float
    confidence_score: float
    recommendation: str
    analysis: str
    candidate_name: Optional[str] = None
    position: Optional[str] = None
    created_at: datetime
    class Config:
        from_attributes = True

class VoiceQuestionsResponse(BaseModel):
    questions: List[str]

class SubmitVoiceAnswersRequest(BaseModel):
    answers: List[str]

class UpdateApplicationStatusRequest(BaseModel):
    status: str

class ChatRequest(BaseModel):
    message: str
    candidate_ids: Optional[List[int]] = None
