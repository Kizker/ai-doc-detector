"""
AI Document Detector — FastAPI Backend
Entry point for the application server.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from routers import scan

# ── App Initialization ─────────────────────────────────────────────
app = FastAPI(
    title="AI Document Detector API",
    description="API untuk menganalisis dan mendeteksi teks buatan AI dalam dokumen akademis.",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS Middleware ────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Router Registration ───────────────────────────────────────────
app.include_router(scan.router, prefix="/api/v1", tags=["scan"])


# ── Root Endpoint ──────────────────────────────────────────────────
@app.get("/")
async def root():
    """Health check / root endpoint."""
    return {
        "app": "AI Document Detector",
        "version": "0.1.0",
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health")
async def health_check():
    """Detailed health check."""
    return {
        "status": "healthy",
        "services": {
            "api": True,
            "database": False,  # TODO: Check DB connection
            "ai_model": False,  # TODO: Check model loaded
        },
    }
