# FutureHR - AI Powered Human Resource Management System

A complete HR management system with AI-powered features for recruitment, built with modern microservices architecture.

## Features

### HR Management
- Employee Data Management
- Attendance Tracking
- Payroll Management
- Performance Goals & KPIs
- Department & Designation Management

### AI Recruitment
- AI Resume Screening
- AI Candidate Evaluation
- AI Conversational Recruitment Assistant
- AI Voice-Based Candidate Screening

### Multi-Role System
- Admin Dashboard
- HR Recruiter Dashboard
- Employee Dashboard
- Role-Based Access Control (RBAC)

### Other Features
- Dark Mode Toggle
- Responsive Design
- Secure Authentication with Cookies

## System Architecture

FutureHR uses a microservices architecture with an API gateway for routing:

```
        ┌─────────────────┐
        │   Frontend      │ (React + Vite, Port 5173)
        └────────┬────────┘
                 │
                 ▼
        ┌─────────────────┐
        │   API Gateway   │ (FastAPI, Port 8000)
        └────────┬────────┘
                 │
    ┌────────────┬────────────┐
    ▼            ▼            ▼
┌───────┐    ┌───────┐ ┌───────────────┐
│ Auth  │    │ HRMS  │ │AI Recruitment │
│Service│    │Service│ │   Service     │
│(8001) │    │(8002) │ │    (8003)     │
└───────┘    └───────┘ └───────────────┘
```

## Tech Stack

### Frontend
- React 19
- Vite
- React Router
- Tailwind CSS 4.3
- Recharts (Charts)
- Axios (HTTP Client)

### Backend Services
- FastAPI (All Services)
- asyncpg (Async PostgreSQL Driver)
- Python 3.11+
- Google Gemini AI (AI Features)
- httpx (Async HTTP Client for Gateway)

### Database
- PostgreSQL (Single database or separate per service)

## Project Structure

```
FutureHr/
├── frontend/               # React + Vite frontend
│   ├── src/
│   │   ├── assets/         # Icons, images
│   │   ├── components/     # Reusable components
│   │   ├── contexts/       # React contexts (AppContext)
│   │   ├── pages/          # Page components
│   │   └── services/       # API service calls
│   └── package.json
├── services/
│   ├── auth/              # Authentication service (port: 8001)
│   ├── hrms/              # HR Management service (port: 8002)
│   ├── ai-recruitment/    # AI Recruitment service (port: 8003)
│   └── gateway/           # API Gateway (port: 8000)
└── README.md
```

## Role-Based Feature Access

| Feature               | Admin | HR Recruiter | Employee |
|-----------------------|-------|--------------|----------|
| Dashboard             | ✅    | ✅           | ✅       |
| Employees             | ✅    | ❌           | ❌       |
| Attendance            | ✅    | ❌           | ✅       |
| Payroll               | ✅    | ❌           | ✅       |
| Performance           | ✅    | ❌           | ✅       |
| Candidates            | ✅    | ✅           | ❌       |
| Resume Screening      | ✅    | ✅           | ❌       |
| AI Evaluation         | ✅    | ✅           | ❌       |
| Voice Screening       | ✅    | ✅           | ❌       |

## API Endpoints Summary

All API requests go through the Gateway at `http://localhost:8000/api`

### Authentication Service (`/auth/*`)
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `GET /auth/me` - Get current user info

### HR Management Service (`/hrms/*`)
- `GET /hrms/departments` - Get all departments
- `POST /hrms/departments` - Create department
- `GET /hrms/designations` - Get all designations
- `POST /hrms/designations` - Create designation
- `GET /hrms/employees` - Get all employees
- `POST /hrms/employees` - Create employee
- `GET /hrms/attendance` - Get attendance records
- `POST /hrms/attendance` - Create attendance record
- `GET /hrms/payroll` - Get payroll records
- `POST /hrms/payroll` - Create payroll record
- `GET /hrms/performance-goals` - Get performance goals
- `POST /hrms/performance-goals` - Create performance goal

### AI Recruitment Service (`/ai-recruitment/*`)
- `GET /ai-recruitment/candidates` - Get all candidates
- `POST /ai-recruitment/candidates` - Create candidate
- `GET /ai-recruitment/job-descriptions` - Get all job descriptions
- `POST /ai-recruitment/job-descriptions` - Create job description
- `POST /ai-recruitment/resume-screening/{candidateId}/{jobId}` - Screen resume
- `GET /ai-recruitment/resume-screenings` - Get resume screenings
- `POST /ai-recruitment/candidate-evaluation/{candidateId}` - Evaluate candidate
- `GET /ai-recruitment/candidate-evaluations` - Get candidate evaluations
- `POST /ai-recruitment/voice-screening/{candidateId}` - Voice screening
- `GET /ai-recruitment/voice-screenings` - Get voice screenings
- `POST /ai-recruitment/chat` - Chat with AI assistant

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.11+
- PostgreSQL database (local or Neon)
- Google Gemini API key (for AI features)

### Installation & Setup

#### 1. Clone the repository

```bash
git clone <repository-url>
cd FutureHr
```

