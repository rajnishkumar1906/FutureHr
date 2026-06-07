from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import init_db
from .routes import ai_recruitment_routes
from .config import settings


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

app.include_router(ai_recruitment_routes.router)


@app.get("/")
async def root():
    return {"message": "FutureHR AI Recruitment Service is running"}


@app.get("/health")
async def health():
    return {"status": "healthy"}
