# FutureHR — AI-Powered Human Resource Management System

🚀 **Live Demo:** [https://future-hr.vercel.app](https://future-hr.vercel.app)

A complete, production-ready HR platform combining employee management with an end-to-end AI recruitment pipeline. Built on a microservices architecture with role-based access control for every user type.

---

## Table of Contents

- [Features](#features)
- [System Architecture](#system-architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Recruitment Pipeline](#recruitment-pipeline)
- [Email System](#email-system)
- [Role-Based Access Control](#role-based-access-control)
- [API Reference](#api-reference)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Schema](#database-schema)
- [Troubleshooting](#troubleshooting)

---

## Features

### HR Management
- Employee records, departments & designations
- Attendance tracking with daily logs
- Payroll generation and history
- Performance goals & KPI tracking
- Manager assignment and team management

### AI Recruitment Pipeline
- **Resume Screening** — Gemini AI extracts skills, scores match (0–100), flags strengths/gaps
- **Per-Candidate Voice Questions** — Questions generated from each candidate's own resume (unique per applicant, never repeated)
- **Voice Interview** — Browser-based voice recording with live speech-to-text transcript; transcript persists through pauses
- **Q&A Transcript** — Full question/answer pairs visible to HR on the screening page
- **HR Manual Scoring** — HR enters communication & confidence scores (0–100) manually; no AI score imposed
- **Hiring Decision** — HR decides Hire / Reject / Re-interview; hired status shown prominently; no action buttons shown after decision
- **AI Evaluation Reports** — Comprehensive strengths, weaknesses, skill gaps per candidate
- **Conversational AI Assistant** — Chat with the AI recruiter for candidate insights

### Candidate Portal (Login Required)
- Account creation with welcome email
- Browse open job positions (requires login)
- Multi-step application form with resume upload
- Real-time application status tracking
- Voice interview via unique invite link

### Email Notifications
- Welcome email on candidate sign-up
- Voice screening invite with one-click interview link
- Employee credentials email when hired
- Login security notification (opt-in)
- Password reset (framework ready)

### Multi-Role System
- **Management Admin** — Full system access
- **HR Recruiter** — Recruitment pipeline, employees, attendance, performance
- **Senior Manager** — Team view, leave approvals, team performance
- **Employee** — Personal dashboard, payroll, attendance, leave requests
- **Candidate** — Careers portal, applications, voice interview

### UI & Security
- Dark mode toggle
- Fully responsive design
- JWT authentication with HTTP-only cookies
- Role-based route guards (frontend + backend)
- Open job listings gated behind candidate login

---

## System Architecture

```
        ┌─────────────────────────┐
        │        Frontend         │
        │   React + Vite (5173)   │
        └────────────┬────────────┘
                     │ All requests → /api/*
                     ▼
        ┌─────────────────────────┐
        │       API Gateway       │
        │     FastAPI  (8000)     │
        └──────┬─────────┬────────┘
               │         │          \
               ▼         ▼           ▼
        ┌──────────┐ ┌────────┐ ┌───────────────┐
        │   Auth   │ │  HRMS  │ │ AI Recruitment│
        │ Service  │ │Service │ │    Service    │
        │  (8001)  │ │ (8002) │ │    (8003)     │
        └──────────┘ └────────┘ └───────────────┘
               │                        │
               └────────────────────────┘
                    PostgreSQL (NeonDB)
```

---

## Tech Stack

### Frontend
| Library | Purpose |
|---|---|
| React 19 + Vite | UI framework & build tool |
| React Router v6 | Client-side routing with route guards |
| Tailwind CSS 4.3 | Utility-first styling |
| Axios | HTTP client with JWT interceptors |
| Recharts | Dashboard charts |
| Web Speech API | Live voice transcription in browser |

### Backend Services
| Library | Purpose |
|---|---|
| FastAPI | All four backend services |
| asyncpg | Async PostgreSQL driver |
| Python 3.11+ | Runtime |
| Google Gemini 2.0 Flash | Resume analysis, question generation, evaluation |
| httpx | Async HTTP between services |
| pydantic-settings | Typed config from `.env` |

### Infrastructure
| Component | Detail |
|---|---|
| Database | PostgreSQL via NeonDB (serverless) |
| Frontend hosting | Vercel |
| Backend hosting | Render (one service per instance) |

---

## Project Structure

```
FutureHr/
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── ai/               # VoiceRecorder, MatchScoreBadge, SkillsAnalysis
│       │   └── common/           # DataTable, LoadingSpinner, etc.
│       ├── contexts/             # AppContext (auth state, toasts)
│       ├── hooks/                # useApi, useAuth, useTheme, useToast
│       ├── pages/
│       │   ├── admin/            # Employees, Payroll, Attendance, Performance, Settings
│       │   ├── careers/          # CandidateLogin, JobListings, ApplicationForm,
│       │   │                     #   ApplicationStatus, VoiceInterview
│       │   ├── employee/         # Attendance, Payroll, Goals, LeaveRequest
│       │   ├── hr/               # Candidates, Jobs, ResumeScreening, VoiceScreening
│       │   └── manager/          # MyTeam, LeaveRequests, TeamPerformance
│       └── services/
│           ├── api.js            # All API calls + Axios interceptors
│           └── aiRecruitmentService.js
│
└── services/
    ├── auth/
    │   └── app/
    │       ├── routes/auth_routes.py
    │       ├── utils/
    │       │   ├── security.py         # JWT, password hashing
    │       │   └── mail_service.py     # All outgoing emails (one function per purpose)
    │       └── config.py
    ├── hrms/
    │   └── app/
    │       └── routes/hrms_routes.py
    ├── ai-recruitment/
    │   └── app/
    │       ├── routes/ai_recruitment_routes.py   # All recruitment APIs
    │       └── utils/
    │           ├── ai_service.py                 # Gemini calls
    │           └── text_matcher.py
    └── gateway/
        └── app/main.py                           # Reverse proxy
```

---

## Recruitment Pipeline

The full candidate journey from application to hire:

```
Candidate signs up → Browses jobs (login required)
        ↓
Submits application + resume PDF
        ↓
AI Resume Screening (Gemini scores match 0-100)
        ↓
HR reviews resume screening → Approves / Rejects
        ↓
HR sends Voice Screening invite (email with unique link)
        ↓
Candidate completes voice interview in browser
  • Questions generated from candidate's own resume (unique per applicant)
  • Live speech-to-text transcript visible during recording
  • Transcript persists through pauses and silence
  • Previous Q&A shown as candidate progresses
        ↓
HR reviews full Q&A transcript on Voice Screening page
HR manually scores: Communication (0-100) + Confidence (0-100)
        ↓
HR decides: Hire / Reject / Re-interview
  • Hire → employee account created, credentials emailed, "✅ Hired" shown
  • Reject → rejection status shown, no action buttons remain
```

---

## Email System

All auth service emails live in `services/auth/app/utils/mail_service.py`.
Each email type has its own function — easy to find, edit, or disable independently:

| Function | Trigger |
|---|---|
| `send_welcome_email` | Candidate creates account |
| `send_login_notification` | User signs in (opt-in — call from login route to enable) |
| `send_employee_credentials` | Candidate is hired — delivers temp password to new employee |
| `send_password_reset` | Password reset request (framework ready) |
| `send_account_deactivated` | Admin disables an account |

AI Recruitment service emails (`ai_recruitment_routes.py`):
- Voice screening invite with one-click interview link and access code

All emails use non-blocking `BackgroundTasks` so API responses are never delayed by SMTP.

**Gmail App Password setup:**
1. Enable 2-Step Verification on your Google account
2. Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. Generate a 16-character app password
4. Paste it into `SMTP_PASSWORD` / `SMTP_USERNAME` in `.env` (spaces optional)

---

## Role-Based Access Control

### Staff roles (login via `/login`)

| Feature | Admin | HR Recruiter | Senior Manager | Employee |
|---|:---:|:---:|:---:|:---:|
| Dashboard | ✅ | ✅ | ✅ | ✅ |
| Employees | ✅ | ✅ | ❌ | ❌ |
| Departments | ✅ | ❌ | ❌ | ❌ |
| Attendance | ✅ | ✅ | ❌ | ✅ (own) |
| Payroll | ✅ | ❌ | ❌ | ✅ (own) |
| Performance | ✅ | ✅ | ✅ | ✅ (own) |
| Leave Requests | ❌ | ❌ | ✅ | ✅ |
| Candidates | ✅ | ✅ | ❌ | ❌ |
| Resume Screening | ✅ | ✅ | ❌ | ❌ |
| Voice Screening | ✅ | ✅ | ❌ | ❌ |
| AI Evaluation | ✅ | ✅ | ❌ | ❌ |
| Jobs Management | ✅ | ✅ | ❌ | ❌ |
| Admin Settings | ✅ | ❌ | ❌ | ❌ |
| Recruitment Analytics | ✅ | ❌ | ❌ | ❌ |

### Candidate portal (login via `/careers/login`)

| Page | Requires login |
|---|:---:|
| `/careers` (home) | ✅ |
| `/careers/jobs` | ✅ |
| `/careers/apply/:jobId` | ✅ |
| `/careers/status` | ✅ |
| `/careers/voice-interview/:code` | ✅ |

---

## API Reference

All requests go through the gateway at `http://localhost:8000/api`.

### Auth Service `/api/auth`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Register new user (sends welcome email for candidates) |
| POST | `/auth/login` | Login — returns JWT + sets HTTP-only cookie |
| POST | `/auth/logout` | Clear auth cookie |
| GET | `/auth/users` | List users (optional `?role=` filter) |
| POST | `/auth/promote-employee` | Promote candidate to Employee on hire + sends credentials email |

### HRMS Service `/api/hrms`

| Method | Endpoint | Description |
|---|---|---|
| GET/POST | `/hrms/departments` | List / create departments |
| GET/POST | `/hrms/designations` | List / create designations |
| GET/POST | `/hrms/employees` | List / create employees |
| GET/POST | `/hrms/attendance` | Attendance records |
| GET/POST | `/hrms/payroll` | Payroll records |
| POST | `/hrms/payroll/generate` | Generate payroll for a period |
| GET/POST | `/hrms/performance-goals` | Performance goals |
| GET/POST | `/hrms/leave-requests` | Leave requests |

### AI Recruitment Service `/api/ai-recruitment`

| Method | Endpoint | Description |
|---|---|---|
| GET/POST | `/candidates` | Candidate profiles |
| GET/POST/PUT/DELETE | `/jobs` | Job postings |
| POST | `/applications` | Submit application + triggers resume screening |
| GET | `/applications` | List all applications |
| PUT | `/applications/{id}/status` | Update application status |
| GET | `/resume-screenings` | All resume screening results |
| GET | `/applications/{id}/resume-screening` | Single resume screening |
| POST | `/applications/{id}/send-voice-invite` | Send invite email + generate unique code |
| GET | `/voice-screening/validate/{code}` | Validate code, return per-candidate questions |
| POST | `/applications/{id}/voice-answers` | Submit voice answers (stores transcript) |
| GET | `/voice-screenings` | All voice screenings with full Q&A transcripts |
| PUT | `/voice-screenings/{id}/score` | HR manually sets communication + confidence scores |
| POST | `/applications/{id}/hire` | Hire candidate → creates employee account |
| POST | `/applications/{id}/evaluate` | Generate full evaluation report |
| GET | `/candidate-evaluations` | All evaluation reports |
| POST | `/chat` | Chat with recruitment assistant |
| GET/PUT | `/settings` | SMTP / system settings |

---

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.11+
- PostgreSQL database (local or [NeonDB](https://neon.tech))
- Google Gemini API key — [get one here](https://aistudio.google.com/app/apikey)
- Gmail App Password — [create one here](https://myaccount.google.com/apppasswords)

### 1. Clone the repository

```bash
git clone https://github.com/rajnishkumar1906/FutureHr.git
cd FutureHr
```

### 2. Set up environment variables

#### `services/auth/.env`
```env
DATABASE_URL=postgresql://user:password@host:port/dbname?sslmode=require
JWT_SECRET_KEY=your-secret-key-here
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Gmail SMTP (welcome & credentials emails)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your@gmail.com
SMTP_PASSWORD=your-16-char-app-password
```

#### `services/hrms/.env`
```env
DATABASE_URL=postgresql://user:password@host:port/dbname?sslmode=require
INTERNAL_API_KEY=futurehr-internal-secret
```

#### `services/ai-recruitment/.env`
```env
DATABASE_URL=postgresql://user:password@host:port/dbname?sslmode=require
GEMINI_API_KEY=AIza...your-gemini-key
JWT_SECRET_KEY=your-secret-key-here
AUTH_SERVICE_URL=http://localhost:8001
HRMS_SERVICE_URL=http://localhost:8002

# Gmail SMTP (voice invite emails)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASSWORD=your-16-char-app-password
SMTP_FROM=your@gmail.com

FRONTEND_URL=http://localhost:5173
```

#### `services/gateway/.env`
```env
AUTH_SERVICE_URL=http://localhost:8001
HRMS_SERVICE_URL=http://localhost:8002
AI_RECRUITMENT_SERVICE_URL=http://localhost:8003
```

#### `frontend/.env`
```env
VITE_API_URL=http://localhost:8000
```

### 3. Install dependencies

```bash
# Backend services
for service in auth hrms ai-recruitment gateway; do
  cd services/$service
  python -m venv venv
  source venv/bin/activate        # Windows: .\venv\Scripts\activate
  pip install -r requirements.txt
  cd ../..
done

# Frontend
cd frontend && npm install
```

### 4. Start all services

Run each in a **separate terminal**:

```bash
# Terminal 1 — Auth service (port 8001)
cd services/auth && .\venv\Scripts\activate && python run.py

# Terminal 2 — HRMS service (port 8002)
cd services/hrms && .\venv\Scripts\activate && python run.py

# Terminal 3 — AI Recruitment service (port 8003)
cd services/ai-recruitment && .\venv\Scripts\activate && python run.py

# Terminal 4 — API Gateway (port 8000)
cd services/gateway && .\venv\Scripts\activate && python run.py

# Terminal 5 — Frontend (port 5173)
cd frontend && npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

| URL | Purpose |
|---|---|
| http://localhost:5173 | Frontend app |
| http://localhost:8000 | API Gateway |
| http://localhost:8001/docs | Auth API docs (Swagger) |
| http://localhost:8002/docs | HRMS API docs |
| http://localhost:8003/docs | AI Recruitment API docs |

---

## Environment Variables

### Auth Service

| Variable | Required | Default | Description |
|---|:---:|---|---|
| `DATABASE_URL` | ✅ | — | PostgreSQL connection string |
| `JWT_SECRET_KEY` | ✅ | — | Token signing secret |
| `JWT_ALGORITHM` | | `HS256` | JWT algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | | `30` | Token lifetime |
| `SMTP_SERVER` | | `smtp.gmail.com` | SMTP host |
| `SMTP_PORT` | | `587` | SMTP port |
| `SMTP_USERNAME` | | — | Gmail address |
| `SMTP_PASSWORD` | | — | Gmail App Password (16 chars) |

### AI Recruitment Service

| Variable | Required | Default | Description |
|---|:---:|---|---|
| `DATABASE_URL` | ✅ | — | PostgreSQL connection string |
| `GEMINI_API_KEY` | ✅ | — | Google Gemini key (`AIza...`) |
| `JWT_SECRET_KEY` | ✅ | — | Must match auth service |
| `AUTH_SERVICE_URL` | ✅ | — | e.g. `http://localhost:8001` |
| `HRMS_SERVICE_URL` | ✅ | — | e.g. `http://localhost:8002` |
| `SMTP_HOST` | | `smtp.gmail.com` | SMTP host |
| `SMTP_PORT` | | `587` | SMTP port |
| `SMTP_USER` | | — | Gmail address |
| `SMTP_PASSWORD` | | — | Gmail App Password |
| `SMTP_FROM` | | `SMTP_USER` | Sender address |
| `FRONTEND_URL` | | `http://localhost:5173` | Used in invite links |

---

## Database Schema

### Auth Service
| Table | Key Columns |
|---|---|
| `users` | id, email, hashed_password, first_name, last_name, role, is_active, created_at |

### HRMS Service
| Table | Key Columns |
|---|---|
| `departments` | id, name, description |
| `designations` | id, name, department_id |
| `employees` | id, user_id, department_id, designation_id, manager_id, date_of_joining |
| `attendance` | id, employee_id, date, check_in, check_out, status |
| `payroll` | id, employee_id, month, year, basic_salary, deductions, net_salary |
| `performance_goals` | id, employee_id, title, target, current_value, status |
| `leave_requests` | id, employee_id, type, from_date, to_date, status |

### AI Recruitment Service
| Table | Key Columns |
|---|---|
| `candidates` | id, first_name, last_name, email, resume_text, skills, status |
| `jobs` | id, title, department, description, requirements, status |
| `applications` | id, candidate_id, job_id, status, voice_screening_code, application_form_data (includes per-candidate `voice_questions` JSON) |
| `resume_screenings` | id, application_id, candidate_score, skills_match, recommendation, analysis |
| `voice_questions` | id, job_id, questions (JSON) — default fallback questions per job |
| `voice_answers` | id, application_id, question_index, answer — candidate's transcribed responses |
| `voice_screenings` | id, application_id, communication_score, confidence_score, recommendation, analysis — HR-scored |
| `candidate_evaluations` | id, application_id, summary, strengths, weaknesses, skill_gaps, recommendation |
| `system_settings` | key, value — SMTP config editable via Admin → Settings |

---

## Troubleshooting

### Emails not sending
1. `SMTP_USERNAME` / `SMTP_PASSWORD` must be a **Gmail App Password** — not your Gmail login password
2. Generate one at [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords) (2FA must be enabled)
3. The invite API returns `{ email_sent: true/false, email_error: "..." }` — check the HR toast for the exact error message
4. Trailing spaces in `.env` values are stripped automatically

### Voice transcript disappears on pause
The `VoiceRecorder` now accumulates finalized speech and auto-restarts recognition after pauses. Pull the latest version.

### All voice screening scores show 50
AI scoring has been removed. HR now enters scores manually in the "Score & Review" modal on the Voice Screening page.

### Open jobs visible without login
`/careers` and `/careers/jobs` require candidate authentication. Users are redirected to `/careers/login` with the original URL preserved as `?redirect=`.

### Pydantic validation errors ("Field required")
asyncpg returns `Record` objects. All routes call `dict(record)` before returning. Add the same conversion to any new routes you write.

### Cookie not set after login (cross-origin)
Set `COOKIE_SECURE=true` in auth `.env` when frontend and backend are on different domains (e.g. Vercel + Render). This enables `SameSite=None; Secure`.

### Database connection errors
1. Confirm `DATABASE_URL` is correct in the relevant service's `.env`
2. For NeonDB append `?sslmode=require&channel_binding=require`
3. Confirm the database user has `CREATE TABLE` permissions

### AI features returning fallback / generic results
1. `GEMINI_API_KEY` must start with `AIza` — keys starting with `AQ.` are invalid
2. Test at [aistudio.google.com](https://aistudio.google.com)
3. Check service logs for `Gemini JSON generation failed`

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit with a descriptive message
4. Push and open a Pull Request

---

## License

MIT

---

## Acknowledgments

- [FastAPI](https://fastapi.tiangolo.com) — async Python API framework
- [React](https://react.dev) + [Vite](https://vitejs.dev) — frontend
- [Google Gemini](https://ai.google.dev) — resume & voice analysis
- [Tailwind CSS](https://tailwindcss.com) — styling
- [NeonDB](https://neon.tech) — serverless PostgreSQL
