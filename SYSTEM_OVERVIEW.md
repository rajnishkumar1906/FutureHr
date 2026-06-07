# FutureHR — System Overview & User Flow Diagrams

This document explains how every part of FutureHR works and shows the complete journey for each user role.

---

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Technology Stack](#technology-stack)
3. [User Roles](#user-roles)
4. [Candidate Flow](#candidate-flow)
5. [HR Recruiter Flow](#hr-recruiter-flow)
6. [Senior Manager Flow](#senior-manager-flow)
7. [Employee Flow](#employee-flow)
8. [Management Admin Flow](#management-admin-flow)
9. [How Services Talk to Each Other](#how-services-talk-to-each-other)
10. [Database Tables at a Glance](#database-tables-at-a-glance)
11. [Environment Variables Reference](#environment-variables-reference)

---

## System Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        BROWSER / CLIENT                          │
│              React + Vite  (http://localhost:5173)               │
│         Deployed on Vercel  (https://your-app.vercel.app)        │
└─────────────────────────────┬────────────────────────────────────┘
                              │  All requests → /api/*
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│                      API GATEWAY  :8000                          │
│   FastAPI reverse-proxy — routes, strips /api, forwards cookies  │
└──────────┬────────────────┬──────────────────┬───────────────────┘
           │                │                  │
     /api/auth/*      /api/hrms/*     /api/ai-recruitment/*
           │                │                  │
           ▼                ▼                  ▼
┌─────────────────┐ ┌──────────────┐ ┌────────────────────────┐
│  Auth Service   │ │ HRMS Service │ │  AI Recruitment Service │
│  FastAPI :8001  │ │ FastAPI :8002│ │    FastAPI :8003        │
│                 │ │              │ │                         │
│ • Login/Logout  │ │ • Employees  │ │ • Jobs                  │
│ • Register      │ │ • Departments│ │ • Applications          │
│ • JWT cookies   │ │ • Attendance │ │ • Resume Screening (AI) │
│ • User profiles │ │ • Payroll    │ │ • Voice Interviews (AI) │
│ • Role mgmt     │ │ • Performance│ │ • Candidate Evaluations │
└────────┬────────┘ └──────┬───────┘ └───────────┬────────────┘
         │                 │                      │
         └─────────────────┴──────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────────┐
│                  NeonDB (PostgreSQL)                              │
│          Hosted on Neon — 3 logical database schemas             │
└──────────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────────┐
│                  Google Gemini AI  (gemini-2.0-flash)            │
│   Resume analysis · Voice answer scoring · Recruiter chatbot     │
└──────────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React 19 + Vite | UI framework |
| Styling | Tailwind CSS 4 | Utility-first CSS |
| Routing | React Router v6 | Client-side routing |
| HTTP client | Axios | API calls with cookie support |
| Auth | JWT in HttpOnly cookies | Secure session management |
| Gateway | FastAPI + httpx | Reverse proxy |
| Backend services | FastAPI (×3) | Business logic APIs |
| Database driver | asyncpg | Async PostgreSQL |
| Database | NeonDB (PostgreSQL) | Persistent storage |
| AI | Google Gemini 2.0 Flash | Resume/voice AI analysis |
| Email | Gmail SMTP + App Password | Notifications |
| Deployment (FE) | Vercel | Frontend hosting |
| Deployment (BE) | Render (3 separate services) | Backend hosting |

---

## User Roles

| Role | Portal URL | What they do |
|---|---|---|
| **Management Admin** | `/admin` | Manages users, departments, employees, sends org-wide emails |
| **HR Recruiter** | `/login` → `/dashboard` | Posts jobs, screens resumes, runs voice interviews, hires |
| **Senior Manager** | `/login` → `/dashboard` | Reviews team performance, approves goals |
| **Employee** | `/login` → `/dashboard` | Views own attendance, payroll, performance goals |
| **Candidate** | `/careers/login` | Applies for jobs, tracks status, does voice interview |

---

## Candidate Flow

A candidate goes from discovering a job to getting hired (or rejected) entirely through the public Careers portal.

```mermaid
flowchart TD
    A([🌐 Visits /careers/jobs]) --> B[Browses open job listings]
    B --> C{Already registered?}
    C -- No --> D[Signs up at /careers/login]
    C -- Yes --> E[Logs in at /careers/login]
    D --> E

    E --> F[Clicks Apply on a job]
    F --> G[Fills ApplicationForm\n name · phone · cover letter · resume PDF]
    G --> H[Submits application]

    H --> I[(Application saved\nstatus = Applied)]
    I --> J[AI immediately screens resume\nin background]

    J --> K{Gemini AI Result}

    K -- Strong Hire --> L[Status → Voice Screening Required\nEmail sent with voice link]
    K -- Hire / Consider --> M[Status → Resume Screened\nHR reviews manually]
    K -- Reject --> N[Status → Rejected\nEmail notification sent]

    M --> O{HR Decision}
    O -- Approve --> L
    O -- Reject --> N

    L --> P[Candidate visits My Applications\nsees Action Needed badge]
    P --> Q[Clicks Start Voice Interview]
    Q --> R[Answers 10 AI-generated questions\nvia microphone in browser]

    R --> S[AI evaluates communication\nconfidence · answers]
    S --> T{Voice Score}

    T -- Good --> U[HR reviews evaluation\ncan Hire candidate]
    T -- Poor --> N

    U --> V{HR clicks Hire}
    V --> W[Candidate's account role\nupdated to Employee]
    W --> X[Welcome email sent]
    X --> Y([🎉 Candidate logs in\nat /login as Employee])

    N --> Z([📧 Rejection email received\nEncouraged to reapply])
```

### Candidate: Key Pages

| Page | URL | What happens |
|---|---|---|
| Job listings | `/careers/jobs` | Browse all open positions |
| Apply | `/careers/apply/:jobId` | Upload resume + fill form |
| Login / Sign up | `/careers/login` | Candidate-only auth |
| My Applications | `/careers/status` | Step tracker, voice interview link |
| Voice Interview | `/careers/voice-interview/:code` | Record answers to 10 AI questions |

---

## HR Recruiter Flow

HR Recruiters manage the full recruitment pipeline — from posting jobs to making the final hire decision.

```mermaid
flowchart TD
    A([🔑 HR logs in at /login]) --> B[HR Dashboard\nsees stats & recent activity]

    B --> C{What does HR want to do?}

    C --> D[📋 Post a Job]
    C --> E[👥 Review Candidates]
    C --> F[🔍 Resume Screening]
    C --> G[🎙️ Voice Screening]
    C --> H[🤖 AI Evaluation]
    C --> I[✉️ Send Email]

    D --> D1[Fills job form\ntitle · dept · salary · positions · description · requirements]
    D1 --> D2[(Job saved in DB\nstatus = Open)]
    D2 --> D3[Job appears on /careers/jobs\nfor candidates to apply]

    E --> E1[Views all candidates\nwith skills · status · score]
    E1 --> E2{Action?}
    E2 --> E3[View resume screening result]
    E2 --> E4[Delete application → rejection email sent]

    F --> F1[Views AI-screened resumes]
    F1 --> F2[Sees extracted:\n• Candidate name & email\n• Top 5 skills with scores\n• All projects + descriptions\n• Strengths · Weaknesses · Gaps\n• AI recommendation %]
    F2 --> F3{HR Decision}
    F3 -- Approve --> F4[Status → Voice Screening Required\nCandidate receives email with link]
    F3 -- Reject --> F5[Status → Rejected\nCandidate receives rejection email]
    F3 -- Send Invite --> F4

    G --> G1[Views voice screening results\nper candidate]
    G1 --> G2[Sees communication score\nconfidence score · AI analysis]
    G2 --> G3{Hire?}
    G3 -- Yes --> G4[Click Hire\ncandidate becomes Employee]
    G3 -- No --> G5[Reject]

    H --> H1[AI Evaluation page\nfull candidate report]
    H1 --> H2[Trigger evaluate\nor view existing evaluation]

    I --> I1[Send Email page\ncompose with To · Subject · Body · Attachment]
    I1 --> I2[Sends via Gmail SMTP]
```

### HR Recruiter: Key Pages

| Page | Sidebar Label | What it shows |
|---|---|---|
| Dashboard | Dashboard | Stats cards, recent activity |
| Candidates | Candidates | All applicants, filter by job/status |
| Jobs | Jobs | Post, edit, close, delete job listings |
| Resume Screening | Resume Screening | AI-extracted resume data per candidate |
| Voice Screening | Voice Screening | Voice interview scores and analysis |
| AI Evaluation | AI Evaluation | Full AI evaluation report per candidate |
| Send Email | Send Email | Compose and send email to anyone |

---

## Senior Manager Flow

Senior Managers can view their team, manage performance goals, and see reports.

```mermaid
flowchart TD
    A([🔑 Senior Manager logs in]) --> B[Dashboard\nteam overview · performance KPIs]

    B --> C{What does Senior Manager want?}

    C --> D[👨‍👩‍👧 View Team]
    C --> E[📊 Performance Goals]
    C --> F[🗓️ Attendance]

    D --> D1[Sees employees\nassigned to their department]
    D1 --> D2[Can view individual\nemployee profiles]

    E --> E1[Views all performance goals\nfor their team]
    E1 --> E2{Action?}
    E2 --> E3[Create new goal\nfor an employee]
    E2 --> E4[Update existing goal\n· target · deadline]
    E2 --> E5[Mark goal completed]

    E3 --> E6[(Goal saved\nEmployee can see it on their dashboard)]
    E4 --> E6
    E5 --> E6

    F --> F1[Views attendance records\nfor team members]
    F1 --> F2[Filters by employee · month]
```

### Senior Manager: Key Pages

| Page | Access |
|---|---|
| Dashboard | Full overview |
| Attendance | View team attendance |
| Performance | Create and manage goals for employees |
| Employees (read-only) | View team member profiles |

---

## Employee Flow

Employees have a personal view of their own HR data — they cannot see other employees' data.

```mermaid
flowchart TD
    A([🔑 Employee logs in at /login]) --> B[Employee Dashboard\nmy stats · today's attendance · goals]

    B --> C{What does Employee want?}

    C --> D[🗓️ Attendance]
    C --> E[💰 Payroll]
    C --> F[🎯 Performance Goals]

    D --> D1[Views own monthly attendance\ncalendar view]
    D1 --> D2[Sees Present · Absent · Leave days\nattendance summary]

    E --> E1[Views payslips by month]
    E1 --> E2[Sees gross · deductions · net pay]
    E2 --> E3[Downloads payslip PDF]

    F --> F1[Views performance goals\nassigned by Senior Manager]
    F1 --> F2{Goal action?}
    F2 --> F3[Update progress % on a goal]
    F2 --> F4[View goal details\ndeadline · target · status]

    F3 --> F5[(Progress saved\nSenior Manager can see it)]
```

### Employee: Key Pages

| Page | What they see |
|---|---|
| Dashboard | Personal stats, attendance today, upcoming goals |
| Attendance | Their own monthly attendance record |
| Payroll | Their payslips, net pay, download |
| Performance | Goals assigned to them, ability to update progress |

---

## Management Admin Flow

The Management Admin has a completely separate portal at `/admin` — they do not use the main HR portal.

```mermaid
flowchart TD
    A([🔑 Admin logs in at /admin]) --> B[Admin Dashboard]

    B --> C{What does Admin want?}

    C --> D[👥 Manage Employees]
    C --> E[🏢 Manage Departments]
    C --> F[💸 Payroll Overview]
    C --> G[🗓️ Attendance Overview]
    C --> H[✉️ Send Email]

    D --> D1[Views all employees]
    D1 --> D2{Action?}
    D2 --> D3[Add employee\nlinks user account to employee profile]
    D2 --> D4[Edit employee details\ndept · salary · designation]
    D2 --> D5[Delete employee]

    E --> E1[Views all departments\nwith color-coded cards]
    E1 --> E2[Each card shows:\n• Department ID badge\n• Employee count\n• Assigned manager]
    E2 --> E3{Action?}
    E3 --> E4[Create new department]
    E3 --> E5[Assign / Change Manager\nfrom Senior Manager list]
    E3 --> E6[Copy department ID\nfor reference]

    F --> F1[Sees all payroll records\nacross all employees]
    F1 --> F2[Generate payroll for a period]
    F1 --> F3[Download payslips]

    G --> G1[Views attendance\nfor all employees]

    H --> H1[Compose email\nTo · Subject · Body · Attachment]
    H1 --> H2[Sends via Gmail SMTP]
    H --> H3[Advanced: configure\nSMTP settings]
```

### Admin: Key Pages

| Page | URL | Notes |
|---|---|---|
| Admin Login | `/admin` | Separate from staff login |
| Employees | `/admin/employees` | Full employee management |
| Departments | `/admin/departments` | Dept cards with ID badge + manager assignment |
| Payroll | `/admin/payroll` | Org-wide payroll |
| Attendance | `/admin/attendance` | Org-wide attendance |
| Send Email | `/admin/settings` | Gmail compose interface |

---

## How Services Talk to Each Other

```mermaid
sequenceDiagram
    participant Browser
    participant Gateway as Gateway :8000
    participant Auth as Auth :8001
    participant HRMS as HRMS :8002
    participant AI as AI Recruitment :8003
    participant Gemini as Google Gemini
    participant Gmail as Gmail SMTP

    Browser->>Gateway: POST /api/auth/login
    Gateway->>Auth: POST /login (forwarded)
    Auth-->>Gateway: 200 OK + Set-Cookie (JWT)
    Gateway-->>Browser: 200 OK + Set-Cookie forwarded

    Browser->>Gateway: POST /api/ai-recruitment/applications (multipart)
    Gateway->>AI: POST /applications (forwarded with cookie)
    AI->>AI: Save application + resume text
    AI->>Gemini: Analyze resume (async background)
    Gemini-->>AI: JSON { recommendation, skills, projects... }
    AI->>AI: Save screening result, update application status
    AI->>Gmail: Send email notification (background)
    AI-->>Gateway: 201 Created
    Gateway-->>Browser: 201 Created

    Browser->>Gateway: GET /api/hrms/employees
    Gateway->>HRMS: GET /employees (forwarded with cookie)
    HRMS-->>Gateway: 200 [employees array]
    Gateway-->>Browser: 200 [employees array]
```

---

## Database Tables at a Glance

### Auth Service DB

```
users
├── id            SERIAL PRIMARY KEY
├── email         VARCHAR UNIQUE NOT NULL
├── hashed_password VARCHAR NOT NULL
├── first_name    VARCHAR
├── last_name     VARCHAR
├── role          VARCHAR  (Management Admin | HR Recruiter | Senior Manager | Employee | Candidate)
├── is_active     BOOLEAN DEFAULT true
└── created_at    TIMESTAMP
```

### HRMS Service DB

```
departments
├── id            SERIAL PRIMARY KEY
├── name          VARCHAR UNIQUE NOT NULL
├── manager_id    INTEGER (→ users.id)
└── created_at    TIMESTAMP

employees
├── id            SERIAL PRIMARY KEY
├── user_id       INTEGER UNIQUE (→ auth users.id)
├── department_id INTEGER (→ departments.id)
├── designation   VARCHAR
├── salary        FLOAT
├── date_of_joining DATE
└── created_at    TIMESTAMP

attendance
├── id            SERIAL PRIMARY KEY
├── employee_id   INTEGER (→ employees.id)
├── date          DATE
├── status        VARCHAR  (Present | Absent | Leave)
└── created_at    TIMESTAMP

payroll
├── id            SERIAL PRIMARY KEY
├── employee_id   INTEGER (→ employees.id)
├── month         INTEGER
├── year          INTEGER
├── gross_salary  FLOAT
├── deductions    FLOAT
├── net_salary    FLOAT
└── created_at    TIMESTAMP

performance_goals
├── id            SERIAL PRIMARY KEY
├── employee_id   INTEGER (→ employees.id)
├── title         VARCHAR
├── description   TEXT
├── target        VARCHAR
├── progress      INTEGER (0–100)
├── deadline      DATE
├── status        VARCHAR  (In Progress | Completed | Overdue)
└── created_at    TIMESTAMP
```

### AI Recruitment Service DB

```
jobs
├── id            SERIAL PRIMARY KEY
├── title         VARCHAR
├── department    VARCHAR
├── location      VARCHAR
├── type          VARCHAR  (Full-time | Part-time | Contract | Internship)
├── experience    VARCHAR
├── salary_range  VARCHAR
├── description   TEXT
├── requirements  TEXT
├── status        VARCHAR  (Open | Closed)
├── positions     INTEGER DEFAULT 1
├── applicants    INTEGER DEFAULT 0
└── posted_date   TIMESTAMP

candidates
├── id            SERIAL PRIMARY KEY
├── first_name    VARCHAR
├── last_name     VARCHAR
├── email         VARCHAR UNIQUE
├── phone         VARCHAR
├── resume_text   TEXT        ← extracted from uploaded PDF
├── skills        TEXT (JSON) ← AI-extracted skill list
├── experience    TEXT (JSON) ← AI-extracted projects list
├── education     TEXT        ← AI-extracted education
├── certifications TEXT       ← AI-extracted certifications
└── created_at    TIMESTAMP

applications
├── id               SERIAL PRIMARY KEY
├── candidate_id     INTEGER (→ candidates.id)
├── job_id           INTEGER (→ jobs.id)
├── application_form_data JSONB
├── status           VARCHAR  (Applied | Resume Screened | Voice Screening Required | Voice Screened | Hired | Rejected)
├── voice_screening_code VARCHAR UNIQUE ← random code for voice interview URL
└── created_at       TIMESTAMP

resume_screenings
├── id               SERIAL PRIMARY KEY
├── application_id   INTEGER (→ applications.id)
├── candidate_id     INTEGER
├── job_id           INTEGER
├── candidate_score  FLOAT    ← cosine similarity overall
├── skills_match     FLOAT    ← cosine similarity vs requirements
├── experience_match FLOAT    ← cosine similarity vs description
├── overall_score    FLOAT
├── recommendation   VARCHAR  (Strong Hire | Hire | Consider | Reject)
├── analysis         TEXT
├── summary          TEXT
├── strengths        TEXT
├── weaknesses       TEXT
├── skill_gaps       TEXT
├── top_skills       TEXT (JSON) ← [{name, score}, ...] top 5
├── candidate_email  VARCHAR  ← extracted from resume by AI
└── created_at       TIMESTAMP

voice_answers
├── id               SERIAL PRIMARY KEY
├── application_id   INTEGER
├── question_index   INTEGER
├── answer           TEXT
└── created_at       TIMESTAMP

voice_screenings
├── id               SERIAL PRIMARY KEY
├── application_id   INTEGER
├── candidate_id     INTEGER
├── communication_score FLOAT
├── confidence_score FLOAT
├── recommendation   VARCHAR
├── analysis         TEXT
└── created_at       TIMESTAMP

candidate_evaluations
├── id               SERIAL PRIMARY KEY
├── application_id   INTEGER
├── candidate_id     INTEGER
├── summary          TEXT
├── strengths        TEXT
├── weaknesses       TEXT
├── skill_gaps       TEXT
├── recommendation   VARCHAR
└── created_at       TIMESTAMP

system_settings
├── key   VARCHAR PRIMARY KEY   ← e.g. smtp_user, smtp_password, smtp_host
├── value TEXT
└── updated_at TIMESTAMP
```

---

## Application Status State Machine

```mermaid
stateDiagram-v2
    [*] --> Applied : Candidate submits application

    Applied --> ResumeScreened : AI screening runs (background)\nrecommendation = Hire / Consider
    Applied --> Rejected : AI screening runs\nrecommendation = Reject

    ResumeScreened --> VoiceScreeningRequired : HR approves / sends voice invite\nOR AI gives Strong Hire
    ResumeScreened --> Rejected : HR rejects

    VoiceScreeningRequired --> VoiceScreened : Candidate completes voice interview\nAI evaluates answers

    VoiceScreened --> Hired : HR clicks Hire\nCandidate account upgraded to Employee
    VoiceScreened --> Rejected : HR rejects

    Rejected --> [*] : Candidate receives rejection email
    Hired --> [*] : Candidate receives welcome email\nLogs in as Employee
```

---

## Environment Variables Reference

### `services/auth/.env`
```env
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
JWT_SECRET_KEY=your-long-random-secret
JWT_ALGORITHM=HS256
ALLOWED_ORIGINS=http://localhost:5173,https://your-app.vercel.app
```

### `services/hrms/.env`
```env
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
JWT_SECRET_KEY=same-secret-as-auth
JWT_ALGORITHM=HS256
ALLOWED_ORIGINS=http://localhost:5173,https://your-app.vercel.app
```

### `services/ai-recruitment/.env`
```env
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
JWT_SECRET_KEY=same-secret-as-auth
JWT_ALGORITHM=HS256
GEMINI_API_KEY=your-google-gemini-api-key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=yourmail@gmail.com
SMTP_PASSWORD=xxxx xxxx xxxx xxxx   # Gmail App Password (16 chars)
SMTP_FROM=yourmail@gmail.com
ALLOWED_ORIGINS=http://localhost:5173,https://your-app.vercel.app
```

### `services/gateway/.env`
```env
AUTH_SERVICE_URL=http://localhost:8001
HRMS_SERVICE_URL=http://localhost:8002
AI_RECRUITMENT_SERVICE_URL=http://localhost:8003
ALLOWED_ORIGINS=http://localhost:5173,https://your-app.vercel.app
```

### `frontend/.env`
```env
VITE_API_URL=http://localhost:8000
```

> **Production**: set `VITE_API_URL` to your deployed gateway URL (e.g. `https://futurehr-gateway.onrender.com`)

---

## Running Locally (Quick Start)

```bash
# 1. Start each backend service in its own terminal
cd services/auth       && .\venv\Scripts\activate && python run.py   # :8001
cd services/hrms       && .\venv\Scripts\activate && python run.py   # :8002
cd services/ai-recruitment && .\venv\Scripts\activate && python run.py # :8003
cd services/gateway    && .\venv\Scripts\activate && python run.py   # :8000

# 2. Start frontend
cd frontend && npm run dev   # :5173

# 3. Seed the first admin account
cd services/auth && python create_admin.py
```

Access the app at **http://localhost:5173**

| Portal | URL | Who uses it |
|---|---|---|
| Staff login | http://localhost:5173/login | HR, Employee, Senior Manager |
| Admin login | http://localhost:5173/admin | Management Admin only |
| Careers portal | http://localhost:5173/careers | Candidates |
| API docs | http://localhost:8001/docs | Dev/debug |
