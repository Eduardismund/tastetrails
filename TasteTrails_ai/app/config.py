from typing import Optional
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Environment
    ENVIRONMENT: str = "development"

    # API keys
    ANTHROPIC_API_KEY: str
    QLOO_API_KEY: str

    # Service URLs
    SPRING_BOOT_URL: str = "http://172.23.128.1:8080"
    WEAVIATE_URL: str = "http://localhost:8080"

    # Claude Configuration
    CLAUDE_MODEL: str = "claude-3-5-sonnet-20241022"
    MAX_TOKENS: int = 4000
    TEMPERATURE: float = 0.7

    # Qloo Configuration - UPDATED FOR HACKATHON
    QLOO_BASE_URL: str = "https://hackathon.api.qloo.com"  # ← FIXED URL
    QLOO_VERSION: str = "v1"

    # Cache Configuration
    REDIS_URL: Optional[str] = "redis://localhost:6379"
    CACHE_TTL: int = 3600

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()