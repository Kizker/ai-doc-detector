"use client";

import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, AlertTriangle, Info, FileSearch } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnalysisReportProps {
  data: any;
  onReset: () => void;
}

export default function AnalysisReport({ data, onReset }: AnalysisReportProps) {
  // Score visualization colors
  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-detect-ai"; // High AI = Red
    if (score >= 30) return "text-detect-mixed"; // Mixed = Orange/Yellow
    return "text-detect-human"; // Low AI = Green
  };

  const getRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case "high": return "text-detect-ai bg-detect-ai/10 border-detect-ai/20";
      case "medium": return "text-detect-mixed bg-detect-mixed/10 border-detect-mixed/20";
      case "low": return "text-detect-human bg-detect-human/10 border-detect-human/20";
      default: return "text-muted-foreground bg-muted/10 border-border";
    }
  };

  const aiScore = data.ai_score || 0;
  const humanScore = data.human_score || 0;
  const scoreColor = getScoreColor(aiScore);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-6xl mx-auto flex flex-col gap-8"
    >
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <button 
          onClick={onReset}
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group"
        >
          <div className="p-2 rounded-full bg-surface-100 dark:bg-surface-800 group-hover:bg-surface-200 dark:group-hover:bg-surface-700 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </div>
          Pindai Dokumen Lain
        </button>
        
        <div className="text-sm font-mono text-muted-foreground">
          Waktu pemrosesan: {data.processing_time_ms}ms
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Summary & Metadata */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Main Score Card */}
          <div className="glass-panel rounded-3xl p-8 relative overflow-hidden flex flex-col items-center justify-center text-center">
            <div className={cn("absolute top-0 w-full h-1", 
              aiScore >= 70 ? "bg-detect-ai" : aiScore >= 30 ? "bg-detect-mixed" : "bg-detect-human"
            )} />
            
            <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-8">Probabilitas AI</h2>
            
            <div className="relative mb-6">
              <svg className="w-48 h-48 transform -rotate-90">
                <circle cx="96" cy="96" r="88" className="stroke-surface-200 dark:stroke-surface-800" strokeWidth="12" fill="none" />
                <motion.circle 
                  cx="96" cy="96" r="88" 
                  className={cn("stroke-current drop-shadow-lg", scoreColor)}
                  strokeWidth="12" fill="none"
                  strokeDasharray="553" // 2 * PI * 88
                  initial={{ strokeDashoffset: 553 }}
                  animate={{ strokeDashoffset: 553 - (553 * aiScore) / 100 }}
                  transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={cn("text-5xl font-bold font-editorial tracking-tighter", scoreColor)}>
                  {aiScore}%
                </span>
              </div>
            </div>

            <div className="w-full flex justify-between text-sm font-medium px-4">
              <div className="flex flex-col items-center">
                <span className="text-detect-human font-bold">{humanScore}%</span>
                <span className="text-muted-foreground text-xs uppercase tracking-wider">Manusia</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-detect-ai font-bold">{aiScore}%</span>
                <span className="text-muted-foreground text-xs uppercase tracking-wider">Buatan AI</span>
              </div>
            </div>
          </div>

          {/* Linguistic Analysis */}
          <div className="glass-panel rounded-3xl p-6">
            <h3 className="font-bold font-editorial text-lg mb-4 flex items-center gap-2">
              <FileSearch className="w-5 h-5 text-primary" />
              Analisis Linguistik
            </h3>
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-border/50 pb-3">
                <span className="text-sm text-muted-foreground">Total Kalimat</span>
                <span className="font-mono font-bold">{data.total_sentences}</span>
              </div>
              <div className="flex justify-between items-center border-b border-border/50 pb-3">
                <span className="text-sm text-muted-foreground">Rata-rata Perplexity</span>
                <span className="font-mono font-bold">{data.avg_perplexity ?? 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center border-b border-border/50 pb-3">
                <span className="text-sm text-muted-foreground">Skor Burstiness</span>
                <span className="font-mono font-bold">{data.avg_burstiness ?? 'N/A'}</span>
              </div>
              {data.readability && (
                <div className="flex justify-between items-center pb-1">
                  <span className="text-sm text-muted-foreground">Tingkat Keterbacaan</span>
                  <span className="font-mono font-bold">{data.readability.flesch_reading_ease?.toFixed(1) ?? 'N/A'}</span>
                </div>
              )}
            </div>
          </div>

          {/* Metadata Forensics (if available) */}
          {data.metadata && (
            <div className="glass-panel rounded-3xl p-6">
              <h3 className="font-bold font-editorial text-lg mb-4 flex items-center justify-between">
                Forensik Metadata
                <span className={cn("text-xs px-2 py-1 rounded-full uppercase tracking-wider border", getRiskColor(data.metadata.risk_level))}>
                  Risiko {data.metadata.risk_level}
                </span>
              </h3>
              
              <div className="flex flex-col gap-3 text-sm">
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-muted-foreground">Penulis</span>
                  <span className="col-span-2 font-medium truncate">{data.metadata.author || "Tidak diketahui"}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-muted-foreground">Alat Pembuat</span>
                  <span className="col-span-2 font-medium truncate">{data.metadata.creator_tool || "Tidak diketahui"}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-muted-foreground">Dibuat pada</span>
                  <span className="col-span-2 font-medium truncate">
                    {data.metadata.creation_date ? new Date(data.metadata.creation_date).toLocaleDateString() : "Tidak diketahui"}
                  </span>
                </div>
              </div>

              {/* Anomalies */}
              {data.metadata.anomalies && data.metadata.anomalies.length > 0 && (
                <div className="mt-6 pt-4 border-t border-border/50">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Anomali Terdeteksi</h4>
                  <div className="flex flex-col gap-3">
                    {data.metadata.anomalies.map((anomaly: any, idx: number) => (
                      <div key={idx} className="flex gap-2 text-sm bg-surface-50 dark:bg-surface-900 p-3 rounded-xl border border-border/50">
                        {anomaly.severity === 'high' ? (
                          <AlertTriangle className="w-4 h-4 text-detect-ai shrink-0 mt-0.5" />
                        ) : (
                          <Info className="w-4 h-4 text-detect-mixed shrink-0 mt-0.5" />
                        )}
                        <p className="leading-relaxed text-muted-foreground">
                          <span className="font-bold text-foreground block mb-0.5">{anomaly.type.replace('_', ' ')}</span>
                          {anomaly.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Sentence Highlight Viewer */}
        <div className="lg:col-span-8 flex flex-col h-full">
          <div className="glass-panel rounded-3xl p-6 md:p-8 flex-1 flex flex-col h-full">
            <div className="flex items-center justify-between mb-8 border-b border-border/50 pb-6">
              <h3 className="font-bold font-editorial text-2xl">Analisis Teks</h3>
              
              <div className="flex gap-4 text-sm font-medium">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-detect-ai"></span>
                  Buatan AI
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-detect-human"></span>
                  Tulisan Manusia
                </div>
              </div>
            </div>
            
            <div className="prose prose-lg dark:prose-invert max-w-none font-editorial leading-loose text-balance overflow-y-auto max-h-[800px] pr-4">
              {data.sentences.map((sentence: any, idx: number) => {
                let bgClass = "transparent";
                let textClass = "text-foreground";
                
                if (sentence.label === "ai") {
                  bgClass = "bg-detect-ai/20 dark:bg-detect-ai/30";
                  textClass = "text-detect-ai dark:text-red-300";
                } else if (sentence.label === "paraphrase") {
                  bgClass = "bg-detect-mixed/20 dark:bg-detect-mixed/30";
                  textClass = "text-orange-700 dark:text-orange-300";
                }

                return (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    key={idx}
                    className={cn(
                      "inline-block rounded px-1 -mx-1 transition-colors duration-300",
                      bgClass,
                      sentence.label !== "human" && "font-medium"
                    )}
                    title={`Tingkat Keyakinan: ${(sentence.confidence * 100).toFixed(1)}% | Perplexity: ${sentence.perplexity}`}
                  >
                    {sentence.text}{" "}
                  </motion.span>
                );
              })}
            </div>
          </div>
        </div>
        
      </div>
    </motion.div>
  );
}
