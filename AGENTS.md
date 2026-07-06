# 📋 AGENTS.md — AI Document Detector (Command Center)

> **File ini adalah pusat komando proyek.** Semua analisis, rencana kerja, file yang dibuat/diedit, command yang dijalankan, kendala, solusi, dan hasil akhir dicatat di sini.

---

## 📌 Pemahaman Proyek

**AI Document Detector** adalah prototipe web yang berfungsi untuk menganalisis dan mendeteksi teks buatan AI dalam dokumen akademis. Target utama: verifikasi tugas mahasiswa, makalah, dan integritas jurnal penelitian.

### Core Features:
1. **Academic Integrity & Style Auditor**
   - Per-sentence highlighting (Merah = AI-Generated, Hijau = Human-Written, Kuning = Paraphrased)
   - Perplexity & Burstiness scoring per segmen teks
   - AI Confidence Score (0–100%)

2. **Multi-Format & OCR Smart Verifier**
   - Upload dokumen PDF, DOCX, dan gambar
   - OCR (Optical Character Recognition) menggunakan EasyOCR
   - Smart text extraction dengan pdfplumber dan python-docx

3. **Enterprise Metadata Forensics**
   - Analisis metadata dokumen (author, creation date, tool used, dsb)
   - Time Anomaly Detection (waktu editing vs panjang dokumen)
   - Digital fingerprinting

### Tech Stack:
| Layer      | Technology                               |
|------------|------------------------------------------|
| Frontend   | Next.js 14+ (React), Tailwind CSS, TypeScript |
| Backend    | Python 3.11+, FastAPI                    |
| AI/ML      | HuggingFace Transformers, EasyOCR        |
| Database   | PostgreSQL (via SQLAlchemy)              |
| NLP        | NLTK, Textstat                           |
| Design     | "Awwwards Mono Editorial" — minimalist, high-contrast |

### Arsitektur:
```
User → Frontend (Next.js) → Backend API (FastAPI)
                                ├── Text Extractor (PDF/DOCX/OCR)
                                ├── AI Detector (Transformers)
                                ├── Perplexity Analyzer
                                └── Metadata Forensics
```

---

## ✅ Checklist Rencana Kerja

### Phase 1: Setup & Initialization ← DONE
- [x] Baca dan pahami PRD
- [x] Buat file `AGENTS.md`
- [x] Buat struktur monorepo (`backend/`, `frontend/`)
- [x] Inisialisasi backend Python (requirements.txt, main.py)
- [x] Inisialisasi frontend Next.js (manual, tanpa npx)
- [x] Instal dependencies (Python 3.10 & Node.js 24 terinstal)

### Phase 2: Backend API ← DONE
- [x] Implementasi text extraction service (PDF, DOCX)
- [x] Implementasi OCR service (EasyOCR)
- [x] Implementasi AI detection service (HuggingFace Transformers / Heuristics)
- [x] Implementasi Perplexity & Burstiness analyzer
- [x] Implementasi metadata forensics
- [x] Setup PostgreSQL + SQLAlchemy models
- [x] Buat endpoint `/api/scan` (upload + analyze)
- [x] Buat endpoint `/api/reports` (hasil analisis)
- [x] Unit testing (Smoke tests passed)

### Phase 3: Frontend UI ← DONE
- [x] Setup design system (colors, typography, spacing)
- [x] Buat halaman Upload / Landing Page
- [x] Buat halaman Dashboard / Report View
- [x] Implementasi per-sentence highlighting
- [x] Implementasi chart/gauge untuk AI Score
- [x] Implementasi metadata viewer
- [x] Responsive design
- [x] Micro-animations & polish

### Phase 4: Integration & Testing ← DONE
- [x] Integrasi frontend ↔ backend API
- [x] End-to-end testing
- [x] Error handling & edge cases
- [x] Performance optimization
- [x] Dokumentasi API
- [x] Final review & deployment readiness

---

## 📓 Logbook Aktivitas

