"""
AI Document Detector — SQLAlchemy Database Models
Defines the database schema for users, documents, and scan reports.
"""

from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Text,
    DateTime,
    Boolean,
    JSON,
    ForeignKey,
    create_engine,
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker
from datetime import datetime, timezone

Base = declarative_base()


class User(Base):
    """User account model."""

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    scan_reports = relationship("ScanReport", back_populates="user")


class Document(Base):
    """Uploaded document record."""

    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    original_filename = Column(String(500), nullable=False)
    file_type = Column(String(20), nullable=False)  # pdf, docx, image
    file_size_bytes = Column(Integer, nullable=False)
    file_hash = Column(String(64), nullable=True)  # SHA-256 hash
    storage_path = Column(String(1000), nullable=True)
    uploaded_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Metadata forensics
    metadata_raw = Column(JSON, nullable=True)
    author_meta = Column(String(255), nullable=True)
    creator_tool = Column(String(255), nullable=True)
    creation_date_meta = Column(DateTime, nullable=True)
    modification_date_meta = Column(DateTime, nullable=True)

    # Relationships
    scan_reports = relationship("ScanReport", back_populates="document")


class ScanReport(Base):
    """AI detection scan report for a document."""

    __tablename__ = "scan_reports"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False)

    # ── Overall Scores ──────────────────────────────────────────────
    ai_score = Column(Float, nullable=False)  # 0.0 - 100.0
    human_score = Column(Float, nullable=False)  # 0.0 - 100.0
    confidence = Column(Float, nullable=False)  # 0.0 - 1.0

    # ── Text Analysis ───────────────────────────────────────────────
    total_sentences = Column(Integer, default=0)
    ai_sentences = Column(Integer, default=0)
    human_sentences = Column(Integer, default=0)
    paraphrased_sentences = Column(Integer, default=0)

    # ── Perplexity & Burstiness ─────────────────────────────────────
    avg_perplexity = Column(Float, nullable=True)
    avg_burstiness = Column(Float, nullable=True)

    # ── Detailed Results (JSON) ─────────────────────────────────────
    sentence_results = Column(JSON, nullable=True)
    # Structure: [{ "text": str, "label": "ai"|"human"|"paraphrase",
    #               "confidence": float, "perplexity": float }]

    metadata_analysis = Column(JSON, nullable=True)
    # Structure: { "anomalies": [...], "risk_level": str }

    # ── Timestamps ──────────────────────────────────────────────────
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    processing_time_ms = Column(Integer, nullable=True)

    # Relationships
    user = relationship("User", back_populates="scan_reports")
    document = relationship("Document", back_populates="scan_reports")
