#!/usr/bin/env bash
# ==============================================================================
# AI Document Detector — Automated Deployment & Update Script
# Target: ~/domains/capm.andrichadhea.my.id/public_html
# Domain: https://capm.andrichadhea.my.id
# ==============================================================================

set -e

echo "🚀 [1/4] Menarik pembaruan terbaru dari GitHub (main branch)..."
git fetch origin main
git reset --hard origin/main
git pull origin main

echo "🐳 [2/4] Memeriksa container engine & menjalankan orkestrasi..."
if command -v docker &> /dev/null && docker compose version &> /dev/null; then
    echo "⚡ Menjalankan deployment via Docker Compose..."
    docker compose up -d --build --remove-orphans
    echo "✅ Container status:"
    docker compose ps
elif command -v docker-compose &> /dev/null; then
    echo "⚡ Menjalankan deployment via docker-compose (v1)..."
    docker-compose up -d --build
else
    echo "⚠️ Docker tidak ditemukan di server. Memeriksa Node.js dan Python lokal..."
    if [ -f "frontend/package.json" ]; then
        cd frontend
        npm install && npm run build
        cd ..
    fi
fi

echo "🔒 [3/4] Mengatur hak akses file & konfigurasi reverse proxy..."
chmod -R 755 .
chmod 644 .htaccess 2>/dev/null || true

echo "🧹 [4/4] Verifikasi status layanan..."
sleep 2
if command -v curl &> /dev/null; then
    echo "🔍 Menguji respons port lokal 3000..."
    curl -s -I http://127.0.0.1:3000/ | head -n 3 || echo "ℹ️ Container sedang inisialisasi awal..."
fi

echo "============================================================"
echo "✅ Deployment AI Document Detector Berhasil Diterapkan!"
echo "🌐 Akses Website: https://capm.andrichadhea.my.id"
echo "📑 Dokumentasi API: http://127.0.0.1:8000/docs (Internal)"
echo "============================================================"
