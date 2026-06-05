from pydantic import BaseModel
from datetime import datetime, date, time
from typing import Optional, List

class DepartmentBase(BaseModel):
    name: str
    description: Optional[str] = None

class DepartmentCreate(DepartmentBase):
    pass

class DepartmentResponse(DepartmentBase):
    id: int
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
    department_id: int
    designation_id: int
    date_of_joining: date
    phone: str
    gender: Optional[str] = None

class EmployeeCreate(EmployeeBase):
    pass

class EmployeeResponse(EmployeeBase):
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
