"use client";

import { useState, useRef } from "react";
import { Upload, FileText, AlertCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface UploadFormProps {
  onScanComplete: (data: any) => void;
}

export default function UploadForm({ onScanComplete }: UploadFormProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"file" | "text">("file");
  const [textInput, setTextInput] = useState("");
  
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
    const allowedTypes = [
      "application/pdf", 
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/png"
    ];
    
    if (!allowedTypes.includes(file.type) && !file.name.endsWith('.pdf') && !file.name.endsWith('.docx') && !file.name.match(/\.(jpg|jpeg|png)$/i)) {
      setError("Format file tidak didukung. Harap unggah PDF, DOCX, JPG, atau PNG.");
      return;
    }

    setError(null);
    setIsScanning(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/v1/scan/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Gagal menganalisis dokumen.");
      }

      const data = await response.json();
      onScanComplete(data);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan yang tidak terduga.");
    } finally {
      setIsScanning(false);
    }
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

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail?.[0]?.msg || errData.detail || "Gagal menganalisis teks.");
      }

      const data = await response.json();
      onScanComplete(data);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan yang tidak terduga.");
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto glass-panel rounded-3xl p-6 md:p-10 relative overflow-hidden">
      {/* Decorative gradient orb */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/20 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-secondary/30 rounded-full blur-[80px] pointer-events-none" />
      
      <div className="relative z-10 flex flex-col gap-6">
        
        {/* Mode Switcher */}
        <div className="flex bg-surface-100 dark:bg-surface-900 p-1 rounded-full w-fit mx-auto border border-border/50">
          <button
            onClick={() => { setMode("file"); setError(null); }}
            className={cn(
              "px-6 py-2 rounded-full text-sm font-medium transition-all duration-300",
              mode === "file" 
                ? "bg-primary text-primary-foreground shadow-editorial" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Unggah File
          </button>
          <button
            onClick={() => { setMode("text"); setError(null); }}
            className={cn(
              "px-6 py-2 rounded-full text-sm font-medium transition-all duration-300",
              mode === "text" 
                ? "bg-primary text-primary-foreground shadow-editorial" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Tempel Teks
          </button>
        </div>

        <AnimatePresence mode="wait">
          {mode === "file" ? (
            <motion.div
              key="file"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col gap-4"
            >
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !isScanning && fileInputRef.current?.click()}
                className={cn(
                  "border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 group",
                  isDragging 
                    ? "border-primary bg-primary/5" 
                    : "border-border hover:border-primary/50 hover:bg-surface-50 dark:hover:bg-surface-900",
                  isScanning && "opacity-50 pointer-events-none"
                )}
              >
                <input 
                  type="file" 
                  className="hidden" 
                  ref={fileInputRef} 
                  onChange={handleFileChange}
                  accept=".pdf,.docx,.png,.jpg,.jpeg"
                />
                
                <div className="w-16 h-16 rounded-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500 shadow-sm">
                  <Upload className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                
                <h3 className="text-xl font-bold mb-2 font-editorial">Seret & Lepas dokumen Anda di sini</h3>
                <p className="text-muted-foreground text-sm max-w-sm mb-6">
                  Mendukung PDF, DOCX, dan gambar pindaian (PNG, JPG). Mesin OCR kami akan mengekstrak teks dari gambar secara otomatis.
                </p>
                
                <button className="bg-primary text-primary-foreground px-6 py-2.5 rounded-full font-medium text-sm hover:opacity-90 transition-opacity flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Jelajahi File
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="text"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col gap-4"
            >
              <div className="relative">
                <textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Tempel teks Anda di sini untuk dianalisis..."
                  className="w-full min-h-[300px] p-6 rounded-2xl bg-surface-50 dark:bg-surface-900/50 border border-border focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all duration-300 resize-y font-editorial text-lg leading-relaxed placeholder:text-muted-foreground/60"
                  disabled={isScanning}
                />
                <div className="absolute bottom-4 right-4 text-xs text-muted-foreground font-mono">
                  {textInput.length} karakter
                </div>
              </div>
              <button 
                onClick={handleTextScan}
                disabled={isScanning || textInput.length < 10}
                className="bg-primary text-primary-foreground w-full py-4 rounded-xl font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isScanning ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Menganalisis Teks...
                  </>
                ) : (
                  "Analisis Teks"
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading State Overlay */}
        <AnimatePresence>
          {isScanning && mode === "file" && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-20 glass-panel rounded-3xl flex flex-col items-center justify-center bg-background/80"
            >
              <div className="relative w-20 h-20 mb-6">
                <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <FileText className="w-8 h-8 text-primary animate-pulse" />
                </div>
              </div>
              <h3 className="text-xl font-bold font-editorial">Mengaudit Dokumen...</h3>
              <p className="text-muted-foreground text-sm mt-2">Mengekstrak metadata dan menganalisis fitur linguistik</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-xl flex items-start gap-3 mt-2">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-sm font-medium leading-relaxed">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
