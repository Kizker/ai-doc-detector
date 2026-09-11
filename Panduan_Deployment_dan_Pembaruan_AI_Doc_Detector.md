# 🚀 Panduan Deployment & Pembaruan — AI Document Detector
> **SOP Deployment, Docker Multi-Container & Pembaruan Otomatis ke Server Hostinger via SSH**

---

## 📌 Ringkasan Metadata Server & Domain

| Informasi | Nilai / Konfigurasi |
| :--- | :--- |
| **Akses SSH Server** | `ssh -p 65002 u141095167@46.202.138.88` |
| **Direktori Web Target** | `~/domains/capm.andrichadhea.my.id/public_html` |
| **Domain Utama** | [https://capm.andrichadhea.my.id](https://capm.andrichadhea.my.id) |
| **Repository GitHub** | `https://github.com/Kizker/ai-doc-detector.git` |
| **Stack Engine** | Next.js 14 + FastAPI (Python 3.11) |
| **Container Engine** | Docker Compose (Multi-Container: Frontend & Backend) |

---

## 1. ⚡ Alur Kerja Rutin Saat Ada Pembaruan (Workflow Cepat)

Setiap kali Anda selesai mengubah kode di komputer lokal dan ingin menerapkannya langsung ke website live:

### A. Di Komputer Lokal (Mac / PC): Push ke GitHub
```bash
# 1. Commit dan push ke repository GitHub
git add .
git commit -m "feat: pembaruan fitur deteksi dan orkestrasi"
git push origin main
```

### B. Di Server Hostinger: Terapkan Pembaruan (1 Baris Perintah)
```bash
# 1. Login SSH ke Server Hostinger
ssh -p 65002 u141095167@46.202.138.88

# 2. Masuk ke direktori web & jalankan deploy script
cd ~/domains/capm.andrichadhea.my.id/public_html
bash deploy.sh
```

> 💡 **Apa yang dilakukan `bash deploy.sh`?**  
> Script ini secara otomatis menarik kode terbaru (`git pull`), membangun ulang container Docker (Next.js port 3000 & FastAPI port 8000), menyetel hak akses file `755`/`644`, dan melakukan pengecekan kesehatan server.

---

## 2. 🛠️ Setup Awal / Pemulihan Server (Fresh Installation)

Jika direktori di server masih kosong atau Anda ingin melakukan instalasi ulang bersih:

```bash
# 1. Masuk ke server via SSH
ssh -p 65002 u141095167@46.202.138.88

# 2. Buat direktori dan inisialisasi git
mkdir -p ~/domains/capm.andrichadhea.my.id/public_html
cd ~/domains/capm.andrichadhea.my.id/public_html

git init
git remote remove origin 2>/dev/null || true
git remote add origin https://github.com/Kizker/ai-doc-detector.git
git fetch origin main
git reset --hard origin/main
git pull origin main

# 3. Hapus file bawaan hosting jika ada
rm -f default.php index.php.bak

# 4. Beri hak akses dan jalankan deployment
chmod +x deploy.sh deploy-docker.sh
bash deploy.sh
```

---

## 3. 🐳 Arsitektur Container Docker

Aplikasi ini diorkestrasikan dengan `docker compose` yang menjalankan 2 container terisolasi:

```
[Pengunjung Web] ➔ https://capm.andrichadhea.my.id
                         │
                  [Apache / LiteSpeed]
                         │ (.htaccess reverse proxy)
                         ▼
        ┌──────────────────────────────────────────────────┐
        │ Docker Network (ai_doc_detector_net)             │
        │                                                  │
        │  [Frontend Container] (Next.js 14 Standalone)    │
        │  Port: 3000                                      │
        │        │                                         │
        │        │ (Internal rewrite: /api/*)              │
        │        ▼                                         │
        │  [Backend Container] (FastAPI / Uvicorn Python)  │
        │  Port: 8000                                      │
        └──────────────────────────────────────────────────┘
```

### Perintah Manual Docker:
```bash
# Menjalankan container di background
docker compose up -d --build

# Melihat container yang aktif
docker compose ps

# Membaca log real-time
docker compose logs -f

# Otomasi build bersih tanpa cache
bash deploy-docker.sh
```

---

## 4. 🌐 Konfigurasi Reverse Proxy

### Hostinger / Apache / LiteSpeed (`.htaccess`)
File `.htaccess` sudah disediakan otomatis di root direktori untuk meneruskan traffic domain ke port 3000:
```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteCond %{HTTPS} off
    RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

    RewriteCond %{HTTP:Upgrade} =websocket [NC]
    RewriteRule ^(.*)$ ws://127.0.0.1:3000/$1 [P,L]

    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule ^(.*)$ http://127.0.0.1:3000/$1 [P,L]
</IfModule>
```

### VPS Nginx Native (Jika Menggunakan Server VPS Terpisah)
```nginx
server {
    server_name capm.andrichadhea.my.id;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 5. 🔍 Troubleshooting & Solusi

1. **Error 502 Bad Gateway**:
   - Periksa apakah container aktif: `docker compose ps`.
   - Cek log error backend: `docker compose logs backend`.
2. **Upload Dokumen Gagal / Timeout**:
   - Jika menggunakan Nginx di depan reverse proxy, pastikan `client_max_body_size 50M;` telah dipasang.
3. **Tampilan Belum Berubah Setelah Pembaruan**:
   - Lakukan Hard Refresh: `Cmd + Shift + R` (Mac) atau `Ctrl + F5` (Windows).
   - Jika domain menggunakan Cloudflare, bersihkan cache (*Purge Cache ➔ Purge Everything*).
