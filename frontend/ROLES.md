# FutureHR - Role Features

This document explains what each user role can do in FutureHR.

## 1. Admin
The Admin has full access to all features:

### Dashboard
- See total employees
- See present today
- See new candidates
- See payroll processed
- Employee growth chart
- Employee status pie chart

### Pages Accessible:
- Dashboard
- Employees
- Attendance
- Payroll
- Performance
- Candidates
- Resume Screening
- AI Evaluation
- Voice Screening

## 2. HR Recruiter
HR Recruiter focuses on hiring and candidate management:

### Dashboard
- See total candidates
- See screening done
- See interviews scheduled
- See offers accepted

### Pages Accessible:
- Dashboard
- Candidates
- Resume Screening
- AI Evaluation
- Voice Screening

## 3. Employee
Employee uses it for personal HR tasks:

### Dashboard
- See attendance this month
- See leaves remaining
- See pending tasks
- See performance score

### Pages Accessible:
- Dashboard
- Attendance
- Payroll
- Performance

---

## How to Run the App

### Frontend (React + Taro + Tailwind)
1. Go to frontend folder: `cd frontend`
2. Install dependencies: `npm install`
3. Run dev server: `npm run dev`
4. Open browser at the URL shown (usually http://localhost:5173)

### Backend Microservices
Each microservice runs independently:

1. Go to service folder (e.g., `cd services/auth`)
2. Create venv (if not present): `python -m venv venv`
3. Activate venv:
   - Windows: `venv\Scripts\activate`
   - Mac/Linux: `source venv/bin/activate`
4. Install requirements: `pip install -r requirements.txt`
5. Run service: `python run.py`

---

## How to Test
1. Open login page
2. Sign up or log in as any role
3. Try the dark mode toggle (top-right after login)
4. Use sidebar to navigate
