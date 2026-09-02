import os
from typing import List, Union
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "BIS Compliance Compiler"
    PROJECT_TEAM: str = "Zyntrix"
    SIH_PROBLEM_ID: str = "26107"
    VERSION: str = "0.1.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    API_V1_STR: str = "/api/v1"

    # Security & CORS
    SECRET_KEY: str = "zyntrix-development-secret-key-change-in-production"
    ALLOWED_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ]

    # Database Settings (PostgreSQL + pgvector)
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgrespassword"
    POSTGRES_DB: str = "bis_compliance_db"
    
    # Storage & Upload limits
    STORAGE_LOCAL_PATH: str = "./storage"
    MAX_UPLOAD_SIZE_MB: int = 25
    ALLOWED_MIME_TYPES: List[str] = [
        "application/pdf",
        "image/jpeg",
        "image/png",
        "text/plain",
        "application/json",
    ]

    # Logging
    LOG_LEVEL: str = "INFO"

    @property
    def async_database_url(self) -> str:
        """Asynchronous database connection URL using psycopg."""
        return (
            f"postgresql+psycopg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@"
            f"{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )

    @property
    def sync_database_url(self) -> str:
        """Synchronous database connection URL."""
        return (
            f"postgresql+psycopg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@"
            f"{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )

    model_config = SettingsConfigDict(
        env_file=(".env", "backend/.env"),
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=True,
    )


settings = Settings()
