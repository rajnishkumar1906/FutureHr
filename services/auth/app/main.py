from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import init_db
from .routes import auth_routes
from .config import settings
import asyncio

async def on_startup():
    await init_db()

app = FastAPI(title="FutureHR Auth Service", version="1.0.0", on_startup=[on_startup])

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_routes.router)

@app.get("/")
async def root():
    return {"message": "FutureHR Auth Service is running"}

@app.get("/health")
async def health():
    return {"status": "healthy"}
