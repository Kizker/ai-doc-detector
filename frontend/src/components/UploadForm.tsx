"use client";

import { useState, useRef } from "react";
import {
  Upload,
  FileText,
  AlertCircle,
  Loader2,
  Globe,
  HardDrive,
  BookOpen,
  Clipboard,
  Link as LinkIcon,
  CheckCircle2,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { analyzeTextClientSide } from "@/lib/detector";

export type UploadSource = "files" | "websites" | "drive" | "play_books" | "copied_text";

interface UploadFormProps {
  onScanComplete: (data: any, rawText?: string, title?: string) => void;
}

const SAMPLE_DRIVE_DOCS = [
  {
    title: "Kajian Etika AI dalam Riset Akademik 2026.pdf",
    source: "Google Drive / Riset Pascasarjana",
    text: `Kajian ini meneliti transformasi metodologi penelitian di perguruan tinggi akibat adopsi kecerdasan buatan generatif. Mahasiswa dan peneliti semakin mengandalkan model bahasa besar (LLM) untuk sintesis literatur, pembuatan draf hipotesis, dan penyuntingan naskah. Meskipun efisiensi penulisan meningkat signifikan, timbul tantangan etika mendasar mengenai atribusi orisinalitas, potensi halusinasi fakta, dan degradasi penalaran kritis independen. Universitas dituntut untuk menetapkan kerangka integritas akademik yang transparan, mewajibkan deklarasi penggunaan alat AI, serta menerapkan protokol verifikasi silang terhadap temuan empiris. Dengan demikian, teknologi berfungsi sebagai akselerator intelektual tanpa mengorbankan kejujuran ilmiah.`,
  },
  {
    title: "Analisis Dampak LLM pada Integritas Ilmiah.docx",
    source: "Google Drive / Publikasi Jurnal",
    text: `Pemanfaatan model bahasa skala besar dalam penulisan manuskrip ilmiah telah memicu perdebatan sengit di kalangan editor jurnal internasional. Observasi linguistik memperlihatkan bahwa teks buatan AI cenderung memiliki perplexity yang rendah dan variasi struktur kalimat yang seragam. Pola pengulangan frasa transisi dan leksikal yang kaku menjadi indikator kuat keterlibatan mesin. Dokumen ini merekomendasikan audit forensik berbasis probabilitas kata serta peninjauan riwayat revisi dokumen secara berkala. Peneliti diharapkan menjaga standar rigoritas tertinggi dalam setiap klaim kontribusi kebaruan ilmiah.`,
  },
];

const SAMPLE_PLAY_BOOKS = [
  {
    title: "Buku: Filsafat Ilmu & Etika Penulisan Modern",
    author: "Prof. Dr. H. Soedarmono",
    text: `Filsafat ilmu bertumpu pada pencarian kebenaran yang dapat diverifikasi secara objektif dan bertanggung jawab. Dalam era digital, integritas seorang akademisi tercermin bukan hanya pada apa yang dipublikasikan, melainkan pada kejujuran proses penalaran yang melatarbelakanginya. Peniruan otomatis atau fabrikasi data tanpa proses kontemplasi mereduksi esensi kemanusiaan dalam ilmu pengetahuan. Buku ini mengajak pembaca kembali ke fondasi epistemologis: bahwa pengetahuan sejati lahir dari pergulatan pemikiran manusia yang otentik.`,
  },
  {
    title: "Buku: Panduan Metodologi Penelitian Kuantitatif",
    author: "Tim Konsorsium Akademik",
    text: `Metodologi kuantitatif mensyaratkan validitas konstruk dan reliabilitas instrumen yang tidak dapat dikompromikan. Setiap angka yang dipresentasikan harus dapat ditelusuri kembali ke sumber instrumen pengumpulan data aslinya. Pelanggaran etika penelitian sering bermula dari ketidakhati-hatian dalam mengutip dan menyajikan data sekunder. Disiplin verifikasi dokumen dan pengujian statistik berlapis adalah prasyarat mutlak untuk menghasilkan karya ilmiah bereputasi tinggi.`,
  },
];

export default function UploadForm({ onScanComplete }: UploadFormProps) {
  const [source, setSource] = useState<UploadSource>("files");
  const [isDragging, setIsDragging] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Inputs
  const [textInput, setTextInput] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await processFile(e.target.files[0]);
    }
  };

  const processFile = async (file: File) => {
    setError(null);
    setIsScanning(true);

    const isPlainText =
      file.type.startsWith("text/") ||
      file.name.match(/\.(txt|md|markdown|json|csv|tsv|rtf|html|htm|log|xml|yaml|yml)$/i);

    // Fast client-side path for text files
    if (isPlainText) {
      try {
        const text = await file.text();
        if (text && text.trim().length >= 10) {
          const clientResult = analyzeTextClientSide(text);
          clientResult.filename = file.name;
          clientResult.file_type = file.name.split(".").pop() || "txt";
          onScanComplete(clientResult, text, file.name);
          setIsScanning(false);
          return;
        }
      } catch (e) {
        // Fall back to server upload
      }
    }

    const formData = new FormData();
    formData.append("file", file);

    const candidateUrls = [
      "/api/v1/scan/upload",
      "http://localhost:8000/api/v1/scan/upload",
      "http://127.0.0.1:8000/api/v1/scan/upload",
    ];

    let successData: any = null;
    let lastErrorMsg = "Gagal memproses berkas di server.";

    for (const endpoint of candidateUrls) {
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          successData = await response.json();
          break;
        } else {
          const errJson = await response.json().catch(() => ({}));
          if (errJson.detail) {
            lastErrorMsg = errJson.detail;
          }
        }
      } catch (err: any) {
        lastErrorMsg = err.message || lastErrorMsg;
      }
    }

    if (successData) {
      const extractedText =
        successData.sentences && successData.sentences.length > 0
          ? successData.sentences.map((s: any) => s.text).join(" ")
          : file.name;
      onScanComplete(successData, extractedText, file.name);
      setIsScanning(false);
      return;
    }

    // Secondary fallback: Try extracting strings from file text
    try {
      const fallbackText = await file.text();
      // Clean readable text
      const cleaned = fallbackText.replace(/[^\x20-\x7E\s\u00A0-\u024F]/g, " ").replace(/\s+/g, " ").trim();
      if (cleaned.length >= 30) {
        const clientResult = analyzeTextClientSide(cleaned);
        clientResult.filename = file.name;
        clientResult.file_type = file.name.split(".").pop() || "doc";
        onScanComplete(clientResult, cleaned, file.name);
        setIsScanning(false);
        return;
      }
    } catch (fallbackErr) {
      // Ignored
    }

    setError(lastErrorMsg);
    setIsScanning(false);
  };

  const handleTextScan = async () => {
    if (textInput.trim().length < 10) {
      setError("Harap masukkan setidaknya 10 karakter teks.");
      return;
    }

    setError(null);
    setIsScanning(true);

    try {
      const response = await fetch("/api/v1/scan/text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: textInput }),
      });

      if (response.ok) {
        const data = await response.json();
        onScanComplete(data, textInput, "Teks Masukan");
        return;
      }

      const clientResult = analyzeTextClientSide(textInput);
      onScanComplete(clientResult, textInput, "Teks Masukan");
    } catch (err: any) {
      const clientResult = analyzeTextClientSide(textInput);
      onScanComplete(clientResult, textInput, "Teks Masukan");
    } finally {
      setIsScanning(false);
    }
  };

  const handleUrlScan = async () => {
    if (!urlInput.trim() || urlInput.length < 5) {
      setError("Harap masukkan URL website yang valid.");
      return;
    }

    setError(null);
    setIsScanning(true);

    const candidateUrls = [
      "/api/v1/scan/url",
      "http://localhost:8000/api/v1/scan/url",
      "http://127.0.0.1:8000/api/v1/scan/url",
    ];

    let resData: any = null;
    let lastErr = "Gagal mengambil teks dari halaman web.";

    for (const endpoint of candidateUrls) {
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ url: urlInput }),
        });

        if (response.ok) {
          resData = await response.json();
          break;
        } else {
          const err = await response.json().catch(() => ({}));
          if (err.detail) lastErr = err.detail;
        }
      } catch (err: any) {
        lastErr = err.message || lastErr;
      }
    }

    if (resData && resData.extracted_text) {
      const clientResult = analyzeTextClientSide(resData.extracted_text);
      clientResult.filename = urlInput;
      clientResult.file_type = "web";
      onScanComplete(clientResult, resData.extracted_text, urlInput);
    } else {
      setError(lastErr);
    }
    setIsScanning(false);
  };

  const handleSelectSample = (sample: { title: string; text: string }) => {
    setError(null);
    setIsScanning(true);
    setTimeout(() => {
      const result = analyzeTextClientSide(sample.text);
      result.filename = sample.title;
      result.file_type = "sample";
      onScanComplete(result, sample.text, sample.title);
      setIsScanning(false);
    }, 400);
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col items-center gap-6">
      {/* Top Tagline matching user screenshot */}
      <div className="text-center">
        <h3 className="text-xl sm:text-2xl font-editorial font-bold text-foreground">
          or drop your files
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          pdf, images, docs, audio, <span className="underline cursor-pointer hover:text-foreground">and more</span>
        </p>
      </div>

      {/* Pill Navigation Bar matching Screenshot 1 */}
      <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 rounded-full bg-white dark:bg-surface-900 border border-border/80 shadow-sm max-w-full">
        {/* 1. Upload files */}
        <button
          onClick={() => {
            setSource("files");
            setError(null);
          }}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200",
            source === "files"
              ? "bg-foreground text-background shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-surface-100 dark:hover:bg-surface-800"
          )}
        >
          <Upload className="w-4 h-4" />
          <span>Upload files</span>
        </button>

        {/* 2. Websites */}
        <button
          onClick={() => {
            setSource("websites");
            setError(null);
          }}
          className={cn(
            "flex items-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200",
            source === "websites"
              ? "bg-foreground text-background shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-surface-100 dark:hover:bg-surface-800"
          )}
        >
          <LinkIcon className="w-3.5 h-3.5" />
          <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
          <span>Websites</span>
        </button>

        {/* 3. Drive */}
        <button
          onClick={() => {
            setSource("drive");
            setError(null);
          }}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200",
            source === "drive"
              ? "bg-foreground text-background shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-surface-100 dark:hover:bg-surface-800"
          )}
        >
          <HardDrive className="w-4 h-4 text-emerald-500" />
          <span>Drive</span>
        </button>

        {/* 4. Play Books */}
        <button
          onClick={() => {
            setSource("play_books");
            setError(null);
          }}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200",
            source === "play_books"
              ? "bg-foreground text-background shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-surface-100 dark:hover:bg-surface-800"
          )}
        >
          <BookOpen className="w-4 h-4 text-blue-500" />
          <span>Play Books</span>
        </button>

        {/* 5. Copied text */}
        <button
          onClick={() => {
            setSource("copied_text");
            setError(null);
          }}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200",
            source === "copied_text"
              ? "bg-foreground text-background shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-surface-100 dark:hover:bg-surface-800"
          )}
        >
          <Clipboard className="w-4 h-4" />
          <span>Copied text</span>
        </button>
      </div>

      {/* Main Form Container */}
      <div className="w-full glass-panel rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        {/* Decorative gradient orb */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-secondary/20 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-4">
          <AnimatePresence mode="wait">
            {/* SOURCE 1: Upload Files */}
            {source === "files" && (
              <motion.div
                key="files"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="flex flex-col gap-4"
              >
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => !isScanning && fileInputRef.current?.click()}
                  className={cn(
                    "border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 group",
                    isDragging
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50 hover:bg-surface-50 dark:hover:bg-surface-900/60",
                    isScanning && "opacity-50 pointer-events-none"
                  )}
                >
                  <input
                    type="file"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".pdf,.docx,.doc,.txt,.text,.md,.markdown,.rtf,.csv,.json,.html,.htm,.log,.png,.jpg,.jpeg,.webp,.bmp,*/*"
                  />

                  <div className="w-14 h-14 rounded-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-500 shadow-sm">
                    {isScanning ? (
                      <Loader2 className="w-7 h-7 text-primary animate-spin" />
                    ) : (
                      <Upload className="w-7 h-7 text-muted-foreground group-hover:text-primary transition-colors" />
                    )}
                  </div>

                  <h4 className="text-lg font-bold font-editorial text-foreground mb-1">
                    {isScanning ? "Memproses Dokumen..." : "Tarik & Lepas Dokumen Di Sini"}
                  </h4>
                  <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mb-5">
                    Mendukung semua dokumen (PDF, DOCX, TXT, MD, CSV, JSON) dan gambar (OCR otomatis).
                  </p>

                  <button
                    type="button"
                    disabled={isScanning}
                    className="bg-primary text-primary-foreground px-6 py-2 rounded-full font-medium text-xs sm:text-sm hover:opacity-90 transition-opacity flex items-center gap-2 shadow-sm"
                  >
                    <FileText className="w-4 h-4" />
                    Pilih File Komputer
                  </button>
                </div>
              </motion.div>
            )}

            {/* SOURCE 2: Websites (URL) */}
            {source === "websites" && (
              <motion.div
                key="websites"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="flex flex-col gap-4"
              >
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                    Tautan Halaman Web / Artikel / Jurnal Online
                  </label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <Globe className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3.5" />
                      <input
                        type="url"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        placeholder="https://journal.university.edu/article/12345"
                        disabled={isScanning}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface-50 dark:bg-surface-900 border border-border text-sm focus:border-primary focus:outline-none transition-colors"
                      />
                    </div>
                    <button
                      onClick={handleUrlScan}
                      disabled={isScanning || urlInput.length < 5}
                      className="px-6 py-3 rounded-xl font-bold text-sm bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-opacity"
                    >
                      {isScanning ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Mengekstrak...
                        </>
                      ) : (
                        <>
                          <span>Ekstrak & Analisis</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Mesin scraper akan mengekstrak konten artikel utama secara otomatis dan menganalisis integritasnya.
                </p>
              </motion.div>
            )}

            {/* SOURCE 3: Google Drive Samples */}
            {source === "drive" && (
              <motion.div
                key="drive"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="flex flex-col gap-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                    Pilih Berkas Dokumen dari Cloud Drive
                  </span>
                  <span className="text-xs text-emerald-500 font-mono">Tersinkronisasi</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {SAMPLE_DRIVE_DOCS.map((doc, i) => (
                    <button
                      key={i}
                      onClick={() => handleSelectSample(doc)}
                      disabled={isScanning}
                      className="text-left p-4 rounded-xl bg-surface-50 dark:bg-surface-900 border border-border/70 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all group"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <HardDrive className="w-4 h-4 text-emerald-500" />
                        <span className="text-[11px] font-mono text-muted-foreground">{doc.source}</span>
                      </div>
                      <h5 className="font-bold text-sm text-foreground group-hover:text-emerald-500 transition-colors">
                        {doc.title}
                      </h5>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                        {doc.text}
                      </p>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* SOURCE 4: Play Books Samples */}
            {source === "play_books" && (
              <motion.div
                key="play_books"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="flex flex-col gap-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                    Pustaka Buku & Bahan Ajar Akademik
                  </span>
                  <span className="text-xs text-blue-500 font-mono">Koleksi Digital</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {SAMPLE_PLAY_BOOKS.map((book, i) => (
                    <button
                      key={i}
                      onClick={() => handleSelectSample(book)}
                      disabled={isScanning}
                      className="text-left p-4 rounded-xl bg-surface-50 dark:bg-surface-900 border border-border/70 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all group"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <BookOpen className="w-4 h-4 text-blue-500" />
                        <span className="text-[11px] font-mono text-muted-foreground">{book.author}</span>
                      </div>
                      <h5 className="font-bold text-sm text-foreground group-hover:text-blue-500 transition-colors">
                        {book.title}
                      </h5>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                        {book.text}
                      </p>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* SOURCE 5: Copied Text */}
            {source === "copied_text" && (
              <motion.div
                key="copied_text"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="flex flex-col gap-4"
              >
                <div className="relative">
                  <textarea
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Tempel teks atau naskah Anda di sini untuk dianalisis dan digenerate artefak..."
                    className="w-full min-h-[220px] p-5 rounded-2xl bg-surface-50 dark:bg-surface-900/50 border border-border focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all duration-300 resize-y font-editorial text-base leading-relaxed placeholder:text-muted-foreground/60"
                    disabled={isScanning}
                  />
                  <div className="absolute bottom-3 right-3 text-xs text-muted-foreground font-mono">
                    {textInput.length} karakter
                  </div>
                </div>

                <button
                  onClick={handleTextScan}
                  disabled={isScanning || textInput.length < 10}
                  className="bg-primary text-primary-foreground w-full py-3.5 rounded-xl font-bold text-base hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
                >
                  {isScanning ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Menganalisis Dokumen...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Mulai Analisis & Masuk Studio
                    </>
                  )}
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Message with Quick Action */}
          {error && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm text-destructive bg-destructive/10 p-4 rounded-xl border border-destructive/20 mt-2">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>
              {source === "websites" && (
                <button
                  onClick={() => {
                    setError(null);
                    setSource("copied_text");
                  }}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-destructive/20 hover:bg-destructive/30 text-destructive border border-destructive/30 transition-colors shrink-0 self-start sm:self-auto"
                >
                  Beralih ke Tempel Teks ➔
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
