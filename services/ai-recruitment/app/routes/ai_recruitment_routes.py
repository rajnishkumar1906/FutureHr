from fastapi import APIRouter, HTTPException, status, UploadFile, File, Form, BackgroundTasks, Request
from typing import List, Optional
from ..database import get_db_connection
from ..schemas.schemas import (
    CandidateCreate, CandidateResponse,
    JobCreate, JobUpdate, JobResponse,
    ApplicationCreate, ApplicationResponse,
    ResumeScreeningResponse,
    CandidateEvaluationResponse,
    VoiceScreeningResponse,
    VoiceQuestionsResponse,
    SubmitVoiceAnswersRequest,
    UpdateApplicationStatusRequest,
    ChatRequest
)
from ..utils.ai_service import (
    extract_text_from_pdf,
    analyze_resume,
    evaluate_candidate,
    analyze_voice_answers,
    generate_voice_questions,
    chat_with_recruiter
)
from ..config import settings
import json
import secrets
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

router = APIRouter(prefix="/api/ai-recruitment", tags=["ai-recruitment"])


def _parse_json_field(value, default):
    if value is None:
        return default
    if isinstance(value, (list, dict)):
        return value
    try:
        return json.loads(value)
    except (json.JSONDecodeError, TypeError):
        return default


# ==================== Candidate Routes ====================
@router.post("/candidates", response_model=CandidateResponse, status_code=status.HTTP_201_CREATED)
async def create_candidate(candidate: CandidateCreate):
    conn = await get_db_connection()
    try:
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
        
        return dict(new_candidate)
    finally:
        await conn.close()


@router.get("/candidates", response_model=List[CandidateResponse])
async def get_candidates():
    conn = await get_db_connection()
    try:
        candidates = await conn.fetch("SELECT * FROM candidates")
        return [dict(c) for c in candidates]
    finally:
        await conn.close()


@router.get("/candidates/{candidate_id}", response_model=CandidateResponse)
async def get_candidate(candidate_id: int):
    conn = await get_db_connection()
    try:
        candidate = await conn.fetchrow("SELECT * FROM candidates WHERE id = $1", candidate_id)
        if not candidate:
            raise HTTPException(status_code=404, detail="Candidate not found")
        
        return dict(candidate)
    finally:
        await conn.close()


