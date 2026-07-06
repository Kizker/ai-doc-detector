"""
AI Document Detector — Pydantic Schemas
Request/Response validation models for the API.
"""

from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


# ── Sentence-Level Result ─────────────────────────────────────────

class SentenceResult(BaseModel):
    """Result for a single sentence analysis."""
    text: str
    label: str = Field(..., description="ai | human | paraphrase")
    confidence: float = Field(..., ge=0.0, le=1.0)
    perplexity: Optional[float] = None
    burstiness: Optional[float] = None


# ── Metadata Analysis ─────────────────────────────────────────────

class MetadataAnomaly(BaseModel):
    """A detected anomaly in document metadata."""
    type: str
    description: str
    severity: str = Field(..., description="low | medium | high")


class MetadataAnalysis(BaseModel):
    """Document metadata forensics results."""
    author: Optional[str] = None
    creator_tool: Optional[str] = None
    creation_date: Optional[datetime] = None
    modification_date: Optional[datetime] = None
    anomalies: List[MetadataAnomaly] = []
    risk_level: str = Field(default="low", description="low | medium | high")
    risk_score: float = Field(default=0.0, description="Overall risk score (0.0 to 1.0)")
    page_count: Optional[int] = None
    total_words: Optional[int] = None


# ── Scan Request ──────────────────────────────────────────────────

class ScanRequest(BaseModel):
    """Request body for text-based scan (no file upload)."""
    text: str = Field(..., min_length=10, max_length=50000)


# ── Scan Response ─────────────────────────────────────────────────

class ScanResponse(BaseModel):
    """Full scan report response."""
    id: Optional[int] = None
    filename: Optional[str] = None
    file_type: Optional[str] = None

    # Overall scores
    ai_score: float = Field(..., ge=0.0, le=100.0, description="AI-generated percentage")
    human_score: float = Field(..., ge=0.0, le=100.0, description="Human-written percentage")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Overall confidence")

    # Counts
    total_sentences: int
    ai_sentences: int
    human_sentences: int
    paraphrased_sentences: int

    # Perplexity & Burstiness
    avg_perplexity: Optional[float] = None
    avg_burstiness: Optional[float] = None
    repetition_score: Optional[float] = None
    readability: Optional[dict] = None

    # Detailed results
    sentences: List[SentenceResult] = []
    metadata: Optional[MetadataAnalysis] = None

    # Processing info
    processing_time_ms: Optional[int] = None
    created_at: Optional[datetime] = None


# ── Health Check ──────────────────────────────────────────────────

class HealthResponse(BaseModel):
    """Health check response."""
    status: str
    services: dict


# ── Error ─────────────────────────────────────────────────────────

class ErrorResponse(BaseModel):
    """Standard error response."""
    detail: str
    error_code: Optional[str] = None
