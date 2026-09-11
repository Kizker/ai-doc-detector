#!/usr/bin/env bash
# ==============================================================================
# AI Document Detector — Docker Automated Deployment Script
# Target: Production Container Environment
# Domain: https://capm.andrichadhea.my.id
# ==============================================================================

set -e

echo "🚀 [1/3] Menarik pembaruan dari GitHub..."
git fetch origin main
git reset --hard origin/main
git pull origin main

echo "🐳 [2/3] Membangun image Docker & merefresh container..."
docker compose build --no-cache
docker compose up -d --remove-orphans

echo "🧹 [3/3] Membersihkan image yang tidak digunakan..."
docker image prune -f

echo "============================================================"
echo "✅ Container Docker AI Document Detector Berhasil Dijalankan!"
echo "🌐 Frontend : http://localhost:3000 (atau via https://capm.andrichadhea.my.id)"
echo "⚙️ Backend  : http://localhost:8000"
echo "============================================================"
docker compose ps
