from pydantic import BaseModel
from datetime import datetime, date, time
from typing import Optional, List

class DepartmentBase(BaseModel):
    name: str
    description: Optional[str] = None
    manager_id: Optional[int] = None

class DepartmentCreate(DepartmentBase):
    pass

class DepartmentResponse(DepartmentBase):
    id: int
    manager_id: Optional[int] = None
    created_at: datetime
    class Config:
        from_attributes = True

class DesignationBase(BaseModel):
    title: str
    description: Optional[str] = None
    department_id: int

class DesignationCreate(DesignationBase):
    pass

class DesignationResponse(DesignationBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

class EmployeeBase(BaseModel):
    user_id: int
    email: str
    first_name: Optional[str] = ''
    last_name: Optional[str] = ''
    department_id: Optional[int] = None
    designation_id: Optional[int] = None
    manager_id: Optional[int] = None
    date_of_joining: Optional[date] = None
    phone: Optional[str] = None
    gender: Optional[str] = None

class EmployeeCreate(EmployeeBase):
    pass

class EmployeeResponse(EmployeeBase):
    created_at: datetime
    class Config:
        from_attributes = True

class TeamMemberResponse(BaseModel):
    user_id: int
    email: str
    first_name: Optional[str] = ''
    last_name: Optional[str] = ''
    department_id: Optional[int] = None
    designation_id: Optional[int] = None
    manager_id: Optional[int] = None
    date_of_joining: Optional[date] = None
    phone: Optional[str] = None
    gender: Optional[str] = None
    attendance_today: Optional[str] = None
    performance_avg: Optional[float] = None
    created_at: datetime
    class Config:
        from_attributes = True

class LeaveRequestBase(BaseModel):
    user_id: int
    leave_type: str
    start_date: date
    end_date: date
    reason: Optional[str] = None
    manager_id: Optional[int] = None

class LeaveRequestCreate(LeaveRequestBase):
    pass

class LeaveRequestResponse(LeaveRequestBase):
    id: int
    status: str
    created_at: datetime
    class Config:
        from_attributes = True

class AttendanceBase(BaseModel):
    user_id: int
    date: date
    check_in: Optional[time] = None
    check_out: Optional[time] = None
    hours_worked: Optional[float] = None
    status: str = "Present"

class AttendanceCreate(AttendanceBase):
    pass

class AttendanceResponse(AttendanceBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

class PayrollBase(BaseModel):
    user_id: int
    month: int
    year: int
    basic_salary: float
    allowances: float = 0.0
    deductions: float = 0.0
    status: str = "Pending"

class PayrollCreate(PayrollBase):
    pass

class PayrollResponse(PayrollBase):
    id: int
    net_salary: float
    created_at: datetime
    class Config:
        from_attributes = True

class PerformanceGoalBase(BaseModel):
    user_id: int
    title: str
    description: Optional[str] = None
    target_date: date
    status: str = "Not Started"
    progress: int = 0

class PerformanceGoalCreate(PerformanceGoalBase):
    pass

class PerformanceGoalResponse(PerformanceGoalBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True
