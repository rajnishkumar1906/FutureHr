from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, Float, Text, Date, Time
from ..database import Base
from datetime import datetime

class Department(Base):
    __tablename__ = "departments"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    description = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

class Designation(Base):
    __tablename__ = "designations"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, unique=True, index=True)
    description = Column(Text)
    department_id = Column(Integer, ForeignKey("departments.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

class Employee(Base):
    __tablename__ = "employees"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, unique=True)
    department_id = Column(Integer, ForeignKey("departments.id"))
    designation_id = Column(Integer, ForeignKey("designations.id"))
    date_of_joining = Column(Date)
    phone = Column(String)
    address = Column(Text)
    date_of_birth = Column(Date)
    gender = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

class Attendance(Base):
    __tablename__ = "attendance"
    
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"))
    date = Column(Date)
    check_in = Column(Time)
    check_out = Column(Time)
    hours_worked = Column(Float)
    status = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

class Payroll(Base):
    __tablename__ = "payroll"
    
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"))
    month = Column(Integer)
    year = Column(Integer)
    basic_salary = Column(Float)
    allowances = Column(Float)
    deductions = Column(Float)
    net_salary = Column(Float)
    status = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

class PerformanceGoal(Base):
    __tablename__ = "performance_goals"
    
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"))
    title = Column(String)
    description = Column(Text)
    target_date = Column(Date)
    status = Column(String)
    progress = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)
