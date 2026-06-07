from fastapi import APIRouter, HTTPException, status
import asyncpg
from typing import List, Optional
from datetime import date
from ..database import get_db_connection
from ..schemas.schemas import (
    DepartmentCreate, DepartmentResponse,
    DesignationCreate, DesignationResponse,
    EmployeeCreate, EmployeeResponse,
    AttendanceCreate, AttendanceResponse,
    PayrollCreate, PayrollResponse,
    PerformanceGoalCreate, PerformanceGoalResponse,
    LeaveRequestCreate, LeaveRequestResponse,
    TeamMemberResponse
)

router = APIRouter(prefix="/api/hrms", tags=["hrms"])

# Department Routes
@router.post("/departments", response_model=DepartmentResponse, status_code=status.HTTP_201_CREATED)
async def create_department(department: DepartmentCreate):
    conn = await get_db_connection()
    try:
        new_dept = await conn.fetchrow(
            """
            INSERT INTO departments (name, description, manager_id)
            VALUES ($1, $2, $3)
            RETURNING id, name, description, manager_id, created_at
            """,
            department.name, department.description, department.manager_id
        )
        return dict(new_dept)
    except asyncpg.UniqueViolationError:
        raise HTTPException(status_code=400, detail=f"A department named '{department.name}' already exists.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        await conn.close()

@router.get("/departments", response_model=List[DepartmentResponse])
async def get_departments():
    conn = await get_db_connection()
    try:
        departments = await conn.fetch("SELECT id, name, description, manager_id, created_at FROM departments")
        return [dict(d) for d in departments]
    finally:
        await conn.close()

@router.patch("/departments/{id}/manager")
async def assign_department_manager(id: int, data: dict):
    manager_id = data.get("manager_id")
    conn = await get_db_connection()
    try:
        dept = await conn.fetchrow("SELECT id FROM departments WHERE id = $1", id)
        if not dept:
            raise HTTPException(status_code=404, detail="Department not found")
        updated = await conn.fetchrow(
            "UPDATE departments SET manager_id = $1 WHERE id = $2 RETURNING id, name, description, manager_id, created_at",
            manager_id, id
        )
        return dict(updated)
    finally:
        await conn.close()

@router.get("/departments/{id}", response_model=DepartmentResponse)
async def get_department(id: int):
    conn = await get_db_connection()
    try:
        dept = await conn.fetchrow("SELECT * FROM departments WHERE id = $1", id)
        if not dept:
            raise HTTPException(status_code=404, detail="Department not found")
        return dict(dept)
    finally:
        await conn.close()

@router.put("/departments/{id}", response_model=DepartmentResponse)
async def update_department(id: int, department: DepartmentCreate):
    conn = await get_db_connection()
    try:
        updated_dept = await conn.fetchrow(
            """
            UPDATE departments SET name = $1, description = $2 WHERE id = $3
            RETURNING id, name, description, created_at
            """,
            department.name, department.description, id
        )
        if not updated_dept:
            raise HTTPException(status_code=404, detail="Department not found")
        return dict(updated_dept)
    finally:
        await conn.close()

@router.delete("/departments/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_department(id: int):
    conn = await get_db_connection()
    try:
        await conn.execute("DELETE FROM departments WHERE id = $1", id)
    finally:
        await conn.close()

# Designation Routes
@router.post("/designations", response_model=DesignationResponse, status_code=status.HTTP_201_CREATED)
async def create_designation(designation: DesignationCreate):
    conn = await get_db_connection()
    try:
        new_desig = await conn.fetchrow(
            """
            INSERT INTO designations (title, description, department_id)
            VALUES ($1, $2, $3)
            RETURNING id, title, description, department_id, created_at
            """,
            designation.title, designation.description, designation.department_id
        )
        return dict(new_desig)
    finally:
        await conn.close()

@router.get("/designations", response_model=List[DesignationResponse])
async def get_designations():
    conn = await get_db_connection()
    try:
        designations = await conn.fetch("SELECT * FROM designations")
        return [dict(d) for d in designations]
    finally:
        await conn.close()

# Employee Routes
@router.post("/employees", response_model=EmployeeResponse, status_code=status.HTTP_201_CREATED)
async def create_employee(employee: EmployeeCreate):
    conn = await get_db_connection()
    try:
        new_emp = await conn.fetchrow(
            """
            INSERT INTO employees
                (user_id, email, first_name, last_name, department_id, designation_id,
                 manager_id, date_of_joining, phone, gender)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
            ON CONFLICT (user_id) DO UPDATE SET
                email         = EXCLUDED.email,
                first_name    = EXCLUDED.first_name,
                last_name     = EXCLUDED.last_name,
                department_id = EXCLUDED.department_id,
                designation_id= EXCLUDED.designation_id,
                manager_id    = EXCLUDED.manager_id,
                date_of_joining = EXCLUDED.date_of_joining,
                phone         = EXCLUDED.phone,
                gender        = EXCLUDED.gender
            RETURNING user_id, email, first_name, last_name, department_id, designation_id,
                      manager_id, date_of_joining, phone, gender, created_at
            """,
            employee.user_id, employee.email,
            employee.first_name or '', employee.last_name or '',
            employee.department_id, employee.designation_id,
            employee.manager_id,
            employee.date_of_joining, employee.phone, employee.gender
        )
        return dict(new_emp)
    finally:
        await conn.close()

@router.get("/employees", response_model=List[EmployeeResponse])
async def get_employees():
    conn = await get_db_connection()
    try:
        employees = await conn.fetch("SELECT * FROM employees")
        return [dict(e) for e in employees]
    finally:
        await conn.close()

@router.get("/employees/{id}", response_model=EmployeeResponse)
async def get_employee(id: int):
    conn = await get_db_connection()
    try:
        emp = await conn.fetchrow("SELECT * FROM employees WHERE user_id = $1", id)
        if not emp:
            raise HTTPException(status_code=404, detail="Employee not found")
        return dict(emp)
    finally:
        await conn.close()

@router.put("/employees/{id}", response_model=EmployeeResponse)
async def update_employee(id: int, employee: EmployeeCreate):
    conn = await get_db_connection()
    try:
        updated_emp = await conn.fetchrow(
            """
            UPDATE employees
            SET email = $1, first_name = $2, last_name = $3,
                department_id = $4, designation_id = $5, manager_id = $6,
                date_of_joining = $7, phone = $8, gender = $9
            WHERE user_id = $10
            RETURNING user_id, email, first_name, last_name, department_id, designation_id,
                      manager_id, date_of_joining, phone, gender, created_at
            """,
            employee.email, employee.first_name or '', employee.last_name or '',
            employee.department_id, employee.designation_id, employee.manager_id,
            employee.date_of_joining, employee.phone, employee.gender, id
        )
        if not updated_emp:
            raise HTTPException(status_code=404, detail="Employee not found")
        return dict(updated_emp)
    finally:
        await conn.close()


@router.patch("/employees/{id}/manager")
async def assign_manager(id: int, data: dict):
    """Assign or change a manager for an employee. Body: {manager_id: int|null}"""
    manager_id = data.get("manager_id")
    conn = await get_db_connection()
    try:
        emp = await conn.fetchrow("SELECT user_id FROM employees WHERE user_id = $1", id)
        if not emp:
            raise HTTPException(status_code=404, detail="Employee not found in HRMS")
        await conn.execute(
            "UPDATE employees SET manager_id = $1 WHERE user_id = $2",
            manager_id, id
        )
        updated = await conn.fetchrow(
            "SELECT user_id, email, first_name, last_name, manager_id FROM employees WHERE user_id = $1", id
        )
        return dict(updated)
    finally:
        await conn.close()

@router.delete("/employees/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_employee(id: int):
    conn = await get_db_connection()
    try:
        await conn.execute("DELETE FROM employees WHERE user_id = $1", id)
    finally:
        await conn.close()

# Attendance Routes
@router.post("/attendance", response_model=AttendanceResponse, status_code=status.HTTP_201_CREATED)
async def create_attendance(attendance: AttendanceCreate):
    conn = await get_db_connection()
    try:
        new_attendance = await conn.fetchrow(
            """
            INSERT INTO attendance (user_id, date, check_in, check_out, hours_worked, status)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, user_id, date, check_in, check_out, hours_worked, status, created_at
            """,
            attendance.user_id, attendance.date, attendance.check_in,
            attendance.check_out, attendance.hours_worked, attendance.status
        )
        return dict(new_attendance)
    finally:
        await conn.close()

@router.get("/attendance", response_model=List[AttendanceResponse])
async def get_attendance(user_id: int = None):
    conn = await get_db_connection()
    try:
        if user_id:
            attendance_records = await conn.fetch("SELECT * FROM attendance WHERE user_id = $1", user_id)
        else:
            attendance_records = await conn.fetch("SELECT * FROM attendance")
        return [dict(a) for a in attendance_records]
    finally:
        await conn.close()

@router.get("/attendance/summary/{user_id}")
async def get_attendance_summary(user_id: int, month: int = None, year: int = None):
    """Returns present_days and total_working_days for a user in a given month/year."""
    conn = await get_db_connection()
    try:
        from datetime import date
        today = date.today()
        m = month or today.month
        y = year or today.year
        records = await conn.fetch(
            "SELECT status FROM attendance WHERE user_id = $1 AND EXTRACT(MONTH FROM date) = $2 AND EXTRACT(YEAR FROM date) = $3",
            user_id, m, y
        )
        total = len(records)
        present = sum(1 for r in records if r["status"] in ("Present", "Late"))
        return {"user_id": user_id, "month": m, "year": y, "total_working_days": total, "present_days": present}
    finally:
        await conn.close()


# Payroll Routes
@router.post("/payroll", response_model=PayrollResponse, status_code=status.HTTP_201_CREATED)
async def create_payroll(payroll: PayrollCreate):
    conn = await get_db_connection()
    try:
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
        return dict(new_payroll)
    finally:
        await conn.close()

@router.get("/payroll", response_model=List[PayrollResponse])
async def get_payroll(user_id: int = None):
    conn = await get_db_connection()
    try:
        if user_id:
            payroll_records = await conn.fetch("SELECT * FROM payroll WHERE user_id = $1", user_id)
        else:
            payroll_records = await conn.fetch("SELECT * FROM payroll")
        return [dict(p) for p in payroll_records]
    finally:
        await conn.close()

# Performance Goals Routes
@router.post("/performance-goals", response_model=PerformanceGoalResponse, status_code=status.HTTP_201_CREATED)
async def create_performance_goal(goal: PerformanceGoalCreate):
    conn = await get_db_connection()
    try:
        new_goal = await conn.fetchrow(
            """
            INSERT INTO performance_goals (user_id, title, description, target_date, status, progress)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, user_id, title, description, target_date, status, progress, created_at
            """,
            goal.user_id, goal.title, goal.description, goal.target_date, goal.status, goal.progress
        )
        return dict(new_goal)
    finally:
        await conn.close()

@router.get("/performance-goals", response_model=List[PerformanceGoalResponse])
async def get_performance_goals(user_id: int = None):
    conn = await get_db_connection()
    try:
        if user_id:
            goals = await conn.fetch("SELECT * FROM performance_goals WHERE user_id = $1", user_id)
        else:
            goals = await conn.fetch("SELECT * FROM performance_goals")
        return [dict(g) for g in goals]
    finally:
        await conn.close()

@router.put("/performance-goals/{id}", response_model=PerformanceGoalResponse)
async def update_performance_goal(id: int, goal: PerformanceGoalCreate):
    conn = await get_db_connection()
    try:
        updated_goal = await conn.fetchrow(
            """
            UPDATE performance_goals 
            SET user_id = $1, title = $2, description = $3, target_date = $4, status = $5, progress = $6
            WHERE id = $7
            RETURNING id, user_id, title, description, target_date, status, progress, created_at
            """,
            goal.user_id, goal.title, goal.description, goal.target_date, goal.status, goal.progress, id
        )
        if not updated_goal:
            raise HTTPException(status_code=404, detail="Performance goal not found")
        return dict(updated_goal)
    finally:
        await conn.close()


# Team Route (for Senior Manager)
@router.get("/team")
async def get_team(manager_id: Optional[int] = None):
    conn = await get_db_connection()
    try:
        if manager_id:
            members = await conn.fetch("SELECT * FROM employees WHERE manager_id = $1", manager_id)
        else:
            members = await conn.fetch("SELECT * FROM employees")

        today = date.today()
        result = []
        for m in members:
            member = dict(m)
            # Attendance today
            att = await conn.fetchrow(
                "SELECT status FROM attendance WHERE user_id = $1 AND date = $2",
                m["user_id"], today
            )
            member["attendance_today"] = att["status"] if att else "Absent"
            # Avg performance (last 5 goals progress)
            goals = await conn.fetch(
                "SELECT progress FROM performance_goals WHERE user_id = $1 ORDER BY created_at DESC LIMIT 5",
                m["user_id"]
            )
            if goals:
                member["performance_avg"] = round(sum(g["progress"] for g in goals) / len(goals), 1)
            else:
                member["performance_avg"] = 0
            result.append(member)
        return result
    finally:
        await conn.close()


# Leave Request Routes
@router.post("/leaves", response_model=LeaveRequestResponse, status_code=status.HTTP_201_CREATED)
async def create_leave_request(leave: LeaveRequestCreate):
    conn = await get_db_connection()
    try:
        row = await conn.fetchrow(
            """
            INSERT INTO leave_requests (user_id, leave_type, start_date, end_date, reason, manager_id)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, user_id, leave_type, start_date, end_date, reason, status, manager_id, created_at
            """,
            leave.user_id, leave.leave_type, leave.start_date, leave.end_date,
            leave.reason, leave.manager_id
        )
        return dict(row)
    finally:
        await conn.close()


@router.get("/leaves", response_model=List[LeaveRequestResponse])
async def get_leave_requests(user_id: Optional[int] = None, manager_id: Optional[int] = None):
    conn = await get_db_connection()
    try:
        if user_id:
            rows = await conn.fetch("SELECT * FROM leave_requests WHERE user_id = $1", user_id)
        elif manager_id:
            rows = await conn.fetch("SELECT * FROM leave_requests WHERE manager_id = $1", manager_id)
        else:
            rows = await conn.fetch("SELECT * FROM leave_requests")
        return [dict(r) for r in rows]
    finally:
        await conn.close()


@router.patch("/leaves/{id}/approve")
async def approve_leave(id: int):
    conn = await get_db_connection()
    try:
        await conn.execute("UPDATE leave_requests SET status = 'Approved' WHERE id = $1", id)
        return {"message": "Leave approved"}
    finally:
        await conn.close()


@router.patch("/leaves/{id}/reject")
async def reject_leave(id: int):
    conn = await get_db_connection()
    try:
        await conn.execute("UPDATE leave_requests SET status = 'Rejected' WHERE id = $1", id)
        return {"message": "Leave rejected"}
    finally:
        await conn.close()
