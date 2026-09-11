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

### [2026-09-11 21:52] — Fase 5: Setup & Eksekusi Lokal macOS (Apple Silicon ARM64)
- Setup Python venv di `backend/.venv` dengan dependensi inti (FastAPI, Uvicorn, Pydantic, Python-Multipart, NLTK, Textstat, python-docx, pdfplumber).
- Optimasi `backend/services/ai_detector.py`: Memperbaiki `_setup_nltk` agar tidak blocking saat startup jika paket NLTK belum terunduh (menggunakan regex fallback yang ultra-cepat).
- Instalasi dependensi frontend melalui Bun (`bun install`).
- Menjalankan Backend FastAPI di port 8000 (`http://localhost:8000`).
- Menjalankan Frontend Next.js di port 3000 (`http://localhost:3000`).
- Verifikasi API scan `/api/v1/scan/text` berhasil melalui proxy Next.js dengan latensi ~3ms.
- Membuka aplikasi secara otomatis di browser default sistem macOS (`open http://localhost:3000`).

### [2026-09-11 22:05] — Fase 6: Persiapan Deployment SSH & Docker (Target: capm.andrichadhea.my.id)
- Mengonfigurasi `frontend/next.config.mjs` untuk output standalone dan dynamic rewrite URL (`BACKEND_INTERNAL_URL`).
- Membuat multi-stage `frontend/Dockerfile` berbasis `node:20-alpine` dengan unprivileged user `nextjs`.
- Membuat `backend/Dockerfile` berbasis `python:3.11-slim` dengan healthcheck endpoint.
- Membuat `docker-compose.yml` untuk menghubungkan frontend (port 3000) dan backend (port 8000) dalam internal network bridge.
- Membuat file `.dockerignore` untuk context build yang ramping dan cepat.
### [2026-09-11 23:10] — Fase 7: Penambahan Kemampuan Studio Generator Berbasis Dokumen (Ala NotebookLM)
- Mengimplementasikan `backend/services/artifact_generator.py` untuk menghasilkan 9 jenis artefak dokumen (Audio Overview, Slide Deck, Video Overview, Mind Map, Reports, Flashcards, Quiz, Infographic, Data Table).
- Mengimplementasikan `backend/routers/generate.py` dengan endpoint `/api/v1/generate/{artifact_type}` dan `/api/v1/scan/url`.
- Mengimplementasikan generator deterministik sisi klien `frontend/src/lib/artifactGenerator.ts` untuk fallback offline dan performa secepat kilat.
- Mengimplementasikan antarmuka input multi-sumber pada `frontend/src/components/UploadForm.tsx` (Upload files, Websites, Drive, Play Books, Copied text) persis seperti referensi visual pengguna.
- Membuat komponen grid visual `frontend/src/components/StudioGrid.tsx` dengan 9 kartu bergaya dark editorial glassmorphism.
- Membuat modal interaktif `frontend/src/components/ArtifactModal.tsx` dengan fitur:
  - Pemutar audio podcast dengan Web Speech API (suara Alex & Taylor dwibahasa).
  - Penampil dek presentasi slide 16:9 interaktif dengan catatan presenter.
  - Penampil storyboard video dengan arahan visual dan voiceover.
  - Diagram visual hierarkis peta pikiran (mind map).
  - Laporan eksekutif siap salin dan cetak.
  - Kartu belajar 3D flashcards yang dapat dibalik dengan pelacak penguasaan.
  - Kuis pilihan ganda interaktif dengan skor langsung dan ulasan jawaban.
  - Sorotan statistik dan kartu infografis.
  - Tabel data terstruktur dengan filter pencarian dan unduh file CSV.
- Mengintegrasikan navigasi tab ganda (`Audit Integritas` dan `Studio Dokumen`) pada `frontend/src/app/page.tsx`.
### [2026-09-11 23:15] — Fase 8: Penyempurnaan Koneksi Universal & Dukungan Seluruh Format Unggahan
- Memperbaiki proxy `frontend/next.config.mjs` dengan aturan `rewrites` ke backend port 8000 (`/api/:path*` ➔ `http://127.0.0.1:8000/api/:path*`).
- Mengaktifkan CORS wildcard (`allow_origins=["*"]`) pada backend FastAPI agar pemanggilan langsung dari frontend port 3000 tidak terhambat.
- Memperluas format unggahan yang didukung di `backend/routers/scan.py` dan `backend/services/text_extractor.py` (PDF, DOCX, DOC, TXT, MD, CSV, TSV, JSON, RTF, HTML, LOG, PNG, JPG, JPEG, WEBP, BMP).
- Mengimplementasikan mekanisme fallback berlapis (*multi-endpoint resilience*) pada `frontend/src/components/UploadForm.tsx` yang secara otomatis mencoba `/api/v1/scan/upload`, `http://localhost:8000/api/v1/scan/upload`, dan `http://127.0.0.1:8000/api/v1/scan/upload`.
- Menambahkan fallback ekstraksi teks sisi klien (*client-side text decoding & detection*) sehingga dokumen jenis teks apa pun tetap berhasil dianalisis bahkan jika koneksi server terganggu.
- Verifikasi berhasil: Uji unggah PDF (`PRD_AI_Document_Detector_Lengkap.pdf`), Markdown (`README.md`), dan teks berhasil 100% dengan status `200 OK`.
- Mengimplementasikan favicon resmi aplikasi (`favicon.ico` dan `favicon.svg`) dengan desain logo perisai integritas (*ShieldAlert* berlatar gelap dan aksen biru neon) yang terintegrasi di `frontend/src/app/layout.tsx`.

