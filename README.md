# 🔍 AI Document Detector

> Prototipe web untuk menganalisis dan mendeteksi teks buatan AI dalam dokumen akademis.

## 🎯 Tujuan

Membantu verifikasi integritas dokumen akademis (tugas mahasiswa, makalah, jurnal) dengan mendeteksi konten yang ditulis oleh AI vs manusia menggunakan NLP dan machine learning.

## ✨ Fitur Utama

- **Academic Integrity & Style Auditor** — Per-sentence AI/Human highlighting dengan confidence scoring
- **Multi-Format & OCR Smart Verifier** — Support PDF, DOCX, dan gambar (OCR)
- **Enterprise Metadata Forensics** — Analisis metadata & deteksi anomali waktu

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14+, Tailwind CSS, TypeScript |
| Backend | Python 3.11+, FastAPI |
| AI/ML | HuggingFace Transformers, EasyOCR |
| Database | PostgreSQL |
| NLP | NLTK, Textstat |

## 📂 Struktur Proyek

```
ai-doc-detector/
├── backend/          # Python FastAPI server
│   ├── main.py       # Entry point
│   ├── models.py     # SQLAlchemy models
│   ├── schemas.py    # Pydantic schemas
│   ├── routers/      # API route handlers
│   └── services/     # Business logic
├── frontend/         # Next.js application
│   ├── src/app/      # App router pages
│   └── src/components/
├── AGENTS.md         # Command center (logbook)
└── README.md         # This file
```

## 🚀 Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # atau venv\Scripts\activate (Windows)
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 📋 Status

- [x] Phase 1: Setup & Initialization
- [ ] Phase 2: Backend API
- [ ] Phase 3: Frontend UI
- [ ] Phase 4: Integration & Testing