# ==================== Job Routes ====================
@router.post("/jobs", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
async def create_job(job: JobCreate):
    conn = await get_db_connection()
    try:
        new_job = await conn.fetchrow(
            """
            INSERT INTO jobs (title, department, location, type, experience, salary_range, description, requirements, status, positions)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING id, title, department, location, type, experience, salary_range, description, requirements, status, posted_date, applicants, positions
            """,
            job.title, job.department, job.location, job.type,
            job.experience, job.salary_range, job.description,
            job.requirements, job.status, job.positions or 1
        )
        
        # Generate voice questions for this new job
        questions = await generate_voice_questions(job.title, job.description or "", job.requirements or "")
        await conn.execute(
            """
            INSERT INTO voice_questions (job_id, questions)
            VALUES ($1, $2)
            """,
            new_job["id"], json.dumps(questions)
        )
        
        return dict(new_job)
    finally:
        await conn.close()


@router.get("/jobs", response_model=List[JobResponse])
async def get_jobs():
    conn = await get_db_connection()
    try:
        jobs = await conn.fetch("SELECT * FROM jobs")
        return [dict(j) for j in jobs]
    finally:
        await conn.close()


@router.get("/jobs/{job_id}", response_model=JobResponse)
async def get_job(job_id: int):
    conn = await get_db_connection()
    try:
        job = await conn.fetchrow("SELECT * FROM jobs WHERE id = $1", job_id)
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        
        return dict(job)
    finally:
        await conn.close()


@router.put("/jobs/{job_id}", response_model=JobResponse)
async def update_job(job_id: int, job: JobUpdate):
    conn = await get_db_connection()
    try:
        updated_job = await conn.fetchrow(
            """
            UPDATE jobs
            SET title = $1, department = $2, location = $3, type = $4, experience = $5, salary_range = $6, description = $7, requirements = $8, status = $9, positions = $10
            WHERE id = $11
            RETURNING id, title, department, location, type, experience, salary_range, description, requirements, status, posted_date, applicants, positions
            """,
            job.title, job.department, job.location, job.type,
            job.experience, job.salary_range, job.description,
            job.requirements, job.status, job.positions or 1, job_id
        )
        
        if not updated_job:
            raise HTTPException(status_code=404, detail="Job not found")
        
        # Regenerate voice questions for updated job
        questions = await generate_voice_questions(job.title, job.description or "", job.requirements or "")
        
        # Check if voice questions exist for this job, if not insert
        existing_questions = await conn.fetchrow("SELECT id FROM voice_questions WHERE job_id = $1", job_id)
        if existing_questions:
            await conn.execute(
                """
                UPDATE voice_questions
                SET questions = $1
                WHERE job_id = $2
                """,
                json.dumps(questions), job_id
            )
        else:
            await conn.execute(
                """
                INSERT INTO voice_questions (job_id, questions)
                VALUES ($1, $2)
                """,
                job_id, json.dumps(questions)
            )
        
        return dict(updated_job)
    finally:
        await conn.close()


@router.delete("/jobs/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_job(job_id: int):
    conn = await get_db_connection()
    try:
        result = await conn.execute("DELETE FROM jobs WHERE id = $1", job_id)
        
        if result == "DELETE 0":
            raise HTTPException(status_code=404, detail="Job not found")
    finally:
        await conn.close()


# ==================== Voice Questions Routes ====================
@router.get("/jobs/{job_id}/voice-questions", response_model=VoiceQuestionsResponse)
async def get_voice_questions(job_id: int):
    conn = await get_db_connection()
    try:
        voice_q = await conn.fetchrow("SELECT * FROM voice_questions WHERE job_id = $1", job_id)
        
        if not voice_q:
            raise HTTPException(status_code=404, detail="Voice questions not found")
        
        return VoiceQuestionsResponse(questions=json.loads(voice_q["questions"]))
    finally:
        await conn.close()


# ==================== Application Routes ====================
@router.post("/applications", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
async def submit_application(
    background_tasks: BackgroundTasks,
    first_name: str = Form(...),
    last_name: str = Form(...),
    email: str = Form(...),
    phone: str = Form(...),
    job_id: int = Form(...),
    resume: UploadFile = File(None),
    additional_info: Optional[str] = Form(None)
):
    conn = await get_db_connection()
    try:
        # First, check if candidate exists
        existing_candidate = await conn.fetchrow("SELECT * FROM candidates WHERE email = $1", email)
        
        candidate_id = None
        if existing_candidate:
            candidate_id = existing_candidate["id"]
            
            # Check if candidate has already applied for this job
            existing_application = await conn.fetchrow(
                "SELECT * FROM applications WHERE candidate_id = $1 AND job_id = $2",
                candidate_id, job_id
            )
            if existing_application:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="You have already applied for this job!"
                )
        else:
            # Create new candidate
            new_candidate = await conn.fetchrow(
                """
                INSERT INTO candidates (first_name, last_name, email, phone, status)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING id
                """,
                first_name, last_name, email, phone, "Applied"
            )
            candidate_id = new_candidate["id"]
        
        # Extract text from resume if provided
        resume_text = ""
        if resume:
            pdf_bytes = await resume.read()
            resume_text = await extract_text_from_pdf(pdf_bytes)
        
        # Update candidate with resume text
        if resume_text:
            await conn.execute(
                "UPDATE candidates SET resume_text = $1 WHERE id = $2",
                resume_text, candidate_id
            )
        
        # Create application
        application_form_data = {}
        if additional_info:
            try:
                application_form_data = json.loads(additional_info)
            except json.JSONDecodeError:
                application_form_data = {"additional_info": additional_info}
        
        new_application = await conn.fetchrow(
            """
            INSERT INTO applications (candidate_id, job_id, application_form_data, status)
            VALUES ($1, $2, $3, $4)
            RETURNING id, candidate_id, job_id, application_form_data, status, created_at
            """,
            candidate_id, job_id, json.dumps(application_form_data), "Applied"
        )
        
        # Convert application_form_data from string to dict
        app_dict = dict(new_application)
        if isinstance(app_dict["application_form_data"], str):
            try:
                app_dict["application_form_data"] = json.loads(app_dict["application_form_data"])
            except json.JSONDecodeError:
                app_dict["application_form_data"] = {}
        
        # Update job's applicant count
        await conn.execute("UPDATE jobs SET applicants = applicants + 1 WHERE id = $1", job_id)
        
        # Auto-run resume screening in background
        background_tasks.add_task(screen_resume_async, new_application["id"])
        
        return app_dict
    finally:
        await conn.close()


@router.get("/applications")
async def get_applications(job_id: Optional[int] = None, email: Optional[str] = None):
    conn = await get_db_connection()
    try:
        if email:
            # Get candidate by email first
            candidate = await conn.fetchrow("SELECT * FROM candidates WHERE email = $1", email)
            if not candidate:
                return []
            # Get applications for that candidate
            applications = await conn.fetch("SELECT * FROM applications WHERE candidate_id = $1", candidate["id"])
        elif job_id:
            applications = await conn.fetch("SELECT * FROM applications WHERE job_id = $1", job_id)
        else:
            applications = await conn.fetch("SELECT * FROM applications")
        
        # Convert application_form_data from string to dict for all apps
        result = []
        for app in applications:
            app_dict = dict(app)
            if isinstance(app_dict["application_form_data"], str):
                try:
                    app_dict["application_form_data"] = json.loads(app_dict["application_form_data"])
                except json.JSONDecodeError:
                    app_dict["application_form_data"] = {}
            # Get job details
            job = await conn.fetchrow("SELECT * FROM jobs WHERE id = $1", app_dict["job_id"])
            if job:
                app_dict["job"] = dict(job)
            result.append(app_dict)
        
        return result
    finally:
        await conn.close()


@router.get("/applications/{application_id}", response_model=ApplicationResponse)
async def get_application(application_id: int):
    conn = await get_db_connection()
    try:
        application = await conn.fetchrow("SELECT * FROM applications WHERE id = $1", application_id)
        if not application:
            raise HTTPException(status_code=404, detail="Application not found")
        
        app_dict = dict(application)
        if isinstance(app_dict["application_form_data"], str):
            try:
                app_dict["application_form_data"] = json.loads(app_dict["application_form_data"])
            except json.JSONDecodeError:
                app_dict["application_form_data"] = {}
        
        return app_dict
    finally:
        await conn.close()


@router.delete("/applications/{application_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_application(application_id: int, background_tasks: BackgroundTasks):
    conn = await get_db_connection()
    try:
        # Fetch application + candidate + job info BEFORE deleting (for notification email)
        row = await conn.fetchrow("""
            SELECT a.id, a.candidate_id, a.job_id,
                   c.first_name, c.last_name, c.email AS candidate_email,
                   j.title AS job_title
            FROM applications a
            LEFT JOIN candidates c ON c.id = a.candidate_id
            LEFT JOIN jobs j ON j.id = a.job_id
            WHERE a.id = $1
        """, application_id)
        if not row:
            raise HTTPException(status_code=404, detail="Application not found")

        app_data = dict(row)

        # Delete related records first (cascade manually)
        await conn.execute("DELETE FROM resume_screenings WHERE application_id = $1", application_id)
        await conn.execute("DELETE FROM voice_answers WHERE application_id = $1", application_id)
        await conn.execute("DELETE FROM voice_screenings WHERE application_id = $1", application_id)
        await conn.execute("DELETE FROM candidate_evaluations WHERE application_id = $1", application_id)
        await conn.execute("DELETE FROM applications WHERE id = $1", application_id)

        # Send rejection notification email in background
        cfg = await _get_email_config(conn)
        smtp_user     = cfg.get("smtp_user")     or settings.SMTP_USER
        smtp_password = cfg.get("smtp_password") or settings.SMTP_PASSWORD
        smtp_host     = cfg.get("smtp_host")     or settings.SMTP_HOST
        smtp_port     = int(cfg.get("smtp_port") or settings.SMTP_PORT)
        smtp_from     = cfg.get("smtp_from")     or settings.SMTP_FROM or smtp_user

        if smtp_user and smtp_password and app_data.get("candidate_email"):
            background_tasks.add_task(
                _send_smtp_email,
                smtp_host, smtp_port, smtp_user, smtp_password, smtp_from,
                app_data["candidate_email"],
                f"Your Application — {app_data.get('job_title', 'Position')}",
                _application_withdrawn_body(
                    app_data.get("first_name", "Candidate"),
                    app_data.get("job_title", "the position"),
                )
            )
    finally:
        await conn.close()


@router.put("/applications/{application_id}/status", response_model=ApplicationResponse)
async def update_application_status(application_id: int, request: UpdateApplicationStatusRequest):
    conn = await get_db_connection()
    try:
        updated_application = await conn.fetchrow(
            """
            UPDATE applications
            SET status = $1
            WHERE id = $2
            RETURNING id, candidate_id, job_id, application_form_data, status, created_at
            """,
            request.status, application_id
        )
        
        if not updated_application:
            raise HTTPException(status_code=404, detail="Application not found")
        
        app_dict = dict(updated_application)
        if isinstance(app_dict["application_form_data"], str):
            try:
                app_dict["application_form_data"] = json.loads(app_dict["application_form_data"])
            except json.JSONDecodeError:
                app_dict["application_form_data"] = {}
        
        return app_dict
    finally:
        await conn.close()


# ==================== Resume Screening Routes ====================
async def screen_resume_async(application_id: int):
    """Helper function to run resume screening in background"""
    try:
        conn = await get_db_connection()
        try:
            application = await conn.fetchrow("SELECT * FROM applications WHERE id = $1", application_id)
            if not application:
                return
            
            candidate = await conn.fetchrow("SELECT * FROM candidates WHERE id = $1", application["candidate_id"])
            if not candidate:
                return
            
            job = await conn.fetchrow("SELECT * FROM jobs WHERE id = $1", application["job_id"])
            if not job:
                return
            
            # Analyze resume
            ai_result = await analyze_resume(
                candidate["resume_text"] or "",
                job["title"],
                job["description"] or "",
                job["requirements"] or ""
            )
            
            # Update candidate with extracted info (skills and projects stored as JSON)
            extracted_skills = ai_result.get("extracted_skills", [])
            extracted_projects = ai_result.get("extracted_projects", [])
            extracted_email = ai_result.get("candidate_email", "")
            await conn.execute(
                """
                UPDATE candidates
                SET skills = $1, education = $2, experience = $3, certifications = $4
                WHERE id = $5
                """,
                json.dumps(extracted_skills) if extracted_skills else candidate["skills"],
                ai_result.get("extracted_education") or candidate["education"],
                json.dumps(extracted_projects) if extracted_projects else candidate["experience"],
                ai_result.get("extracted_certifications") or candidate["certifications"],
                application["candidate_id"]
            )

            # Save screening result with top_skills and candidate_email
            top_skills = ai_result.get("top_skills", [])
            await conn.fetchrow(
                """
                INSERT INTO resume_screenings (application_id, candidate_id, job_id, candidate_score, skills_match, experience_match, overall_score, recommendation, analysis, summary, strengths, weaknesses, skill_gaps, top_skills, candidate_email)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
                RETURNING id
                """,
                application_id,
                application["candidate_id"],
                application["job_id"],
                ai_result["candidate_score"],
                ai_result["skills_match"],
                ai_result["experience_match"],
                ai_result["overall_score"],
                ai_result["recommendation"],
                ai_result["analysis"],
                ai_result["summary"],
                ai_result["strengths"],
                ai_result["weaknesses"],
                ai_result["skill_gaps"],
                json.dumps(top_skills) if top_skills else None,
                extracted_email or None,
            )
            
            # Update application status based on recommendation.
            # AI never auto-rejects — only HR can reject manually.
            # AI only fast-tracks Strong Hire candidates to voice screening.
            new_status = "Resume Screened"
            if ai_result["recommendation"] == "Strong Hire":
                new_status = "Voice Screening Required"
            
            await conn.execute(
                "UPDATE applications SET status = $1 WHERE id = $2",
                new_status, application_id
            )
        finally:
            await conn.close()
    except Exception as e:
        print(f"Error in screen_resume_async: {e}")


@router.get("/applications/{application_id}/resume-screening", response_model=Optional[ResumeScreeningResponse])
async def get_resume_screening(application_id: int):
    conn = await get_db_connection()
    try:
        screening = await conn.fetchrow("""
            SELECT
                rs.*,
                c.first_name || ' ' || c.last_name AS candidate_name,
                c.skills AS extracted_skills_json,
                c.experience AS extracted_projects_json,
                c.resume_text,
                j.title AS job_title
            FROM resume_screenings rs
            LEFT JOIN candidates c ON rs.candidate_id = c.id
            LEFT JOIN jobs j ON rs.job_id = j.id
            WHERE rs.application_id = $1
        """, application_id)
        if not screening:
            return None

        result = dict(screening)
        result["extracted_skills"] = _parse_json_field(result.pop("extracted_skills_json", None), [])
        result["extracted_projects"] = _parse_json_field(result.pop("extracted_projects_json", None), [])
        result["top_skills"] = _parse_json_field(result.get("top_skills"), [])
        return result
    finally:
        await conn.close()


@router.get("/resume-screenings", response_model=List[ResumeScreeningResponse])
async def get_resume_screenings():
    conn = await get_db_connection()
    try:
        screenings = await conn.fetch("""
            SELECT
                rs.*,
                c.first_name || ' ' || c.last_name AS candidate_name,
                c.skills AS extracted_skills_json,
                c.experience AS extracted_projects_json,
                c.resume_text,
                j.title AS job_title
            FROM resume_screenings rs
            LEFT JOIN candidates c ON rs.candidate_id = c.id
            LEFT JOIN jobs j ON rs.job_id = j.id
        """)
        result = []
        for s in screenings:
            row = dict(s)
            row["extracted_skills"] = _parse_json_field(row.pop("extracted_skills_json", None), [])
            row["extracted_projects"] = _parse_json_field(row.pop("extracted_projects_json", None), [])
            row["top_skills"] = _parse_json_field(row.get("top_skills"), [])
            result.append(row)
        return result
    finally:
        await conn.close()


# ==================== Voice Screening Routes ====================
@router.post("/applications/{application_id}/voice-answers", response_model=VoiceScreeningResponse)
async def submit_voice_answers(application_id: int, request: SubmitVoiceAnswersRequest):
    conn = await get_db_connection()
    try:
        # Get application
        application = await conn.fetchrow("SELECT * FROM applications WHERE id = $1", application_id)
        if not application:
            raise HTTPException(status_code=404, detail="Application not found")
        
        # Get voice questions for the job
        voice_q = await conn.fetchrow("SELECT * FROM voice_questions WHERE job_id = $1", application["job_id"])
        if not voice_q:
            raise HTTPException(status_code=404, detail="Voice questions not found")
        
        questions = json.loads(voice_q["questions"])
        
        # Save individual answers
        for i, answer in enumerate(request.answers):
            await conn.execute(
                """
                INSERT INTO voice_answers (application_id, question_index, answer)
                VALUES ($1, $2, $3)
                """,
                application_id, i, answer
            )
        
        # Analyze answers
        ai_result = await analyze_voice_answers(request.answers, questions)
        
        # Save voice screening result
        voice_screening = await conn.fetchrow(
            """
            INSERT INTO voice_screenings (application_id, candidate_id, communication_score, confidence_score, recommendation, analysis)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, application_id, candidate_id, communication_score, confidence_score, recommendation, analysis, created_at
            """,
            application_id,
            application["candidate_id"],
            ai_result["communication_score"],
            ai_result["confidence_score"],
            ai_result["recommendation"],
            ai_result["analysis"]
        )
        
        # AI never auto-rejects after voice screening — HR decides manually.
        new_status = "Voice Screened"
        
        await conn.execute(
            "UPDATE applications SET status = $1 WHERE id = $2",
            new_status, application_id
        )
        
        return dict(voice_screening)
    finally:
        await conn.close()


async def _attach_transcript(conn, screening_dict: dict) -> dict:
    """Fetch Q&A pairs from voice_answers + voice_questions and attach as transcript."""
    app_id = screening_dict.get("application_id")
    if not app_id:
        return screening_dict
    answers = await conn.fetch(
        "SELECT question_index, answer FROM voice_answers WHERE application_id = $1 ORDER BY question_index",
        app_id
    )
    application = await conn.fetchrow("SELECT job_id FROM applications WHERE id = $1", app_id)
    questions_row = None
    if application:
        questions_row = await conn.fetchrow("SELECT questions FROM voice_questions WHERE job_id = $1", application["job_id"])
    questions = json.loads(questions_row["questions"]) if questions_row else []
    transcript = [
        {"question": questions[row["question_index"]] if row["question_index"] < len(questions) else f"Q{row['question_index']+1}",
         "answer": row["answer"]}
        for row in answers
    ]
    screening_dict["transcript"] = transcript
    return screening_dict


@router.get("/applications/{application_id}/voice-screening", response_model=Optional[VoiceScreeningResponse])
async def get_voice_screening(application_id: int):
    conn = await get_db_connection()
    try:
        screening = await conn.fetchrow("SELECT * FROM voice_screenings WHERE application_id = $1", application_id)
        if not screening:
            return None
        result = dict(screening)
        return await _attach_transcript(conn, result)
    finally:
        await conn.close()


@router.get("/voice-screenings", response_model=List[VoiceScreeningResponse])
async def get_voice_screenings():
    conn = await get_db_connection()
    try:
        screenings = await conn.fetch("""
            SELECT
                vs.*,
                c.first_name || ' ' || c.last_name AS candidate_name,
                j.title AS position
            FROM voice_screenings vs
            LEFT JOIN candidates c ON vs.candidate_id = c.id
            LEFT JOIN applications a ON vs.application_id = a.id
            LEFT JOIN jobs j ON a.job_id = j.id
        """)
        result = []
        for s in screenings:
            row = dict(s)
            row = await _attach_transcript(conn, row)
            result.append(row)
        return result
    finally:
        await conn.close()


# ==================== Candidate Evaluation Routes ====================
@router.post("/applications/{application_id}/evaluate", response_model=CandidateEvaluationResponse)
async def evaluate_candidate_route(application_id: int):
    conn = await get_db_connection()
    try:
        application = await conn.fetchrow("SELECT * FROM applications WHERE id = $1", application_id)
        if not application:
            raise HTTPException(status_code=404, detail="Application not found")
        
        candidate = await conn.fetchrow("SELECT * FROM candidates WHERE id = $1", application["candidate_id"])
        if not candidate:
            raise HTTPException(status_code=404, detail="Candidate not found")
        
        ai_result = await evaluate_candidate(dict(candidate))
        
        evaluation = await conn.fetchrow(
            """
            INSERT INTO candidate_evaluations (application_id, candidate_id, summary, strengths, weaknesses, skill_gaps, recommendation)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id, application_id, candidate_id, summary, strengths, weaknesses, skill_gaps, recommendation, created_at
            """,
            application_id,
            application["candidate_id"],
            ai_result["summary"],
            ai_result["strengths"],
            ai_result["weaknesses"],
            ai_result["skill_gaps"],
            ai_result["recommendation"]
        )
        
        return dict(evaluation)
    finally:
        await conn.close()


@router.get("/applications/{application_id}/evaluation", response_model=Optional[CandidateEvaluationResponse])
async def get_candidate_evaluation(application_id: int):
    conn = await get_db_connection()
    try:
        evaluation = await conn.fetchrow("SELECT * FROM candidate_evaluations WHERE application_id = $1", application_id)
        if not evaluation:
            return None
        
        return dict(evaluation)
    finally:
        await conn.close()


@router.get("/candidate-evaluations", response_model=List[CandidateEvaluationResponse])
async def get_candidate_evaluations():
    conn = await get_db_connection()
    try:
        evaluations = await conn.fetch("SELECT * FROM candidate_evaluations")
        return [dict(e) for e in evaluations]
    finally:
        await conn.close()


# ==================== Hire Candidate Route ====================
@router.post("/applications/{application_id}/hire")
async def hire_candidate(application_id: int):
    conn = await get_db_connection()
    try:
        application = await conn.fetchrow("SELECT * FROM applications WHERE id = $1", application_id)
        if not application:
            raise HTTPException(status_code=404, detail="Application not found")

        candidate = await conn.fetchrow("SELECT * FROM candidates WHERE id = $1", application["candidate_id"])
        if not candidate:
            raise HTTPException(status_code=404, detail="Candidate not found")

        # Update application and candidate status
        await conn.execute("UPDATE applications SET status = 'Hired' WHERE id = $1", application_id)
        await conn.execute("UPDATE candidates SET status = 'Hired' WHERE id = $1", candidate["id"])

        # 1. Promote in auth service → get the new user's ID
        temp_password = None
        auth_user_id  = None
        try:
            import httpx
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(
                    f"{settings.AUTH_SERVICE_URL}/api/auth/internal/promote-employee",
                    json={
                        "email":      candidate["email"],
                        "first_name": candidate["first_name"],
                        "last_name":  candidate["last_name"],
                    }
                )
                if res.status_code == 200:
                    body = res.json()
                    temp_password = body.get("temp_password")
                    auth_user_id  = body.get("user_id")
        except Exception as e:
            print(f"Failed to promote candidate in auth service: {e}")

        # 2. Upsert an HRMS employee record so the employee appears in Employees page
        #    and can have a manager assigned immediately.
        if auth_user_id:
            try:
                import httpx as _httpx
                async with _httpx.AsyncClient(timeout=10.0) as client:
                    await client.post(
                        f"{settings.HRMS_SERVICE_URL}/api/hrms/employees",
                        json={
                            "user_id":        auth_user_id,
                            "email":          candidate["email"],
                            "first_name":     candidate["first_name"],
                            "last_name":      candidate["last_name"],
                            "date_of_joining": str(__import__('datetime').date.today()),
                        }
                    )
            except Exception as e:
                print(f"HRMS employee upsert failed (non-fatal): {e}")

        return {
            "message":      "Candidate hired successfully",
            "email":        candidate["email"],
            "auth_user_id": auth_user_id,
            "temp_password": temp_password,
            "next_steps":   "Assign a manager in the Employees page, then the employee can login at /login.",
        }
    finally:
        await conn.close()


# ==================== AI Chat Route ====================
@router.post("/chat")
async def chat_route(request: ChatRequest):
    candidates_data = []
    conn = None
    try:
        if request.candidate_ids:
            conn = await get_db_connection()
            for cid in request.candidate_ids:
                cand = await conn.fetchrow("SELECT * FROM candidates WHERE id = $1", cid)
                if cand:
                    candidates_data.append(dict(cand))
    finally:
        if conn:
            await conn.close()
    
    return await chat_with_recruiter(request.message, candidates_data)


# ==================== Voice Screening Invite Route ====================
@router.post("/applications/{application_id}/send-voice-invite")
async def send_voice_invite(application_id: int):
    conn = await get_db_connection()
    try:
        # Get application and candidate
        application = await conn.fetchrow("SELECT * FROM applications WHERE id = $1", application_id)
        if not application:
            raise HTTPException(status_code=404, detail="Application not found")
        
        candidate = await conn.fetchrow("SELECT * FROM candidates WHERE id = $1", application["candidate_id"])
        if not candidate:
            raise HTTPException(status_code=404, detail="Candidate not found")
        
        job = await conn.fetchrow("SELECT * FROM jobs WHERE id = $1", application["job_id"])
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        
        # Generate unique code
        voice_code = secrets.token_urlsafe(8)
        
        # Update application
        await conn.execute(
            "UPDATE applications SET voice_screening_code = $1, status = 'Voice Screening Required' WHERE id = $2",
            voice_code, application_id
        )
        
        # Load email config from DB (set by admin via settings page)
        invite_link = f"{settings.FRONTEND_URL}/careers/voice-interview/{voice_code}"
        email_sent = False
        email_error = None
        try:
            cfg = await _get_email_config(conn)
            smtp_user = cfg.get("smtp_user") or settings.SMTP_USER
            smtp_password = cfg.get("smtp_password") or settings.SMTP_PASSWORD
            smtp_host = cfg.get("smtp_host") or settings.SMTP_HOST
            smtp_port = int(cfg.get("smtp_port") or settings.SMTP_PORT)
            smtp_from = cfg.get("smtp_from") or settings.SMTP_FROM or smtp_user

            if smtp_user and smtp_password:
                import asyncio as _asyncio
                await _asyncio.to_thread(
                    _send_smtp_email,
                    smtp_host, smtp_port, smtp_user, smtp_password, smtp_from,
                    candidate["email"],
                    f"Voice Screening Invitation — {job['title']}",
                    _voice_invite_body(candidate["first_name"], job["title"], invite_link, voice_code)
                )
                email_sent = True
            else:
                email_error = "SMTP not configured. Set email settings in Admin → Settings."
        except Exception as e:
            email_error = str(e)
            print(f"Failed to send email: {e}")
        
        return {
            "message": "Voice screening invite sent successfully" if email_sent else "Invite created but email not sent",
            "email_sent": email_sent,
            "email_error": email_error,
            "voice_screening_code": voice_code,
            "invite_link": invite_link
        }

    finally:
        await conn.close()


# ==================== Email Config Helpers ====================
async def _get_email_config(conn) -> dict:
    """Load all smtp_* keys from system_settings."""
    rows = await conn.fetch("SELECT key, value FROM system_settings WHERE key LIKE 'smtp_%'")
    return {r["key"]: r["value"] for r in rows}


def _send_smtp_email(host, port, user, password, from_addr, to_addr, subject, body):
    msg = MIMEMultipart("alternative")
    msg["From"] = from_addr
    msg["To"] = to_addr
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "html"))
    try:
        with smtplib.SMTP(host, int(port), timeout=15) as server:
            server.ehlo()
            server.starttls()
            server.ehlo()          # required again after STARTTLS for Gmail
            server.login(user, password)
            server.sendmail(from_addr, [to_addr], msg.as_string())
    except smtplib.SMTPAuthenticationError:
        raise RuntimeError(
            "Gmail authentication failed. Make sure you are using an App Password "
            "(not your Gmail login password). Generate one at "
            "https://myaccount.google.com/apppasswords and paste the 16-character code."
        )
    except smtplib.SMTPException as e:
        raise RuntimeError(f"SMTP error: {e}")
    except OSError as e:
        raise RuntimeError(f"Network error connecting to {host}:{port} — {e}")


def _voice_invite_body(first_name, job_title, invite_link, code):
    return f"""
    <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:32px;border:1px solid #e5e7eb;border-radius:12px">
      <h1 style="color:#4f46e5">FutureHR</h1>
      <h2>Voice Screening Invitation</h2>
      <p>Hello <strong>{first_name}</strong>,</p>
      <p>Congratulations! You have been selected for the voice screening round for the <strong>{job_title}</strong> position.</p>
      <p style="margin:24px 0">
        <a href="{invite_link}" style="background:#4f46e5;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold">
          🎙️ Start Voice Interview
        </a>
      </p>
      <p style="color:#6b7280;font-size:14px">Or copy this link: {invite_link}</p>
      <p style="color:#6b7280;font-size:14px">Access code: <strong>{code}</strong></p>
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0"/>
      <p style="color:#9ca3af;font-size:12px">FutureHR Team — careers@futurehr.com</p>
    </div>
    """


def _application_withdrawn_body(first_name: str, job_title: str) -> str:
    return f"""
    <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:32px;border:1px solid #e5e7eb;border-radius:12px">
      <h1 style="color:#4f46e5;margin-bottom:4px">FutureHR</h1>
      <p style="color:#6b7280;margin-top:0">AI-Powered Recruitment</p>
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0">
      <h2 style="color:#111827">Application Update — {job_title}</h2>
      <p>Hello <strong>{first_name}</strong>,</p>
      <p>Thank you for your interest in the <strong>{job_title}</strong> role at FutureHR.</p>
      <p>After careful consideration, we have decided not to move forward with your application at this time. This was a competitive process and we appreciate the time and effort you invested in applying.</p>
      <p>We encourage you to:</p>
      <ul style="color:#374151;line-height:1.8">
        <li>Continue building on your skills and experience</li>
        <li>Apply for future openings that match your profile</li>
        <li>Keep an eye on our careers page for new opportunities</li>
      </ul>
      <p>We wish you all the best in your job search.</p>
      <br>
      <p style="color:#6b7280;font-size:14px">Warm regards,<br><strong>FutureHR Recruitment Team</strong></p>
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0">
      <p style="color:#9ca3af;font-size:12px;text-align:center">This is an automated notification from FutureHR. Please do not reply to this email.</p>
    </div>
    """


# ==================== System Settings Routes ====================
@router.get("/settings")
async def get_settings():
    conn = await get_db_connection()
    try:
        rows = await conn.fetch("SELECT key, value FROM system_settings")
        cfg = {r["key"]: r["value"] for r in rows}
        # Never return the password in plaintext — mask it
        if cfg.get("smtp_password"):
            cfg["smtp_password"] = "••••••••"
        return cfg
    finally:
        await conn.close()


@router.put("/settings")
async def update_settings(data: dict):
    conn = await get_db_connection()
    try:
        for key, value in data.items():
            if value is None:
                continue
            # Skip masked password (don't overwrite with bullets)
            if key == "smtp_password" and set(value) == {"•"}:
                continue
            await conn.execute(
                """
                INSERT INTO system_settings (key, value, updated_at)
                VALUES ($1, $2, NOW())
                ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()
                """,
                key, str(value)
            )
        return {"message": "Settings saved"}
    finally:
        await conn.close()


@router.post("/settings/test-email")
async def test_email(data: dict):
    """Send a test email using current saved settings."""
    conn = await get_db_connection()
    try:
        cfg = await _get_email_config(conn)
        smtp_user = cfg.get("smtp_user") or settings.SMTP_USER
        smtp_password = cfg.get("smtp_password") or settings.SMTP_PASSWORD
        smtp_host = cfg.get("smtp_host") or settings.SMTP_HOST
        smtp_port = int(cfg.get("smtp_port") or settings.SMTP_PORT)
        smtp_from = cfg.get("smtp_from") or settings.SMTP_FROM or smtp_user
        to_email = data.get("to") or smtp_user

        if not smtp_user or not smtp_password:
            raise HTTPException(status_code=400, detail="SMTP not configured")

        import asyncio as _asyncio
        await _asyncio.to_thread(
            _send_smtp_email,
            smtp_host, smtp_port, smtp_user, smtp_password, smtp_from,
            to_email,
            "FutureHR — Test Email",
            "<h2>✅ Email is working!</h2><p>Your FutureHR email configuration is set up correctly.</p>"
        )
        return {"message": f"Test email sent to {to_email}"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Email failed: {str(e)}")
    finally:
        await conn.close()


# ==================== Compose & Send Custom Email ====================
@router.post("/compose-email")
async def compose_email(request: Request):
    """Send a custom email composed by the admin. Supports optional file attachment."""
    import base64 as _b64
    from email.mime.base import MIMEBase
    from email import encoders as _encoders

    form = await request.form()
    to_addr  = form.get("to", "").strip()
    subject  = form.get("subject", "").strip()
    body     = form.get("body", "").strip()
    file     = form.get("attachment")  # UploadFile or None

    if not to_addr:
        raise HTTPException(status_code=400, detail="Recipient email is required")
    if not subject:
        raise HTTPException(status_code=400, detail="Subject is required")
    if not body:
        raise HTTPException(status_code=400, detail="Message body is required")

    conn = await get_db_connection()
    try:
        cfg          = await _get_email_config(conn)
        smtp_user    = cfg.get("smtp_user")     or settings.SMTP_USER
        smtp_password = cfg.get("smtp_password") or settings.SMTP_PASSWORD
        smtp_host    = cfg.get("smtp_host")     or settings.SMTP_HOST
        smtp_port    = int(cfg.get("smtp_port") or settings.SMTP_PORT)
        smtp_from    = cfg.get("smtp_from")     or settings.SMTP_FROM or smtp_user

        if not smtp_user or not smtp_password:
            raise HTTPException(
                status_code=400,
                detail="Email not configured. Add SMTP credentials in the Advanced Settings section."
            )

        attachment_data = None
        attachment_name = None
        if file and hasattr(file, "read"):
            attachment_data = await file.read()
            attachment_name = file.filename

        def _send():
            msg = MIMEMultipart()
            msg["Subject"] = subject
            msg["From"]    = f"FutureHR <{smtp_from}>"
            msg["To"]      = to_addr
            msg.attach(MIMEText(body, "plain"))

            if attachment_data and attachment_name:
                part = MIMEBase("application", "octet-stream")
                part.set_payload(attachment_data)
                _encoders.encode_base64(part)
                part.add_header("Content-Disposition", f'attachment; filename="{attachment_name}"')
                msg.attach(part)

            import smtplib as _smtp
            with _smtp.SMTP(smtp_host, smtp_port, timeout=15) as server:
                server.ehlo()
                server.starttls()
                server.ehlo()
                server.login(smtp_user, smtp_password.replace(" ", ""))
                server.sendmail(smtp_from, to_addr, msg.as_string())

        import asyncio as _asyncio
        await _asyncio.to_thread(_send)
        return {"message": f"Email sent to {to_addr}"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send email: {str(e)}")
    finally:
        await conn.close()


# ==================== Validate Voice Screening Code ====================
@router.get("/voice-screening/validate/{code}")
async def validate_voice_code(code: str):
    conn = await get_db_connection()
    try:
        application = await conn.fetchrow("SELECT * FROM applications WHERE voice_screening_code = $1", code)
        if not application:
            raise HTTPException(status_code=404, detail="Invalid voice screening code")
        
        candidate = await conn.fetchrow("SELECT * FROM candidates WHERE id = $1", application["candidate_id"])
        job = await conn.fetchrow("SELECT * FROM jobs WHERE id = $1", application["job_id"])
        voice_questions = await conn.fetchrow("SELECT * FROM voice_questions WHERE job_id = $1", job["id"])
        
        app_dict = dict(application)
        if isinstance(app_dict["application_form_data"], str):
            try:
                app_dict["application_form_data"] = json.loads(app_dict["application_form_data"])
            except json.JSONDecodeError:
                app_dict["application_form_data"] = {}
        
        return {
            "application": app_dict,
            "candidate": dict(candidate),
            "job": dict(job),
            "questions": json.loads(voice_questions["questions"]) if voice_questions else []
        }
    finally:
        await conn.close()
