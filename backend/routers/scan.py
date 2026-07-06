"""
AI Document Detector — Scan Router
Endpoints for document upload, text scanning, and report retrieval.
"""

from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from typing import Optional
import time

from schemas import ScanRequest, ScanResponse, SentenceResult, ErrorResponse, MetadataAnalysis
from services.text_extractor import TextExtractorService
from services.ai_detector import AIDetectorService
from services.ocr_service import OCRService
from services.metadata_forensics import MetadataForensicsService

router = APIRouter()

# ── Service Instances ──────────────────────────────────────────────
text_extractor = TextExtractorService()
ai_detector = AIDetectorService()
ocr_service = OCRService()
metadata_forensics = MetadataForensicsService()


@router.post(
    "/scan/upload",
    response_model=ScanResponse,
    responses={400: {"model": ErrorResponse}, 500: {"model": ErrorResponse}},
    summary="Scan uploaded document for AI-generated content",
)
async def scan_document(
    file: UploadFile = File(..., description="PDF, DOCX, or image file"),
):
    """
    Upload a document file (PDF, DOCX, or image) and analyze it
    for AI-generated content. Returns per-sentence classification
    with confidence scores and metadata forensics.
    """
    start_time = time.time()

    # Validate file type
    allowed_types = {".pdf", ".docx", ".png", ".jpg", ".jpeg"}
    file_ext = "." + file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
    if file_ext not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {file_ext}. Allowed: {', '.join(allowed_types)}",
        )

    try:
        # Step 1: Read file and extract metadata
        file_bytes = await file.read()
        
        raw_metadata = text_extractor.extract_metadata(file_bytes, file_ext)
        forensics_report = None
        if raw_metadata:
            forensics_report = metadata_forensics.analyze(raw_metadata)

        # Step 2: Extract text from document
        extracted_text = text_extractor.extract(file_bytes, file_ext)

        # Step 3: If extraction failed (scanned PDF / image), try OCR
        if not extracted_text or len(extracted_text.strip()) < 10:
            extracted_text = ocr_service.extract_text(file_bytes, file_ext)

        if not extracted_text or len(extracted_text.strip()) < 10:
            raise HTTPException(
                status_code=400,
                detail="Could not extract text from the document. The file may be empty, corrupted, or require OCR (ensure easyocr is installed).",
            )

        # Step 4: Run AI detection
        result = ai_detector.analyze(extracted_text)

        processing_time = int((time.time() - start_time) * 1000)

        # Build MetadataAnalysis response if available
        meta_response = None
        if forensics_report:
            meta_response = MetadataAnalysis(**forensics_report)

        return ScanResponse(
            filename=file.filename,
            file_type=file_ext.lstrip("."),
            ai_score=result["ai_score"],
            human_score=result["human_score"],
            confidence=result["confidence"],
            total_sentences=result["total_sentences"],
            ai_sentences=result["ai_sentences"],
            human_sentences=result["human_sentences"],
            paraphrased_sentences=result["paraphrased_sentences"],
            avg_perplexity=result.get("avg_perplexity"),
            avg_burstiness=result.get("avg_burstiness"),
            repetition_score=result.get("repetition_score"),
            readability=result.get("readability"),
            sentences=result.get("sentences", []),
            metadata=meta_response,
            processing_time_ms=processing_time,
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing document: {str(e)}",
        )


@router.post(
    "/scan/text",
    response_model=ScanResponse,
    responses={400: {"model": ErrorResponse}},
    summary="Scan raw text for AI-generated content",
)
async def scan_text(request: ScanRequest):
    """
    Analyze raw text (pasted directly) for AI-generated content.
    Returns per-sentence classification with confidence scores.
    """
    start_time = time.time()

    try:
        result = ai_detector.analyze(request.text)
        processing_time = int((time.time() - start_time) * 1000)

        return ScanResponse(
            ai_score=result["ai_score"],
            human_score=result["human_score"],
            confidence=result["confidence"],
            total_sentences=result["total_sentences"],
            ai_sentences=result["ai_sentences"],
            human_sentences=result["human_sentences"],
            paraphrased_sentences=result["paraphrased_sentences"],
            avg_perplexity=result.get("avg_perplexity"),
            avg_burstiness=result.get("avg_burstiness"),
            repetition_score=result.get("repetition_score"),
            readability=result.get("readability"),
            sentences=result.get("sentences", []),
            processing_time_ms=processing_time,
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error analyzing text: {str(e)}",
        )