### [2026-09-11 23:20] — Fase 9: Pembersihan Elemen Trust Indicator Halaman Utama
- Menghapus elemen *trust indicator* (`Dipercaya Universitas • Skala Riset & Industri`) pada `frontend/src/app/page.tsx` sesuai permintaan pengguna agar tampilan landing page lebih bersih dan fokus.
- Membersihkan impor icon `BookOpen` dari `lucide-react` yang tidak lagi terpakai.
- Verifikasi build Next.js (`bun run build`) berhasil 100% tanpa error dan halaman lokal teruji bersih.

---


## 📂 File Registry

| File | Status | Deskripsi |
|------|--------|-----------|
| `AGENTS.md` | ✅ Updated | Pusat komando proyek |
| `README.md` | ✅ Updated | Deskripsi proyek |
| `backend/requirements.txt` | ✅ Created | Python dependencies |
| `backend/main.py` | ✅ Updated | FastAPI entry point + generate router |
| `backend/config.py` | ✅ Created | App configuration |
| `backend/models.py` | ✅ Created | SQLAlchemy models |
| `backend/schemas.py` | ✅ Created | Pydantic schemas |
| `backend/routers/__init__.py` | ✅ Created | Router package |
| `backend/routers/scan.py` | ✅ Created | Scan endpoint |
| `backend/routers/generate.py` | ✅ Created | Studio artifact generation & URL scraper endpoint |
| `backend/services/__init__.py` | ✅ Created | Services package |
| `backend/services/ai_detector.py` | ✅ Created | AI detection logic |
| `backend/services/artifact_generator.py` | ✅ Created | 9-in-1 Studio content generation engine |
| `backend/services/ocr_service.py` | ✅ Created | OCR processing |
| `backend/services/text_extractor.py` | ✅ Created | Text extraction |
| `backend/Dockerfile` | ✅ Created | Dockerfile FastAPI container |
| `frontend/package.json` | ✅ Created | Node.js config |
| `frontend/tsconfig.json` | ✅ Created | TypeScript config |
| `frontend/next.config.mjs` | ✅ Updated | Next.js config (standalone & proxy) |
| `frontend/tailwind.config.ts` | ✅ Created | Tailwind config |
| `frontend/postcss.config.mjs` | ✅ Created | PostCSS config |
| `frontend/src/app/layout.tsx` | ✅ Created | Root layout |
| `frontend/src/app/page.tsx` | ✅ Updated | Landing page + Studio tab switcher |
| `frontend/src/app/globals.css` | ✅ Created | Global styles |
| `frontend/src/lib/artifactGenerator.ts` | ✅ Created | Client-side studio generator engine |
| `frontend/src/components/UploadForm.tsx` | ✅ Updated | Multi-source upload pill bar |
| `frontend/src/components/StudioGrid.tsx` | ✅ Created | 9-tile Studio Generator grid UI |
| `frontend/src/components/ArtifactModal.tsx` | ✅ Created | Specialized interactive viewers modal |
| `frontend/Dockerfile` | ✅ Created | Multi-stage Dockerfile Next.js |
| `docker-compose.yml` | ✅ Created | Orkestrasi Docker multi-container |
| `.dockerignore` | ✅ Created | Docker ignore context rules |
| `.htaccess` | ✅ Created | Apache/LiteSpeed reverse proxy |
| `deploy.sh` | ✅ Created | Skrip deployment otomatis server SSH |
| `deploy-docker.sh` | ✅ Created | Skrip rebuild Docker di server |
| `Panduan_Deployment_dan_Pembaruan_AI_Doc_Detector.html` | ✅ Created | Panduan visual SOP deployment |
| `Panduan_Deployment_dan_Pembaruan_AI_Doc_Detector.md` | ✅ Created | Panduan markdown SOP deployment |
| `Panduan_Deployment_dan_Pembaruan_AI_Doc_Detector.pdf` | ✅ Created | Dokumen cetak PDF SOP deployment resmi |

