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
            first_name VARCHAR DEFAULT '',
            last_name VARCHAR DEFAULT '',
            department_id INTEGER,
            designation_id INTEGER,
            manager_id INTEGER,
            date_of_joining DATE,
            phone VARCHAR,
            gender VARCHAR,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    # Add new columns to existing tables if not present
    for col, definition in [
        ("first_name", "VARCHAR DEFAULT ''"),
        ("last_name",  "VARCHAR DEFAULT ''"),
        ("manager_id", "INTEGER"),
    ]:
        try:
            await conn.execute(f"ALTER TABLE employees ADD COLUMN IF NOT EXISTS {col} {definition}")
        except Exception:
            pass

    # Leave requests table
    await conn.execute("""
        CREATE TABLE IF NOT EXISTS leave_requests (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL,
            leave_type VARCHAR NOT NULL,
            start_date DATE NOT NULL,
            end_date DATE NOT NULL,
            reason TEXT,
            status VARCHAR DEFAULT 'Pending',
            manager_id INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Leave balances table
    await conn.execute("""
        CREATE TABLE IF NOT EXISTS leave_balances (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL UNIQUE,
            annual_leave INTEGER DEFAULT 15,
            sick_leave INTEGER DEFAULT 10,
            casual_leave INTEGER DEFAULT 5,
            used_annual INTEGER DEFAULT 0,
            used_sick INTEGER DEFAULT 0,
            used_casual INTEGER DEFAULT 0,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
    
    # Add manager_id column to departments if not present
    try:
        await conn.execute("ALTER TABLE departments ADD COLUMN IF NOT EXISTS manager_id INTEGER")
    except Exception:
        pass

    await conn.close()