#### 2. Setup Environment Variables

Each service has a `.env` file. Make sure to update them with your database URLs and API keys!

**Auth Service** (`services/auth/.env`):
```env
DATABASE_URL=postgresql://user:password@host:port/db_name
SECRET_KEY=your-super-secret-key-here-change-me-in-production
```

**HRMS Service** (`services/hrms/.env`):
```env
DATABASE_URL=postgresql://user:password@host:port/db_name
```

**AI Recruitment Service** (`services/ai-recruitment/.env`):
```env
DATABASE_URL=postgresql://user:password@host:port/db_name
GEMINI_API_KEY=your-gemini-api-key-here
```

**Gateway Service** (`services/gateway/.env`):
```env
AUTH_SERVICE_URL=http://localhost:8001
HRMS_SERVICE_URL=http://localhost:8002
AI_RECRUITMENT_SERVICE_URL=http://localhost:8003
```

**Frontend** (`frontend/.env`):
```env
VITE_GATEWAY_URL=http://localhost:8000/api
```

#### 3. Install dependencies for each service

```bash
# Auth Service
cd services/auth
python -m venv venv
.\venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt

# HRMS Service
cd ../hrms
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt

# AI Recruitment Service
cd ../ai-recruitment
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt

# Gateway Service
cd ../gateway
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt

# Frontend
cd ../../frontend
npm install
```

#### 4. Initialize the Databases

Each service's `database.py` has the schema. You can use the service's `/docs` endpoint to test endpoints which will create tables automatically, or run the initialization SQL manually.

For example, to initialize auth service tables:
1. Start the auth service
2. Visit `http://localhost:8001/docs`
3. Try the register endpoint - this will create all required tables

#### 5. Start the services

**Important**: Run each service in a **separate terminal**!

```bash
# Terminal 1: Auth service (port 8001)
cd services/auth
.\venv\Scripts\activate
python run.py

# Terminal 2: HRMS service (port 8002)
cd services/hrms
.\venv\Scripts\activate
python run.py

# Terminal 3: AI Recruitment service (port 8003)
cd services/ai-recruitment
.\venv\Scripts\activate
python run.py

# Terminal 4: Gateway service (port 8000)
cd services/gateway
.\venv\Scripts\activate
python run.py

# Terminal 5: Frontend (port 5173)
cd frontend
npm run dev
```

Now you can access:
- Frontend: `http://localhost:5173`
- Gateway API: `http://localhost:8000`
- Auth API Docs: `http://localhost:8001/docs`
- HRMS API Docs: `http://localhost:8002/docs`
- AI Recruitment API Docs: `http://localhost:8003/docs`

## Database Schema Overview

### Auth Service Tables
- `users`: Stores user information (email, hashed_password, first_name, last_name, role, etc.)

### HRMS Service Tables
- `departments`: Department information
- `designations`: Designation information
- `employees`: Employee records (user_id, department_id, designation_id, etc.)
- `attendance`: Attendance records
- `payroll`: Payroll records
- `performance_goals`: Performance goals and KPIs

### AI Recruitment Service Tables
- `candidates`: Candidate profiles
- `job_descriptions`: Job descriptions
- `resume_screenings`: AI resume screening results
- `candidate_evaluations`: AI candidate evaluations
- `voice_screenings`: AI voice screening results

## Troubleshooting Common Issues

### 1. "Too little data for declared Content-Length" in Gateway
**Cause**: The gateway was trying to re-encode form data, which caused issues with multipart forms.
**Fix**: The gateway now forwards the raw request body directly. Make sure your gateway is updated.

### 2. Pydantic Validation Errors: "Field required"
**Cause**: The backend was returning asyncpg Record objects instead of dicts.
**Fix**: All backend services now convert Records to dicts before returning them to Pydantic.

### 3. Cookies Not Saving After Login
**Cause**: The gateway wasn't properly forwarding the Set-Cookie headers.
**Fix**: The gateway now copies all Set-Cookie headers from the backend services to the client response.

### 4. Database Connection Errors
**Check**:
1. Is PostgreSQL running?
2. Is the DATABASE_URL in .env correct?
3. Are the database credentials correct?
4. Does the database user have the right permissions?

### 5. AI Features Not Working
**Check**:
1. Do you have a valid GEMINI_API_KEY in ai-recruitment/.env?
2. Is your Google Cloud account active?
3. Do you have internet access to reach the Gemini API?

## Key Fixes & Improvements Made
- Fixed backend asyncpg Record → dict conversion for Pydantic serialization
- Fixed gateway proxy to forward raw request bodies and properly copy cookies
- Removed all dummy data from frontend, all data fetched from real APIs
- Added loading and empty states to all frontend pages
- Updated login form to only show role selector during signup
- Added show/hide password toggle and confirm password field to login/signup forms
- Dashboard now shows dynamic bar and pie charts using real API data

## Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

MIT

## Acknowledgments
- FastAPI for the amazing API framework
- React and Vite for the frontend
- Google Gemini AI for AI features
- Tailwind CSS for styling




.\venv\scripts\activate
python run.py