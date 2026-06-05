import asyncpg
from .config import settings

async def get_db_connection():
    conn = await asyncpg.connect(settings.DATABASE_URL)
    return conn

async def init_db():
    conn = await get_db_connection()
    
    # Create departments table
    await conn.execute("""
        CREATE TABLE IF NOT EXISTS departments (
            id SERIAL PRIMARY KEY,
            name VARCHAR UNIQUE NOT NULL,
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Create designations table
    await conn.execute("""
        CREATE TABLE IF NOT EXISTS designations (
            id SERIAL PRIMARY KEY,
            title VARCHAR UNIQUE NOT NULL,
            description TEXT,
            department_id INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Create employees table
    await conn.execute("""
        CREATE TABLE IF NOT EXISTS employees (
            user_id INTEGER PRIMARY KEY,
            email VARCHAR UNIQUE NOT NULL,
            department_id INTEGER,
            designation_id INTEGER,
            date_of_joining DATE,
            phone VARCHAR,
            gender VARCHAR,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Create attendance table
    await conn.execute("""
        CREATE TABLE IF NOT EXISTS attendance (
            id SERIAL PRIMARY KEY,
            user_id INTEGER,
            date DATE,
            check_in TIME,
            check_out TIME,
            hours_worked FLOAT,
            status VARCHAR,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Create payroll table
    await conn.execute("""
        CREATE TABLE IF NOT EXISTS payroll (
            id SERIAL PRIMARY KEY,
            user_id INTEGER,
            month INTEGER,
            year INTEGER,
            basic_salary FLOAT,
            allowances FLOAT DEFAULT 0,
            deductions FLOAT DEFAULT 0,
            net_salary FLOAT,
            status VARCHAR,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Create performance goals table
    await conn.execute("""
        CREATE TABLE IF NOT EXISTS performance_goals (
            id SERIAL PRIMARY KEY,
            user_id INTEGER,
            title VARCHAR,
            description TEXT,
            target_date DATE,
            status VARCHAR,
            progress INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    await conn.close()
