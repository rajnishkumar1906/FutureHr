from contextlib import asynccontextmanager
import re
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from .database import init_db
from .routes import ai_recruitment_routes
from .config import settings
from .auth_dep import get_current_user, _decode

# Paths that don't require a valid JWT (public candidate/job endpoints)
_PUBLIC_PATTERNS = [
    re.compile(r"^/api/ai-recruitment/jobs(/\d+)?$"),
    re.compile(r"^/api/ai-recruitment/jobs/\d+/voice-questions$"),
    re.compile(r"^/api/ai-recruitment/applications$"),          # POST to submit, GET by email
    re.compile(r"^/api/ai-recruitment/voice-screening/validate/"),
    re.compile(r"^/api/ai-recruitment/applications/\d+/voice-answers$"),
    re.compile(r"^/(health|)$"),
]


@asynccontextmanager
async def lifespan(app: FastAPI):
    # ── Startup ──────────────────────────────────────────
    await init_db()

    # Embedding model (sentence-transformers) is optional.
    # If not installed, cosine similarity falls back to 50.0.
    # Gemini AI handles all core analysis (skills, projects, recommendation).

    yield
    # ── Shutdown (nothing to clean up) ───────────────────


app = FastAPI(
    title="FutureHR AI Recruitment Service",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def auth_middleware(request: Request, call_next):
    path = request.url.path
    if request.method == "OPTIONS" or any(p.match(path) for p in _PUBLIC_PATTERNS):
        return await call_next(request)
    try:
        get_current_user(request)
    except Exception:
        return JSONResponse(status_code=401, content={"detail": "Not authenticated"})
    return await call_next(request)


app.include_router(ai_recruitment_routes.router)


@app.get("/")
async def root():
    return {"message": "FutureHR AI Recruitment Service is running"}


@app.get("/health")
async def health():
    return {"status": "healthy"}
