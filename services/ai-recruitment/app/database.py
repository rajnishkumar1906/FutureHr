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
            status VARCHAR DEFAULT 'Pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Create job descriptions table
    await conn.execute("""
        CREATE TABLE IF NOT EXISTS job_descriptions (
            id SERIAL PRIMARY KEY,
            title VARCHAR NOT NULL,
            description TEXT NOT NULL,
            required_skills TEXT NOT NULL,
            required_experience INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Create resume screenings table
    await conn.execute("""
        CREATE TABLE IF NOT EXISTS resume_screenings (
            id SERIAL PRIMARY KEY,
            candidate_id INTEGER NOT NULL,
            job_description_id INTEGER NOT NULL,
            candidate_score FLOAT NOT NULL,
            skills_match FLOAT NOT NULL,
            experience_match FLOAT NOT NULL,
            recommendation VARCHAR NOT NULL,
            analysis TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Create candidate evaluations table
    await conn.execute("""
        CREATE TABLE IF NOT EXISTS candidate_evaluations (
            id SERIAL PRIMARY KEY,
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
            candidate_id INTEGER NOT NULL,
            transcription TEXT NOT NULL,
            communication_score FLOAT NOT NULL,
            confidence_score FLOAT NOT NULL,
            recommendation VARCHAR NOT NULL,
            analysis TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    await conn.close()
