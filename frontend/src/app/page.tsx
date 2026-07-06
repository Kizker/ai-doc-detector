"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import UploadForm from "@/components/UploadForm";
import AnalysisReport from "@/components/AnalysisReport";
import { ShieldAlert, BookOpen } from "lucide-react";

export default function Home() {
  const [scanResult, setScanResult] = useState<any | null>(null);

  const handleReset = () => {
    setScanResult(null);
  };

  return (
    <main className="min-h-screen relative overflow-hidden flex flex-col pt-12 pb-24 px-4 sm:px-6 lg:px-8">
      
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-surface-100 via-background to-background dark:from-surface-900 dark:via-background dark:to-background -z-10" />
      <div className="absolute top-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/noise-pattern-with-subtle-cross-lines.png')] opacity-[0.03] pointer-events-none -z-10" />

      {/* Header */}
      <header className="w-full max-w-7xl mx-auto flex items-center justify-between mb-16 lg:mb-24 z-10">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <div className="bg-primary text-primary-foreground p-2 rounded-xl shadow-glow-primary">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold font-editorial text-xl leading-none">AI Document Detector</h1>
            <p className="text-muted-foreground text-xs font-mono uppercase tracking-widest mt-1">Sistem Integritas Akademik</p>
          </div>
        </motion.div>

        <motion.nav 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground"
        >
          <a href="#" className="hover:text-foreground transition-colors">Cara Kerja</a>
          <a href="#" className="hover:text-foreground transition-colors">Metodologi</a>
          <a href="#" className="hover:text-foreground transition-colors">Akses API</a>
          <button className="bg-foreground text-background px-5 py-2 rounded-full hover:opacity-90 transition-opacity">
            Dokumentasi
          </button>
        </motion.nav>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 w-full flex flex-col items-center justify-center z-10">
        <AnimatePresence mode="wait">
          
          {!scanResult ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-4xl flex flex-col items-center text-center"
            >
              <h1 className="text-display font-editorial mb-6 text-balance">
                Verifikasi integritas akademik dengan presisi.
              </h1>
              <p className="text-body-lg text-muted-foreground max-w-2xl mb-12 text-balance leading-relaxed">
                Deteksi AI tingkat lanjut yang menggabungkan heuristik linguistik, forensik metadata, dan pengenalan karakter optik untuk memastikan keaslian di era generatif.
              </p>
              
              <div className="w-full">
                <UploadForm onScanComplete={setScanResult} />
              </div>

              {/* Trust indicators */}
              <div className="mt-16 flex items-center justify-center gap-8 opacity-50 grayscale">
                <div className="flex items-center gap-2 font-bold font-editorial text-lg">
                  <BookOpen className="w-5 h-5" /> Dipercaya Universitas
                </div>
                <div className="w-1 h-1 rounded-full bg-foreground" />
                <div className="flex items-center gap-2 font-bold font-editorial text-lg">
                  <ShieldAlert className="w-5 h-5" /> Skala Perusahaan
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="report"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="w-full"
            >
              <AnalysisReport data={scanResult} onReset={handleReset} />
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </main>
  );
}
