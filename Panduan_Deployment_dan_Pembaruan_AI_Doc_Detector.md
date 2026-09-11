# 🚀 Panduan Deployment & Pembaruan — AI Document Detector
> **SOP Deployment, Web Hosting cPanel/LiteSpeed & Pembaruan Otomatis via SSH**

---

## 📌 Ringkasan Metadata Server & Domain

| Informasi | Nilai / Konfigurasi |
| :--- | :--- |
| **Akses SSH Server** | `ssh -p 65002 u141095167@46.202.138.88` |
| **Direktori Web Target** | `~/domains/capm.andrichadhea.my.id/public_html` |
| **Domain Utama** | [https://capm.andrichadhea.my.id](https://capm.andrichadhea.my.id) |
| **Repository GitHub** | `https://github.com/Kizker/ai-doc-detector.git` |
| **Stack Produksi** | Next.js 14 Production Bundle + Client-Side Heuristic NLP Engine |
| **Web Server** | LiteSpeed / Apache (Hostinger Shared Web Hosting) |

---

## 1. ⚡ Alur Kerja Rutin Saat Ada Pembaruan (Workflow Cepat)

Setiap kali Anda selesai mengubah kode di komputer lokal (Mac) dan ingin menerapkannya langsung ke website live:

### A. Di Komputer Lokal (Mac): Build & Push ke GitHub
```bash
# 1. Build berkas produksi statis di lokal (Mac ARM64)
cd /Users/andrichadeamitra/Documents/PROJECT/ai-doc-detector/frontend
~/.bun/bin/bun run build
cd ..
cp -r frontend/out/* .

# 2. Commit dan push ke repository GitHub
git add .
git commit -m "feat: pembaruan fitur deteksi dan aset produksi"
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
> Script ini secara otomatis menarik kode & bundle produksi terbaru (`git pull`), menyelaraskan file `index.html` dan `_next/` langsung di root `public_html`, menyetel konfigurasi `.htaccess` SPA bebas error 403, dan menetapkan hak akses file `755`/`644`.

---

## 2. 🛠️ Solusi Tuntas Error 403 Forbidden di Hostinger

Jika browser menampilkan **403 Forbidden**:
1. **Penyebab:** Pada paket Shared Web Hosting Hostinger (CloudLinux), modul Apache `mod_proxy` (`[P]`) dilarang keras demi alasan keamanan isolasi akun. Rule proxy yang mengarah ke port 3000 akan ditolak oleh web server.
2. **Solusi:** Aset web di-build langsung menjadi static export di komputer lokal (`out/`), diletakkan langsung di `public_html/`, dan dilayani secara natif oleh LiteSpeed web server menggunakan rule front-controller SPA:
```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    RewriteCond %{HTTPS} off
    RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
    RewriteCond %{REQUEST_FILENAME} -f [OR]
    RewriteCond %{REQUEST_FILENAME} -d
    RewriteRule ^ - [L]
    RewriteRule ^ index.html [L]
</IfModule>
```
3. **Hasil:** Website terbuka seketika dengan respon sub-milidetik, tanpa 403 Forbidden, dan fitur audit AI Document Detector berjalan penuh secara instan!

---

## 3. 🧪 Uji Mandiri & Verifikasi Layanan

Setelah menjalankan `bash deploy.sh`, verifikasi dilakukan dengan:
1. Buka browser dan kunjungi: **[https://capm.andrichadhea.my.id](https://capm.andrichadhea.my.id)**
2. Pastikan antarmuka "Awwwards Mono Editorial" bernuansa gelap muncul dengan mulus.
3. Masukkan paragraf teks pada tab **Tempel Teks** dan klik **Analisis Teks**.
4. Sistem akan langsung menampilkan:
   - Skor Probabilitas AI & Manusia (%)
   - Highlighting per kalimat (Merah = AI, Hijau = Manusia, Kuning = Parafrase)
   - Skor Perplexity, Tingkat Burstiness, dan Tingkat Repetisi.
