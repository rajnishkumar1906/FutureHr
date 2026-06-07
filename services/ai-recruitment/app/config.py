from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    DATABASE_URL: str
    GEMINI_API_KEY: str
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"

    # SMTP settings
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM: str = ""

    # Frontend URL (set to Vercel URL in production)
    FRONTEND_URL: str = "http://localhost:5173"

    # Internal service URLs (set to Render URLs in production)
    AUTH_SERVICE_URL: str = "http://localhost:8001"
    HRMS_SERVICE_URL: str = "http://localhost:8002"
    INTERNAL_API_KEY: str = "futurehr-internal-secret"  # must match hrms INTERNAL_API_KEY

    # CORS
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://localhost:5174,http://localhost:5175,https://future-hr.vercel.app,https://future-hr-git-main-rajnishs-projects-52b76523.vercel.app,https://future-hr-rajnishs-projects-52b76523.vercel.app"

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore"
    )

    @property
    def allowed_origins_list(self) -> List[str]:
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",") if o.strip()]

settings = Settings()
