"use client";

import { motion } from "framer-motion";
import {
  Volume2,
  Presentation,
  Video,
  GitFork,
  FileText,
  Layers,
  HelpCircle,
  BarChart3,
  Table,
  ChevronRight,
  Sparkles,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface StudioOption {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  bgColor: string;
  borderColor: string;
  badgeText?: string;
}

export const STUDIO_OPTIONS: StudioOption[] = [
  {
    id: "audio_overview",
    title: "Audio Overview",
    description: "Percakapan podcast 2 host yang membedah tema dokumen",
    icon: Volume2,
    color: "text-indigo-400",
    bgColor: "bg-[#252338]",
    borderColor: "hover:border-indigo-500/40",
    badgeText: "Podcast",
  },
  {
    id: "slide_deck",
    title: "Slide Deck",
    description: "Dek presentasi terstruktur 16:9 dengan poin kunci",
    icon: Presentation,
    color: "text-amber-400",
    bgColor: "bg-[#2c2b22]",
    borderColor: "hover:border-amber-500/40",
    badgeText: "Presentasi",
  },
  {
    id: "video_overview",
    title: "Video Overview",
    description: "Storyboard video lengkap visual prompt & narasi voiceover",
    icon: Video,
    color: "text-emerald-400",
    bgColor: "bg-[#1f2c25]",
    borderColor: "hover:border-emerald-500/40",
    badgeText: "Storyboard",
  },
  {
    id: "mind_map",
    title: "Mind Map",
    description: "Peta konsep hierarkis visual topik dan percabangan",
    icon: GitFork,
    color: "text-pink-400",
    bgColor: "bg-[#2d222b]",
    borderColor: "hover:border-pink-500/40",
    badgeText: "Konseptual",
  },
  {
    id: "reports",
    title: "Reports",
    description: "Laporan ringkasan eksekutif komprehensif siap cetak",
    icon: FileText,
    color: "text-yellow-300",
    bgColor: "bg-[#292922]",
    borderColor: "hover:border-yellow-500/40",
    badgeText: "Eksekutif",
  },
  {
    id: "flashcards",
    title: "Flashcards",
    description: "Kartu belajar bolak-balik 3D untuk penguasaan materi",
    icon: Layers,
    color: "text-orange-400",
    bgColor: "bg-[#2f2520]",
    borderColor: "hover:border-orange-500/40",
    badgeText: "Belajar",
  },
  {
    id: "quiz",
    title: "Quiz",
    description: "Kuis pilihan ganda interaktif dengan penjelasan jawaban",
    icon: HelpCircle,
    color: "text-sky-400",
    bgColor: "bg-[#1f2733]",
    borderColor: "hover:border-sky-500/40",
    badgeText: "Uji Mandiri",
  },
  {
    id: "infographic",
    title: "Infographic",
    description: "Kartu statistik visual, persentase metrik, dan sorotan fakta",
    icon: BarChart3,
    color: "text-purple-400",
    bgColor: "bg-[#2a2233]",
    borderColor: "hover:border-purple-500/40",
    badgeText: "Visual Data",
  },
  {
    id: "data_table",
    title: "Data Table",
    description: "Matriks perbandingan data terstruktur dan ekspor CSV",
    icon: Table,
    color: "text-cyan-400",
    bgColor: "bg-[#1d272d]",
    borderColor: "hover:border-cyan-500/40",
    badgeText: "Matriks",
  },
];

interface StudioGridProps {
  onSelect: (optionId: string) => void;
  activeGeneratingId: string | null;
  documentTitle?: string;
}

export default function StudioGrid({
  onSelect,
  activeGeneratingId,
  documentTitle,
}: StudioGridProps) {
  return (
    <div className="w-full flex flex-col gap-6">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/40">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <Sparkles className="w-4 h-4" />
            </span>
            <h2 className="text-xl font-bold font-editorial text-foreground">
              Studio Generator Dokumen
            </h2>
            <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              9 Mode
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Hasilkan ringkasan dan artefak berbasis konten dokumen{" "}
            {documentTitle ? (
              <span className="font-semibold text-foreground italic">
                "{documentTitle}"
              </span>
            ) : (
              "yang diunggah"
            )}
            .
          </p>
        </div>
      </div>

      {/* Grid matching user screenshot */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-3.5">
        {STUDIO_OPTIONS.map((opt, idx) => {
          const Icon = opt.icon;
          const isGenerating = activeGeneratingId === opt.id;

          return (
            <motion.button
              key={opt.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04, duration: 0.3 }}
              onClick={() => onSelect(opt.id)}
              disabled={Boolean(activeGeneratingId)}
              className={cn(
                "group relative text-left p-4 rounded-2xl transition-all duration-300",
                "bg-[#1c1f26]/90 dark:bg-[#181a20]/95 hover:bg-[#232731]",
                "border border-white/5 hover:border-white/20 shadow-md hover:shadow-xl",
                "flex items-center justify-between gap-4",
                isGenerating && "ring-2 ring-primary bg-primary/10",
                Boolean(activeGeneratingId) && !isGenerating && "opacity-60 cursor-not-allowed"
              )}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div
                  className={cn(
                    "w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105",
                    opt.bgColor,
                    opt.color
                  )}
                >
                  {isGenerating ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-[15px] text-white/95 group-hover:text-white truncate">
                      {opt.title}
                    </span>
                    {opt.badgeText && (
                      <span className="hidden sm:inline-block text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-white/50 border border-white/10">
                        {opt.badgeText}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-white/50 truncate max-w-[280px] sm:max-w-[340px] mt-0.5">
                    {opt.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center text-white/30 group-hover:text-white/80 group-hover:translate-x-1 transition-all shrink-0">
                <ChevronRight className="w-5 h-5" />
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
