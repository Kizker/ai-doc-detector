#!/usr/bin/env bash
# ==============================================================================
# AI Document Detector — Automated Deployment & Update Script
# Target: ~/domains/capm.andrichadhea.my.id/public_html
# Domain: https://capm.andrichadhea.my.id
# ==============================================================================

set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

echo "============================================================"
echo "🚀 [1/3] Menarik Pembaruan Terbaru dari GitHub..."
echo "============================================================"
git fetch origin main
git reset --hard origin/main
git pull origin main

echo "============================================================"
echo "⚡ [2/3] Sinkronisasi Berkas Produksi Web..."
echo "============================================================"

# Jika terdapat build di frontend/out, pastikan disalin ke root public_html
if [ -d "frontend/out" ]; then
    echo "📋 Menyalin aset frontend/out ke root public_html..."
    cp -r frontend/out/* "$ROOT_DIR/" 2>/dev/null || true
fi

# Set permission sesuai standar keamanan web hosting cPanel / LiteSpeed
chmod -R 755 "$ROOT_DIR"
chmod 644 "$ROOT_DIR/.htaccess" 2>/dev/null || true
if [ -f "$ROOT_DIR/index.html" ]; then
    chmod 644 "$ROOT_DIR/index.html"
fi

echo "============================================================"
echo "🔒 [3/3] Verifikasi Integritas Berkas..."
echo "============================================================"
if [ -f "$ROOT_DIR/index.html" ]; then
    echo "✅ Berkas index.html terverifikasi aktif di root."
else
    echo "⚠️ Peringatan: index.html belum ditemukan di root."
fi

if [ -f "$ROOT_DIR/.htaccess" ]; then
    echo "✅ Konfigurasi .htaccess SPA terverifikasi aktif."
fi

echo "============================================================"
echo "🎉 DEPLOYMENT BERHASIL DITERAPKAN!"
echo "🌐 URL Produksi: https://capm.andrichadhea.my.id"
echo "============================================================"
