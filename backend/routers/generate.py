"""
AI Document Detector — Studio Artifact Generation & Web URL Scraper Router
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, HttpUrl
from typing import Optional, Dict, Any, List
import urllib.request
import re
from html.parser import HTMLParser

from services.artifact_generator import ArtifactGeneratorService
from services.ai_detector import AIDetectorService

router = APIRouter()
generator_service = ArtifactGeneratorService()
ai_detector = AIDetectorService()


class GenerateRequest(BaseModel):
    text: str
    title: Optional[str] = "Dokumen"


class URLScanRequest(BaseModel):
    url: str


class SimpleHTMLTextExtractor(HTMLParser):
    def __init__(self):
        super().__init__()
        self.reset()
        self.fed = []
        self.ignore = False

    def handle_starttag(self, tag, attrs):
        if tag.lower() in ("script", "style", "noscript", "svg", "header", "footer", "nav"):
            self.ignore = True

    def handle_endtag(self, tag):
        if tag.lower() in ("script", "style", "noscript", "svg", "header", "footer", "nav"):
            self.ignore = False

    def handle_data(self, d):
        if not self.ignore:
            self.fed.append(d)

    def get_text(self):
        return " ".join("".join(self.fed).split())


@router.post(
    "/generate/{artifact_type}",
    summary="Generate studio artifact (Audio Overview, Slide Deck, Quiz, etc.) from document text",
)
async def generate_artifact(artifact_type: str, request: GenerateRequest):
    """
    Generate rich studio artifacts based on document text:
    - audio_overview
    - slide_deck
    - video_overview
    - mind_map
    - reports
    - flashcards
    - quiz
    - infographic
    - data_table
    """
    if not request.text or len(request.text.strip()) < 10:
        raise HTTPException(
            status_code=400,
            detail="Teks dokumen terlalu pendek untuk menghasilkan artefak (minimal 10 karakter).",
        )

    try:
        result = generator_service.generate(
            artifact_type=artifact_type,
            text=request.text,
            title=request.title or "Dokumen"
        )
        return {
            "success": True,
            "artifact_type": artifact_type,
            "data": result
        }
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Terjadi kesalahan saat menghasilkan artefak: {str(e)}",
        )


@router.post(
    "/scan/url",
    summary="Fetch and extract text content from a web URL",
)
async def scan_url(request: URLScanRequest):
    """
    Extract readable text content from a given website URL and run AI integrity analysis.
    """
    import ssl
    import urllib.error

    url_str = request.url.strip()
    if not url_str.startswith("http://") and not url_str.startswith("https://"):
        url_str = "https://" + url_str

    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE

    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
    }

    try:
        req = urllib.request.Request(url_str, headers=headers)
        with urllib.request.urlopen(req, context=ctx, timeout=12) as response:
            html_content = response.read().decode("utf-8", errors="ignore")

        parser = SimpleHTMLTextExtractor()
        parser.feed(html_content)
        extracted_text = parser.get_text()

        if not extracted_text or len(extracted_text) < 25:
            raise HTTPException(
                status_code=400,
                detail="Halaman web tidak memuat teks artikel yang cukup (kemungkinan halaman JavaScript dinamis / dasbor privat). Silakan gunakan tab 'Copied text' untuk menempelkan naskah langsung."
            )

        # Run detection
        analysis = ai_detector.analyze(extracted_text[:10000])

        return {
            "success": True,
            "url": url_str,
            "extracted_text": extracted_text[:10000],
            "analysis": analysis
        }

    except urllib.error.HTTPError as he:
        if he.code == 404:
            detail = f"Halaman web tidak ditemukan (HTTP 404). Periksa apakah tautan terpotong (misalnya /dasbor/pese vs /dasbor/peserta)."
        elif he.code in (401, 403):
            detail = f"Halaman ini memerlukan hak akses / login (HTTP {he.code}). Silakan salin teks naskah Anda dan gunakan tab 'Copied text'."
        else:
            detail = f"Server website merespons dengan kode HTTP {he.code}: {he.reason}."
        raise HTTPException(status_code=400, detail=detail)
    except TimeoutError:
        raise HTTPException(
            status_code=400,
            detail="Koneksi ke website melebihi batas waktu (timeout). Server target lambat merespons. Silakan salin teks naskah langsung ke tab 'Copied text'."
        )
    except Exception as e:
        err_msg = str(e)
        if "timed out" in err_msg.lower():
            err_msg = "Koneksi ke website melebihi batas waktu (timeout). Server target lambat merespons. Silakan salin teks naskah langsung ke tab 'Copied text'."
        raise HTTPException(
            status_code=400,
            detail=f"Gagal mengambil konten: {err_msg}"
        )
