"""Quick smoke test for backend imports and AI detector."""
import sys
sys.path.insert(0, ".")

from fastapi import FastAPI
from config import Settings
from schemas import ScanResponse
from services.ai_detector import AIDetectorService

print("[OK] All imports successful")

# Test AI detector
detector = AIDetectorService()
result = detector.analyze(
    "This is a test sentence written by a human. "
    "The artificial intelligence generated this automated paragraph with consistent structure. "
    "Natural language varies in complexity and style."
)

print(f"[OK] AI Score: {result['ai_score']}%")
print(f"[OK] Human Score: {result['human_score']}%")
print(f"[OK] Total sentences: {result['total_sentences']}")
print(f"[OK] AI sentences: {result['ai_sentences']}")
print(f"[OK] Human sentences: {result['human_sentences']}")
print(f"[OK] Paraphrased: {result['paraphrased_sentences']}")
print(f"[OK] Avg Perplexity: {result['avg_perplexity']}")
print(f"[OK] Avg Burstiness: {result['avg_burstiness']}")
print("\n--- All backend tests PASSED ---")
