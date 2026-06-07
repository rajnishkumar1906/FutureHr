import asyncpg
from .config import settings

async def get_db_connection():
    conn = await asyncpg.connect(settings.DATABASE_URL)
    return conn

async def init_db():
    conn = await get_db_connection()
    
    # Create candidates table
    await conn.execute("""
        CREATE TABLE IF NOT EXISTS candidates (
            id SERIAL PRIMARY KEY,
            first_name VARCHAR NOT NULL,
            last_name VARCHAR NOT NULL,
            email VARCHAR UNIQUE NOT NULL,
            phone VARCHAR NOT NULL,
            resume_text TEXT,
            skills TEXT,
            education TEXT,
            experience TEXT,
            certifications TEXT,
            status VARCHAR DEFAULT 'Applied',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Create jobs table (for HR to post jobs)
    await conn.execute("""
        CREATE TABLE IF NOT EXISTS jobs (
            id SERIAL PRIMARY KEY,
            title VARCHAR NOT NULL,
            department VARCHAR NOT NULL,
            location VARCHAR NOT NULL,
            type VARCHAR NOT NULL,
            experience VARCHAR,
            salary_range VARCHAR,
            description TEXT,
            requirements TEXT,
            status VARCHAR DEFAULT 'Open',
            posted_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            applicants INTEGER DEFAULT 0,
            positions INTEGER DEFAULT 1
        )
    """)
    try:
        await conn.execute("ALTER TABLE jobs ADD COLUMN IF NOT EXISTS positions INTEGER DEFAULT 1")
    except Exception:
        pass
    
    # Create applications table
    await conn.execute("""
        CREATE TABLE IF NOT EXISTS applications (
            id SERIAL PRIMARY KEY,
            candidate_id INTEGER NOT NULL,
            job_id INTEGER NOT NULL,
            application_form_data JSONB,
            status VARCHAR DEFAULT 'Applied',
            voice_screening_code VARCHAR,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(candidate_id, job_id)
        )
    """)
    # Add voice_screening_code if not exists
    try:
        await conn.execute("ALTER TABLE applications ADD COLUMN IF NOT EXISTS voice_screening_code VARCHAR")
    except Exception:
        pass
    
    # Add unique constraint if not exists
    try:
        await conn.execute("ALTER TABLE applications DROP CONSTRAINT IF EXISTS applications_candidate_id_job_id_key")
        await conn.execute("ALTER TABLE applications ADD CONSTRAINT applications_candidate_id_job_id_key UNIQUE(candidate_id, job_id)")
    except Exception:
        pass
    
    # Create voice questions table for jobs
    await conn.execute("""
        CREATE TABLE IF NOT EXISTS voice_questions (
            id SERIAL PRIMARY KEY,
            job_id INTEGER NOT NULL,
            questions JSONB NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Create voice answers table
    await conn.execute("""
        CREATE TABLE IF NOT EXISTS voice_answers (
            id SERIAL PRIMARY KEY,
            application_id INTEGER NOT NULL,
            question_index INTEGER NOT NULL,
            answer TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Create resume screenings table (linked to application now)
    await conn.execute("""
        CREATE TABLE IF NOT EXISTS resume_screenings (
            id SERIAL PRIMARY KEY,
            application_id INTEGER NOT NULL,
            candidate_id INTEGER NOT NULL,
            job_id INTEGER NOT NULL,
            candidate_score FLOAT NOT NULL,
            skills_match FLOAT NOT NULL,
            experience_match FLOAT NOT NULL,
            overall_score FLOAT NOT NULL DEFAULT 0,
            recommendation VARCHAR NOT NULL,
            analysis TEXT NOT NULL,
            summary TEXT,
            strengths TEXT,
            weaknesses TEXT,
            skill_gaps TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    # Add new columns to resume_screenings if not exist
    try:
        await conn.execute("ALTER TABLE resume_screenings ADD COLUMN IF NOT EXISTS overall_score FLOAT NOT NULL DEFAULT 0")
        await conn.execute("ALTER TABLE resume_screenings ADD COLUMN IF NOT EXISTS summary TEXT")
        await conn.execute("ALTER TABLE resume_screenings ADD COLUMN IF NOT EXISTS strengths TEXT")
        await conn.execute("ALTER TABLE resume_screenings ADD COLUMN IF NOT EXISTS weaknesses TEXT")
        await conn.execute("ALTER TABLE resume_screenings ADD COLUMN IF NOT EXISTS skill_gaps TEXT")
        await conn.execute("ALTER TABLE resume_screenings ADD COLUMN IF NOT EXISTS top_skills TEXT")
        await conn.execute("ALTER TABLE resume_screenings ADD COLUMN IF NOT EXISTS candidate_email VARCHAR")
    except Exception:
        pass
    
    # Create candidate evaluations table
    await conn.execute("""
        CREATE TABLE IF NOT EXISTS candidate_evaluations (
            id SERIAL PRIMARY KEY,
            application_id INTEGER NOT NULL,
            candidate_id INTEGER NOT NULL,
            summary TEXT NOT NULL,
            strengths TEXT NOT NULL,
            weaknesses TEXT NOT NULL,
            skill_gaps TEXT NOT NULL,
            recommendation VARCHAR NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Create voice screenings table
    await conn.execute("""
        CREATE TABLE IF NOT EXISTS voice_screenings (
            id SERIAL PRIMARY KEY,
            application_id INTEGER NOT NULL,
            candidate_id INTEGER NOT NULL,
            communication_score FLOAT NOT NULL,
            confidence_score FLOAT NOT NULL,
            recommendation VARCHAR NOT NULL,
            analysis TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # System settings table (for email config stored by admin)
    await conn.execute("""
        CREATE TABLE IF NOT EXISTS system_settings (
            key VARCHAR PRIMARY KEY,
            value TEXT NOT NULL,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    await conn.close()
