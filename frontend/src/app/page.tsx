"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import UploadForm from "@/components/UploadForm";
import AnalysisReport from "@/components/AnalysisReport";
import StudioGrid, { STUDIO_OPTIONS } from "@/components/StudioGrid";
import ArtifactModal from "@/components/ArtifactModal";
import { ShieldAlert, Sparkles, FileSearch, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { generateClientArtifact, StudioArtifact } from "@/lib/artifactGenerator";

export default function Home() {
  const [scanResult, setScanResult] = useState<any | null>(null);
  const [documentText, setDocumentText] = useState<string>("");
  const [documentTitle, setDocumentTitle] = useState<string>("Dokumen");
  const [activeTab, setActiveTab] = useState<"audit" | "studio">("audit");

  // Modal & Generation State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedArtifact, setSelectedArtifact] = useState<StudioArtifact | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  const handleScanComplete = (data: any, rawText?: string, title?: string) => {
    setScanResult(data);
    const resolvedText =
      rawText ||
      (data.sentences ? data.sentences.map((s: any) => s.text).join(" ") : "") ||
      "Konten dokumen yang dianalisis.";
    const resolvedTitle = title || data.filename || "Dokumen Masukan";

    setDocumentText(resolvedText);
    setDocumentTitle(resolvedTitle);
    setActiveTab("audit");
  };

  const handleReset = () => {
    setScanResult(null);
    setDocumentText("");
    setDocumentTitle("Dokumen");
    setSelectedArtifact(null);
    setIsModalOpen(false);
  };

  const handleGenerateArtifact = async (artifactType: string) => {
    setGeneratingId(artifactType);
    setIsGenerating(true);
    setIsModalOpen(true);
    setSelectedArtifact(null);

    const targetOpt = STUDIO_OPTIONS.find((o) => o.id === artifactType);
    const titleOpt = targetOpt ? targetOpt.title : "Artefak";

    const candidateEndpoints = [
      `/api/v1/generate/${artifactType}`,
      `http://localhost:8000/api/v1/generate/${artifactType}`,
      `http://127.0.0.1:8000/api/v1/generate/${artifactType}`,
    ];

    try {
      let generatedData = null;
      for (const endpoint of candidateEndpoints) {
        try {
          const response = await fetch(endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              text: documentText,
              title: documentTitle,
            }),
          });

          if (response.ok) {
            const json = await response.json();
            if (json.success && json.data) {
              generatedData = json.data;
              break;
            }
          }
        } catch (e) {
          // try next endpoint
        }
      }

      if (generatedData) {
        setSelectedArtifact(generatedData);
        return;
      }

      // Fallback to high-grade client-side generator engine
      const clientResult = generateClientArtifact(artifactType, documentText, documentTitle);
      setSelectedArtifact(clientResult);
    } catch (err) {
      // Fallback to client generator seamlessly
      const clientResult = generateClientArtifact(artifactType, documentText, documentTitle);
      setSelectedArtifact(clientResult);
    } finally {
      setIsGenerating(false);
      setGeneratingId(null);
    }
  };

  const currentGeneratingOption = STUDIO_OPTIONS.find((o) => o.id === generatingId);

  return (
    <main className="min-h-screen relative overflow-hidden flex flex-col pt-8 pb-24 px-4 sm:px-6 lg:px-8">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-surface-100 via-background to-background dark:from-surface-900 dark:via-background dark:to-background -z-10" />
      <div className="absolute top-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/noise-pattern-with-subtle-cross-lines.png')] opacity-[0.03] pointer-events-none -z-10" />

      {/* Header */}
      <header className="w-full max-w-7xl mx-auto flex items-center justify-between mb-8 lg:mb-12 z-10">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3 cursor-pointer"
          onClick={handleReset}
        >
          <div className="bg-primary text-primary-foreground p-2 rounded-xl shadow-glow-primary">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold font-editorial text-xl leading-none">AI Document Detector</h1>
            <p className="text-muted-foreground text-xs font-mono uppercase tracking-widest mt-1">
              Sistem Integritas & Studio Dokumen
            </p>
          </div>
        </motion.div>

        <motion.nav
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground"
        >
          <a href="#" className="hover:text-foreground transition-colors">
            Cara Kerja
          </a>
          <a href="#" className="hover:text-foreground transition-colors">
            Metodologi
          </a>
          <a href="#" className="hover:text-foreground transition-colors">
            Studio Dokumen
          </a>
          <button
            onClick={handleReset}
            className="bg-foreground text-background px-5 py-2 rounded-full hover:opacity-90 transition-opacity text-xs font-medium"
          >
            Pindai Dokumen Baru
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
              <h1 className="text-display font-editorial mb-4 text-balance">
                Verifikasi integritas & ekstrak dokumen cerdas.
              </h1>
              <p className="text-body-lg text-muted-foreground max-w-2xl mb-8 text-balance leading-relaxed">
                Deteksi AI tingkat lanjut dan Studio Generator otomatis. Ubah dokumen akademis menjadi Podcast Audio, Slide Presentasi, Mind Map, Kuis, dan Laporan Eksekutif.
              </p>

              <div className="w-full">
                <UploadForm onScanComplete={handleScanComplete} />
              </div>

            </motion.div>
          ) : (
            <motion.div
              key="workspace"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-6xl mx-auto flex flex-col gap-6"
            >
              {/* Workspace Navigation Bar: Toggle Audit vs Studio */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-2.5 rounded-2xl glass-panel border border-border/70">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Kembali
                  </button>
                  <div className="h-4 w-px bg-border/60" />
                  <span className="text-xs font-medium text-foreground truncate max-w-[200px] sm:max-w-xs font-editorial">
                    {documentTitle}
                  </span>
                </div>

                {/* Primary Mode Switcher */}
                <div className="flex items-center p-1 rounded-xl bg-surface-100 dark:bg-surface-900 border border-border/50 self-center sm:self-auto">
                  <button
                    onClick={() => setActiveTab("audit")}
                    className={cn(
                      "flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200",
                      activeTab === "audit"
                        ? "bg-foreground text-background shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <FileSearch className="w-3.5 h-3.5" />
                    <span>Audit Integritas AI</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("studio")}
                    className={cn(
                      "flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200",
                      activeTab === "studio"
                        ? "bg-foreground text-background shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                    <span>Studio Dokumen</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-primary/20 text-primary font-mono">
                      9 Artefak
                    </span>
                  </button>
                </div>
              </div>

              {/* Tab 1: Audit Integritas View */}
              {activeTab === "audit" && (
                <div className="flex flex-col gap-6">
                  {/* Studio Banner Callout */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-primary/10 via-surface-900/40 to-primary/5 border border-primary/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="p-2.5 rounded-xl bg-primary/20 text-primary">
                        <Sparkles className="w-5 h-5" />
                      </span>
                      <div>
                        <h4 className="font-bold text-sm text-foreground">
                          Siap membuat Podcast Audio, Slide Presentasi, atau Kuis dari dokumen ini?
                        </h4>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Gunakan Studio Dokumen untuk menghasilkan 9 artefak interaktif berbasis isi teks dokumen Anda.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveTab("studio")}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:opacity-90 transition-opacity flex items-center gap-1.5 shrink-0 shadow-sm"
                    >
                      <span>Buka Studio Dokumen</span>
                      <Sparkles className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <AnalysisReport data={scanResult} onReset={handleReset} />
                </div>
              )}

              {/* Tab 2: Studio Generator View */}
              {activeTab === "studio" && (
                <div className="flex flex-col gap-6">
                  <StudioGrid
                    onSelect={handleGenerateArtifact}
                    activeGeneratingId={generatingId}
                    documentTitle={documentTitle}
                  />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Artifact Modal */}
      <ArtifactModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedArtifact(null);
        }}
        artifact={selectedArtifact}
        documentTitle={documentTitle}
        isGenerating={isGenerating}
        generatingTitle={currentGeneratingOption?.title || "Artefak"}
      />
    </main>
  );
}
