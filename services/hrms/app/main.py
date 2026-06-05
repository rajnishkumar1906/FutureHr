from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import init_db
from .routes import hrms_routes

async def on_startup():
    await init_db()

app = FastAPI(title="FutureHR HRMS Service", version="1.0.0", on_startup=[on_startup])

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(hrms_routes.router)

@app.get("/")
def root():
    return {"message": "FutureHR HRMS Service is running"}

@app.get("/health")
def health():
    return {"status": "healthy"}
