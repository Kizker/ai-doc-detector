"""
AI Document Detector — Application Configuration
Centralized settings using pydantic-settings.
"""

from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # ── App ─────────────────────────────────────────────────────────
    APP_NAME: str = "AI Document Detector"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = True

    # ── Server ──────────────────────────────────────────────────────
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # ── CORS ────────────────────────────────────────────────────────
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",  # Next.js dev server
        "http://127.0.0.1:3000",
    ]

    # ── Database ────────────────────────────────────────────────────
    DATABASE_URL: str = "postgresql://postgres:password@localhost:5432/ai_doc_detector"

    # ── AI Model ────────────────────────────────────────────────────
    AI_MODEL_NAME: str = "roberta-base-openai-detector"
    MAX_FILE_SIZE_MB: int = 50
    SUPPORTED_EXTENSIONS: List[str] = [".pdf", ".docx", ".png", ".jpg", ".jpeg"]

    # ── OCR ──────────────────────────────────────────────────────────
    OCR_LANGUAGES: List[str] = ["en", "id"]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


settings = Settings()
