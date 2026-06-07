from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    DATABASE_URL: str
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://localhost:5174,http://localhost:5175,https://future-hr.vercel.app,https://future-6q4zw79ve-rajnishs-projects-52b76523.vercel.app"

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore"
    )

    @property
    def allowed_origins_list(self) -> List[str]:
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",") if o.strip()]

settings = Settings()