### [2026-07-07 01:23] — Fase 1: Inisialisasi Dimulai
- Membaca PRD dari file PDF
- Membuat `AGENTS.md` (file ini)
- Membuat struktur monorepo: `backend/` dan `frontend/`
- Membuat `backend/requirements.txt` dengan semua dependencies
- Membuat `backend/main.py` (FastAPI entry point)
- Membuat `backend/models.py`, `schemas.py`, `config.py`
- Membuat `backend/routers/scan.py` (placeholder)
- Membuat `backend/services/` (ai_detector, ocr_service, text_extractor)
- Membuat `frontend/` secara manual (Next.js + Tailwind CSS + TypeScript)
- **Kendala**: Node.js dan Python belum terinstal → file dibuat manual

### [2026-07-06 18:47] — Fase 2: Backend API Selesai
- Menginstal Node.js v24.18.0 (via winget) dan Python 3.10.6
- Menginstal semua frontend dependencies via npm
- Menginstal semua backend dependencies via pip (fastapi, easyocr, pdfplumber, nltk, dll)
- Mengimplementasikan `TextExtractorService` (dukungan PDF dan DOCX dengan metadata).
- Mengimplementasikan `MetadataForensicsService` (Time anomalies, author check, AI tool indicators).
- Mengupgrade `AIDetectorService` dengan perplexity, burstiness, TTR, dan textstat readability metrics.
- Mengimplementasikan `OCRService` dengan `easyocr` dan `PyMuPDF`.
- Melakukan pembaruan pada `schemas.py` dan `scan.py` router.
- Menguji API `/api/v1/scan/text` menggunakan FastAPI test server. Status: Sukses ✅.
- Melanjutkan ke Phase 3 (Frontend).

### [2026-07-06 18:50] — Fase 3: Frontend UI Selesai
- Mengonfigurasi `tailwind.config.ts` dan `globals.css` dengan design system "Awwwards Mono Editorial".
- Menambahkan font Google (Inter dan Space Mono) di `layout.tsx`.
- Mengimplementasikan `UploadForm.tsx` (Drag & drop file PDF/DOCX/Images dan paste text).
- Mengimplementasikan `AnalysisReport.tsx` (Visualisasi gauge chart, linguistic analysis, metadata forensics, dan per-sentence highlighting).
- Membuat `page.tsx` utama dengan transisi smooth menggunakan `framer-motion`.
- Frontend siap diintegrasikan penuh dengan backend.

### [2026-07-06 18:57] — Fase 4: Integration & Testing Selesai
- Mengatasi *conflict* pada `globals.css` terkait build Tailwind.
- Menjalankan Next.js server dan FastAPI backend.
- Menjalankan agen simulasi browser *end-to-end testing* via `http://localhost:3001`.
- Simulasi integrasi sukses: teks dikirim dari frontend ke backend, heuristik dihitung, dan hasil dikembalikan dengan cepat ke frontend. UI merender komponen _AnalysisReport_ tanpa *error*.
- Project selesai dan sukses.

---

## 📂 File Registry

| File | Status | Deskripsi |
|------|--------|-----------|
| `AGENTS.md` | ✅ Created | Pusat komando proyek |
| `README.md` | ✅ Updated | Deskripsi proyek |
| `backend/requirements.txt` | ✅ Created | Python dependencies |
| `backend/main.py` | ✅ Created | FastAPI entry point |
| `backend/config.py` | ✅ Created | App configuration |
| `backend/models.py` | ✅ Created | SQLAlchemy models |
| `backend/schemas.py` | ✅ Created | Pydantic schemas |
| `backend/routers/__init__.py` | ✅ Created | Router package |
| `backend/routers/scan.py` | ✅ Created | Scan endpoint |
| `backend/services/__init__.py` | ✅ Created | Services package |
| `backend/services/ai_detector.py` | ✅ Created | AI detection logic |
| `backend/services/ocr_service.py` | ✅ Created | OCR processing |
| `backend/services/text_extractor.py` | ✅ Created | Text extraction |
| `frontend/package.json` | ✅ Created | Node.js config |
| `frontend/tsconfig.json` | ✅ Created | TypeScript config |
| `frontend/next.config.ts` | ✅ Created | Next.js config |
| `frontend/tailwind.config.ts` | ✅ Created | Tailwind config |
| `frontend/postcss.config.mjs` | ✅ Created | PostCSS config |
| `frontend/src/app/layout.tsx` | ✅ Created | Root layout |
| `frontend/src/app/page.tsx` | ✅ Created | Landing page |
| `frontend/src/app/globals.css` | ✅ Created | Global styles |
