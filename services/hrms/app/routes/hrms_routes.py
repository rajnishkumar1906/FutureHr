from fastapi import APIRouter, HTTPException, status
from typing import List
from ..database import get_db_connection
from ..schemas.schemas import (
    DepartmentCreate, DepartmentResponse,
    DesignationCreate, DesignationResponse,
    EmployeeCreate, EmployeeResponse,
    AttendanceCreate, AttendanceResponse,
    PayrollCreate, PayrollResponse,
    PerformanceGoalCreate, PerformanceGoalResponse
)

router = APIRouter(prefix="/api/hrms", tags=["hrms"])

# Department Routes
@router.post("/departments", response_model=DepartmentResponse, status_code=status.HTTP_201_CREATED)
async def create_department(department: DepartmentCreate):
    conn = await get_db_connection()
    
    new_dept = await conn.fetchrow(
        """
        INSERT INTO departments (name, description)
        VALUES ($1, $2)
        RETURNING id, name, description, created_at
        """,
        department.name, department.description
    )
    
    await conn.close()
    
    return dict(new_dept)

@router.get("/departments", response_model=List[DepartmentResponse])
async def get_departments():
    conn = await get_db_connection()
    
    departments = await conn.fetch("SELECT * FROM departments")
    
    await conn.close()
    return [dict(d) for d in departments]

# Designation Routes
@router.post("/designations", response_model=DesignationResponse, status_code=status.HTTP_201_CREATED)
async def create_designation(designation: DesignationCreate):
    conn = await get_db_connection()
    
    new_desig = await conn.fetchrow(
        """
        INSERT INTO designations (title, description, department_id)
        VALUES ($1, $2, $3)
        RETURNING id, title, description, department_id, created_at
        """,
        designation.title, designation.description, designation.department_id
    )
    
    await conn.close()
    
    return dict(new_desig)

@router.get("/designations", response_model=List[DesignationResponse])
async def get_designations():
    conn = await get_db_connection()
    
    designations = await conn.fetch("SELECT * FROM designations")
    
    await conn.close()
    return [dict(d) for d in designations]

# Employee Routes
@router.post("/employees", response_model=EmployeeResponse, status_code=status.HTTP_201_CREATED)
async def create_employee(employee: EmployeeCreate):
    try:
        conn = await get_db_connection()
        print("Connected to DB!")
        
        new_emp = await conn.fetchrow(
            """
            INSERT INTO employees (user_id, email, department_id, designation_id, date_of_joining, phone, gender)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING user_id, email, department_id, designation_id, date_of_joining, phone, gender, created_at
            """,
            employee.user_id, employee.email, employee.department_id, employee.designation_id,
            employee.date_of_joining, employee.phone,
            employee.gender
        )
        
        await conn.close()
        print("Inserted employee:", new_emp)
        
        return dict(new_emp)
    except Exception as e:
        print("ERROR creating employee:", str(e))
        import traceback
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/employees", response_model=List[EmployeeResponse])
async def get_employees():
    try:
        conn = await get_db_connection()
        employees = await conn.fetch("SELECT * FROM employees")
        await conn.close()
        return [dict(e) for e in employees]
    except Exception as e:
        print("ERROR getting employees:", str(e))
        import traceback
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/employees/{user_id}", response_model=EmployeeResponse)
async def get_employee(user_id: int):
    try:
        conn = await get_db_connection()
        employee = await conn.fetchrow("SELECT * FROM employees WHERE user_id = $1", user_id)
        
        if not employee:
            await conn.close()
            raise HTTPException(status_code=404, detail="Employee not found")
        
        await conn.close()
        return dict(employee)
    except Exception as e:
        print("ERROR getting single employee:", str(e))
        import traceback
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

# Attendance Routes
@router.post("/attendance", response_model=AttendanceResponse, status_code=status.HTTP_201_CREATED)
async def create_attendance(attendance: AttendanceCreate):
    conn = await get_db_connection()
    
    new_attendance = await conn.fetchrow(
        """
        INSERT INTO attendance (user_id, date, check_in, check_out, hours_worked, status)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, user_id, date, check_in, check_out, hours_worked, status, created_at
        """,
        attendance.user_id, attendance.date, attendance.check_in,
        attendance.check_out, attendance.hours_worked, attendance.status
    )
    
    await conn.close()
    
    return dict(new_attendance)

@router.get("/attendance", response_model=List[AttendanceResponse])
async def get_attendance(user_id: int = None):
    conn = await get_db_connection()
    
    if user_id:
        attendance_records = await conn.fetch("SELECT * FROM attendance WHERE user_id = $1", user_id)
    else:
        attendance_records = await conn.fetch("SELECT * FROM attendance")
    
    await conn.close()
    return [dict(a) for a in attendance_records]

# Payroll Routes
@router.post("/payroll", response_model=PayrollResponse, status_code=status.HTTP_201_CREATED)
async def create_payroll(payroll: PayrollCreate):
    conn = await get_db_connection()
    net_salary = payroll.basic_salary + payroll.allowances - payroll.deductions
    
    new_payroll = await conn.fetchrow(
        """
        INSERT INTO payroll (user_id, month, year, basic_salary, allowances, deductions, net_salary, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id, user_id, month, year, basic_salary, allowances, deductions, net_salary, status, created_at
        """,
        payroll.user_id, payroll.month, payroll.year, payroll.basic_salary,
        payroll.allowances, payroll.deductions, net_salary, payroll.status
    )
    
    await conn.close()
    
    return dict(new_payroll)

@router.get("/payroll", response_model=List[PayrollResponse])
async def get_payroll(user_id: int = None):
    conn = await get_db_connection()
    
    if user_id:
        payroll_records = await conn.fetch("SELECT * FROM payroll WHERE user_id = $1", user_id)
    else:
        payroll_records = await conn.fetch("SELECT * FROM payroll")
    
    await conn.close()
    return [dict(p) for p in payroll_records]

# Performance Goal Routes
@router.post("/performance-goals", response_model=PerformanceGoalResponse, status_code=status.HTTP_201_CREATED)
async def create_performance_goal(goal: PerformanceGoalCreate):
    conn = await get_db_connection()
    
    new_goal = await conn.fetchrow(
        """
        INSERT INTO performance_goals (user_id, title, description, target_date, status, progress)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, user_id, title, description, target_date, status, progress, created_at
        """,
        goal.user_id, goal.title, goal.description,
        goal.target_date, goal.status, goal.progress
    )
    
    await conn.close()
    
    return dict(new_goal)

@router.get("/performance-goals", response_model=List[PerformanceGoalResponse])
async def get_performance_goals(user_id: int = None):
    conn = await get_db_connection()
    
    if user_id:
        goals = await conn.fetch("SELECT * FROM performance_goals WHERE user_id = $1", user_id)
    else:
        goals = await conn.fetch("SELECT * FROM performance_goals")
    
    await conn.close()
    return [dict(g) for g in goals]
