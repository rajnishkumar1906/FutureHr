from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    AUTH_SERVICE_URL: str
    HRMS_SERVICE_URL: str
    AI_RECRUITMENT_SERVICE_URL: str
    
    class Config:
        env_file = ".env"

settings = Settings()
