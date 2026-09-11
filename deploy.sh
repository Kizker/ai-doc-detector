#!/usr/bin/env bash
# ==============================================================================
# AI Document Detector — Automated Deployment & Update Script
# Target: ~/domains/capm.andrichadhea.my.id/public_html
# Domain: https://capm.andrichadhea.my.id
# ==============================================================================

set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

echo "🚀 [1/4] Menarik pembaruan terbaru dari GitHub (main branch)..."
git fetch origin main
git reset --hard origin/main
git pull origin main

echo "🐳 [2/4] Memeriksa container engine & runtime server..."
if command -v docker &> /dev/null && docker compose version &> /dev/null; then
    echo "⚡ Mode VPS: Menjalankan deployment via Docker Compose..."
    docker compose up -d --build --remove-orphans
    echo "✅ Container status:"
    docker compose ps
elif command -v docker-compose &> /dev/null; then
    echo "⚡ Mode VPS: Menjalankan deployment via docker-compose (v1)..."
    docker-compose up -d --build
else
    echo "ℹ️ Mode Shared Hosting: Menjalankan runtime native (Node.js & Python)..."

    # --- Setup Backend FastAPI ---
    echo "🐍 Menyiapkan Backend FastAPI (Python)..."
    if [ -d "backend" ]; then
        cd backend
        PYTHON_BIN="python3"
        if ! command -v python3 &> /dev/null && command -v python &> /dev/null; then
            PYTHON_BIN="python"
        fi

        if [ ! -d ".venv" ]; then
            echo "⚡ Membuat virtual environment Python..."
            $PYTHON_BIN -m venv .venv 2>/dev/null || virtualenv .venv 2>/dev/null || true
        fi

        if [ -f ".venv/bin/pip" ]; then
            echo "📦 Memeriksa dependensi backend..."
            .venv/bin/pip install --quiet -r requirements.txt || true
        fi

        # Restart backend process jika belum berjalan di port 8000
        pkill -f "uvicorn.*8000" 2>/dev/null || true
        echo "🚀 Memulai server FastAPI di port 8000..."
        if [ -f ".venv/bin/uvicorn" ]; then
            nohup .venv/bin/uvicorn main:app --host 127.0.0.1 --port 8000 > "$ROOT_DIR/backend.log" 2>&1 &
        else
            nohup $PYTHON_BIN -m uvicorn main:app --host 127.0.0.1 --port 8000 > "$ROOT_DIR/backend.log" 2>&1 &
        fi
        cd "$ROOT_DIR"
    fi

    # --- Setup Frontend Next.js ---
    echo "⚛️ Menyiapkan Frontend Next.js..."
    if [ -d "frontend" ]; then
        cd frontend

        # Cegah error thread pool Rust/Rayon di CloudLinux/Hostinger Shared Hosting
        export RAYON_NUM_THREADS=1
        export NEXT_CPU_COUNT=1
        export UV_THREADPOOL_SIZE=1
        export NODE_OPTIONS="--max-old-space-size=1024"

        if [ ! -d "node_modules" ]; then
            echo "📦 Menginstal dependensi frontend..."
            npm install --production=false --quiet
        fi

        echo "⚡ Mengompilasi Next.js dengan single-thread mode..."
        npm run build || {
            echo "⚠️ Build di server gagal karena batasan thread. Menggunakan build sebelumnya jika ada..."
        }

        # Restart frontend process jika belum berjalan di port 3000
        pkill -f "next-server.*3000|node.*server.js" 2>/dev/null || true
        echo "🚀 Memulai server Frontend Next.js di port 3000..."
        if [ -f ".next/standalone/server.js" ]; then
            # Salin aset statis jika diperlukan oleh standalone
            cp -rn .next/static .next/standalone/.next/ 2>/dev/null || true
            cp -rn public .next/standalone/ 2>/dev/null || true
            nohup node .next/standalone/server.js > "$ROOT_DIR/frontend.log" 2>&1 &
        else
            nohup npm start -- -p 3000 > "$ROOT_DIR/frontend.log" 2>&1 &
        fi
        cd "$ROOT_DIR"
    fi
fi

echo "🔒 [3/4] Mengatur hak akses file & konfigurasi reverse proxy..."
chmod -R 755 .
chmod 644 .htaccess 2>/dev/null || true

echo "🧹 [4/4] Verifikasi status layanan..."
sleep 3
if command -v curl &> /dev/null; then
    echo "🔍 Menguji respons port lokal 3000..."
    curl -s -I http://127.0.0.1:3000/ | head -n 3 || echo "ℹ️ Layanan sedang melakukan inisialisasi awal di background..."
fi

echo "============================================================"
echo "✅ Deployment AI Document Detector Berhasil Diterapkan!"
echo "🌐 Akses Website: https://capm.andrichadhea.my.id"
echo "📑 Dokumentasi API: http://127.0.0.1:8000/docs"
echo "============================================================"
