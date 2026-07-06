"""
AI Document Detector — OCR Service
Extracts text from scanned documents and images using EasyOCR.
"""

from typing import Optional, List, Tuple
import io


class OCRService:
    """Service for extracting text from images using OCR."""

    def __init__(self):
        """
        Initialize OCR service.
        EasyOCR model loading is deferred to first use
        to avoid slow startup times for text-only scans.
        """
        self._reader = None
        self._is_loaded = False

    def _load_reader(self):
        """Load the EasyOCR reader with English and Indonesian."""
        try:
            import easyocr
            import torch
            
            # Use GPU if available
            use_gpu = torch.cuda.is_available()
            
            # Load reader (this downloads models on first run if not present)
            self._reader = easyocr.Reader(['en', 'id'], gpu=use_gpu)
            self._is_loaded = True
        except ImportError:
            print("[OCRService] Warning: easyocr or torch not installed. OCR will be disabled.")
            self._is_loaded = False
        except Exception as e:
            print(f"[OCRService] Failed to load EasyOCR: {e}")
            self._is_loaded = False

    def extract_text(self, file_bytes: bytes, file_ext: str) -> Optional[str]:
        """
        Extract text from an image or scanned PDF using OCR.
        
        Args:
            file_bytes: Raw file content as bytes.
            file_ext: File extension (e.g., '.png', '.jpg', '.pdf').
            
        Returns:
            Extracted text string, or None if extraction failed.
        """
        if not self._is_loaded:
            self._load_reader()
            
        if not self._is_loaded or self._reader is None:
            return None

        try:
            if file_ext in ('.png', '.jpg', '.jpeg'):
                return self._process_image(file_bytes)
            
            elif file_ext == '.pdf':
                return self._process_pdf(file_bytes)
                
            return None
            
        except Exception as e:
            print(f"[OCRService] Extraction error: {e}")
            return None

    def _process_image(self, file_bytes: bytes) -> Optional[str]:
        """Process a single image file."""
        try:
            # reader.readtext accepts bytes directly
            results = self._reader.readtext(file_bytes, paragraph=True)
            
            # results format with paragraph=True: [[box, text, confidence], ...]
            # We just want the text
            if results:
                extracted = []
                for result in results:
                    if len(result) >= 2:
                        extracted.append(result[1])
                return '\n\n'.join(extracted)
            return None
        except Exception as e:
            print(f"[OCRService] Image processing error: {e}")
            return None

    def _process_pdf(self, file_bytes: bytes) -> Optional[str]:
        """Convert PDF pages to images and process each."""
        try:
            import fitz  # PyMuPDF
            
            doc = fitz.open(stream=file_bytes, filetype="pdf")
            all_text = []
            
            for page_num in range(len(doc)):
                page = doc[page_num]
                # Render page to image at higher resolution (zoom = 2)
                mat = fitz.Matrix(2, 2)
                pix = page.get_pixmap(matrix=mat, alpha=False)
                
                # Get PNG bytes
                img_bytes = pix.tobytes("png")
                
                # Run OCR on page image
                page_text = self._process_image(img_bytes)
                if page_text:
                    all_text.append(f"--- Page {page_num + 1} ---\n{page_text}")
                    
            doc.close()
            
            return '\n\n'.join(all_text) if all_text else None
            
        except ImportError:
            print("[OCRService] PyMuPDF (fitz) not installed for PDF OCR.")
            return None
        except Exception as e:
            print(f"[OCRService] PDF OCR error: {e}")
            return None

    def is_available(self) -> bool:
        """Check if OCR service is available and ready."""
        if not self._is_loaded:
            try:
                import easyocr
                return True
            except ImportError:
                return False
        return True
