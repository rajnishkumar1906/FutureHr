from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    AUTH_SERVICE_URL: str
    HRMS_SERVICE_URL: str
    AI_RECRUITMENT_SERVICE_URL: str
    
    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore"
    )

settings = Settings()
