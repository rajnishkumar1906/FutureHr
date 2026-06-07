from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import init_db
from .routes import ai_recruitment_routes
from .config import settings
import asyncio
import logging

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # ── Startup ──────────────────────────────────────────
    await init_db()

    # Pre-load the sentence-transformers embedding model once so the first
    # resume screening request does not pay the 5-10 s cold-start penalty.
    try:
        await asyncio.to_thread(_preload_embedding_model)
    except Exception as e:
        logger.warning(f"Embedding model preload skipped: {e}")

    yield
    # ── Shutdown (nothing to clean up) ───────────────────


def _preload_embedding_model():
    from .utils.ai_service import get_embedding_model
    model = get_embedding_model()
    if model is not None:
        logger.info("Embedding model ready")
    else:
        logger.warning("Embedding model unavailable — cosine similarity will use fallback score")


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
