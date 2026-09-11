"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Volume2,
  Presentation,
  Video,
  GitFork,
  FileText,
  Layers,
  HelpCircle,
  BarChart3,
  Table,
  Play,
  Pause,
  RotateCcw,
  Copy,
  Check,
  Download,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Loader2,
  ExternalLink,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  StudioArtifact,
  AudioOverviewData,
  SlideDeckData,
  VideoOverviewData,
  MindMapData,
  ReportsData,
  FlashcardsData,
  QuizData,
  InfographicData,
  DataTableData,
} from "@/lib/artifactGenerator";

interface ArtifactModalProps {
  isOpen: boolean;
  onClose: () => void;
  artifact: StudioArtifact | null;
  documentTitle?: string;
  isGenerating?: boolean;
  generatingTitle?: string;
}

export default function ArtifactModal({
  isOpen,
  onClose,
  artifact,
  documentTitle = "Dokumen",
  isGenerating = false,
  generatingTitle = "Artefak",
}: ArtifactModalProps) {
  const [copied, setCopied] = useState(false);

  // Audio player state
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [activeDialogueIndex, setActiveDialogueIndex] = useState(0);

  // Slide deck state
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Flashcards state
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownCards, setKnownCards] = useState<number[]>([]);

  // Quiz state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Data table search
  const [tableSearch, setTableSearch] = useState("");

  // Stop speech when closing or changing
  useEffect(() => {
    if (!isOpen && typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
    }
  }, [isOpen]);

  // Audio playback using Web Speech API
  const speakDialogue = (dialogueIndex: number, audioData: AudioOverviewData) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    if (dialogueIndex >= audioData.dialogue.length) {
      setIsPlayingAudio(false);
      setActiveDialogueIndex(0);
      return;
    }

    window.speechSynthesis.cancel();
    const item = audioData.dialogue[dialogueIndex];
    const utterance = new SpeechSynthesisUtterance(item.text);

    // Give distinct voice tones to Alex and Taylor
    if (item.speaker === "Alex") {
      utterance.pitch = 1.0;
      utterance.rate = 1.05;
    } else {
      utterance.pitch = 1.25;
      utterance.rate = 1.08;
    }

    utterance.onend = () => {
      if (isPlayingAudio) {
        setActiveDialogueIndex(dialogueIndex + 1);
        speakDialogue(dialogueIndex + 1, audioData);
      }
    };

    utterance.onerror = () => {
      setIsPlayingAudio(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const togglePlayAudio = (audioData: AudioOverviewData) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert("Sintesis suara tidak didukung pada browser Anda.");
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
      speakDialogue(activeDialogueIndex, audioData);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCSV = (tableData: DataTableData) => {
    const headers = tableData.columns.join(",");
    const rows = tableData.rows
      .map((r) => `${r.no},"${r.aspect}","${r.description.replace(/"/g, '""')}","${r.significance}"`)
      .join("\n");
    const blob = new Blob([`${headers}\n${rows}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `tabel-analisis-${documentTitle.replace(/\s+/g, "-")}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-4xl bg-[#16181d] border border-white/15 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#1b1e24]">
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-xl bg-primary/20 text-primary">
                <Sparkles className="w-5 h-5" />
              </span>
              <div>
                <h3 className="font-bold text-base sm:text-lg text-white font-editorial">
                  {isGenerating ? `Menghasilkan ${generatingTitle}...` : artifact?.title || "Studio Dokumen"}
                </h3>
                <p className="text-xs text-white/50 truncate max-w-sm">
                  Sumber: {documentTitle}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {artifact && (
                <button
                  onClick={() =>
                    handleCopy(
                      "full_script" in artifact
                        ? artifact.full_script
                        : "executive_summary" in artifact
                        ? `${artifact.title}\n\n${artifact.executive_summary}`
                        : JSON.stringify(artifact, null, 2)
                    )
                  }
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white/5 hover:bg-white/10 text-white/80 transition-colors border border-white/10"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Tersalin</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Salin Konten</span>
                    </>
                  )}
                </button>
              )}

              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Modal Content */}
          <div className="flex-1 overflow-y-auto p-6 text-white/90">
            {isGenerating ? (
              <div className="py-24 flex flex-col items-center justify-center text-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                  <Sparkles className="w-6 h-6 text-primary absolute inset-0 m-auto" />
                </div>
                <div>
                  <h4 className="font-bold text-lg font-editorial text-white">
                    Memproses & Menyusun {generatingTitle}...
                  </h4>
                  <p className="text-sm text-white/50 mt-1 max-w-md">
                    Menganalisis konsep utama, mengekstraksi data faktual, dan memformat artefak studio.
                  </p>
                </div>
              </div>
            ) : artifact ? (
              <div>
                {/* 1. AUDIO OVERVIEW */}
                {artifact.type === "audio_overview" && (
                  <div className="flex flex-col gap-6">
                    {/* Audio Player Bar */}
                    <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-950/60 to-purple-950/60 border border-indigo-500/20 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => togglePlayAudio(artifact)}
                          className="w-14 h-14 rounded-full bg-indigo-500 hover:bg-indigo-400 text-white flex items-center justify-center shadow-lg transition-all transform active:scale-95"
                        >
                          {isPlayingAudio ? (
                            <Pause className="w-6 h-6" />
                          ) : (
                            <Play className="w-6 h-6 ml-0.5" />
                          )}
                        </button>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-base text-white">
                              {isPlayingAudio ? "Sedang Memutar Suara..." : "Putar Podcast Audio"}
                            </h4>
                            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                              Web Speech API
                            </span>
                          </div>
                          <p className="text-xs text-white/60 mt-0.5">
                            Estimasi durasi: {artifact.duration_estimate} • Dialog dua host (Alex & Taylor)
                          </p>
                        </div>
                      </div>

                      {isPlayingAudio && (
                        <div className="flex items-center gap-1">
                          {[40, 70, 30, 90, 60, 80, 50, 95, 45, 65].map((h, i) => (
                            <motion.div
                              key={i}
                              animate={{ height: [12, h * 0.35, 12] }}
                              transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.08 }}
                              className="w-1 bg-indigo-400 rounded-full"
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Dialogue Script */}
                    <div className="flex flex-col gap-3.5">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-white/50 px-1">
                        Transkrip Percakapan Podcast
                      </h4>
                      {artifact.dialogue.map((line, idx) => (
                        <motion.div
                          key={idx}
                          animate={{
                            opacity: activeDialogueIndex === idx && isPlayingAudio ? 1 : 0.85,
                            scale: activeDialogueIndex === idx && isPlayingAudio ? 1.01 : 1,
                          }}
                          className={cn(
                            "p-4 rounded-2xl border transition-all duration-300",
                            line.speaker === "Alex"
                              ? "bg-surface-900/60 border-indigo-500/20 hover:border-indigo-500/40"
                              : "bg-surface-900/40 border-purple-500/20 hover:border-purple-500/40",
                            activeDialogueIndex === idx && isPlayingAudio && "ring-1 ring-indigo-400 bg-indigo-950/40"
                          )}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{line.avatar}</span>
                              <span className="font-bold text-sm text-white">{line.speaker}</span>
                              <span className="text-xs text-white/40">({line.role})</span>
                            </div>
                            <span className="text-[11px] font-mono text-white/30">#{idx + 1}</span>
                          </div>
                          <p className="text-sm sm:text-base leading-relaxed text-white/85 font-editorial pl-7">
                            {line.text}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. SLIDE DECK */}
                {artifact.type === "slide_deck" && (
                  <div className="flex flex-col gap-6">
                    {/* Slide 16:9 Canvas */}
                    <div className="relative aspect-[16/9] w-full rounded-2xl bg-gradient-to-br from-[#1d2027] to-[#121418] border border-amber-500/30 p-6 sm:p-10 flex flex-col justify-between shadow-2xl overflow-hidden">
                      <div className="absolute top-0 right-0 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

                      {/* Slide Header */}
                      <div className="flex items-center justify-between border-b border-white/10 pb-4">
                        <div>
                          <span className="text-xs font-mono uppercase tracking-widest text-amber-400">
                            Slide {artifact.slides[currentSlideIndex].slide_number} dari {artifact.total_slides}
                          </span>
                          <h3 className="text-xl sm:text-3xl font-bold font-editorial text-white mt-1">
                            {artifact.slides[currentSlideIndex].title}
                          </h3>
                          <p className="text-xs sm:text-sm text-white/60">
                            {artifact.slides[currentSlideIndex].subtitle}
                          </p>
                        </div>
                        <Presentation className="w-8 h-8 text-amber-400/40 hidden sm:block" />
                      </div>

                      {/* Bullets */}
                      <div className="flex flex-col gap-3 my-auto py-4">
                        {artifact.slides[currentSlideIndex].bullets.map((bullet, i) => (
                          <div key={i} className="flex items-start gap-3">
                            <span className="w-2 h-2 rounded-full bg-amber-400 mt-2 shrink-0" />
                            <p className="text-sm sm:text-lg text-white/90 leading-relaxed font-editorial">
                              {bullet}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Slide Footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-white/10 text-xs text-white/40">
                        <span>{documentTitle}</span>
                        <span>AI Document Detector Studio</span>
                      </div>
                    </div>

                    {/* Navigation Bar */}
                    <div className="flex items-center justify-between p-4 rounded-xl bg-surface-900/60 border border-white/10">
                      <button
                        onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))}
                        disabled={currentSlideIndex === 0}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Sebelumnya
                      </button>

                      <div className="flex items-center gap-2">
                        {artifact.slides.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setCurrentSlideIndex(i)}
                            className={cn(
                              "w-3 h-3 rounded-full transition-all",
                              currentSlideIndex === i ? "w-8 bg-amber-400" : "bg-white/20 hover:bg-white/40"
                            )}
                          />
                        ))}
                      </div>

                      <button
                        onClick={() => setCurrentSlideIndex(Math.min(artifact.slides.length - 1, currentSlideIndex + 1))}
                        disabled={currentSlideIndex === artifact.slides.length - 1}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        Selanjutnya
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Speaker Notes */}
                    <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/20 text-sm text-white/70">
                      <span className="font-bold text-amber-400 block mb-1">Catatan Presenter:</span>
                      {artifact.slides[currentSlideIndex].notes}
                    </div>
                  </div>
                )}

                {/* 3. VIDEO OVERVIEW */}
                {artifact.type === "video_overview" && (
                  <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/20">
                      <div className="flex items-center gap-2">
                        <Video className="w-5 h-5 text-emerald-400" />
                        <span className="font-bold text-white text-sm">Storyboard Video Explainer</span>
                      </div>
                      <span className="text-xs font-mono text-emerald-300">
                        Durasi Total: {artifact.estimated_duration}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {artifact.scenes.map((scene) => (
                        <div
                          key={scene.scene_number}
                          className="p-5 rounded-2xl bg-surface-900/60 border border-white/10 flex flex-col justify-between gap-4"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                                Scene {scene.scene_number} ({scene.timing})
                              </span>
                              <span className="text-xs text-white/40 font-mono">
                                {scene.on_screen_text}
                              </span>
                            </div>
                            <h4 className="font-bold text-base text-white mb-2">{scene.title}</h4>
                            <div className="p-3 rounded-xl bg-black/40 border border-white/5 mb-3 text-xs text-white/70 leading-relaxed">
                              <span className="text-emerald-400 font-bold block mb-0.5">Arahan Visual:</span>
                              {scene.visual_prompt}
                            </div>
                          </div>
                          <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-xs sm:text-sm text-white/90">
                            <span className="text-emerald-400 font-bold block mb-0.5">Sulih Suara (Voiceover):</span>
                            "{scene.voiceover}"
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. MIND MAP */}
                {artifact.type === "mind_map" && (
                  <div className="flex flex-col gap-6">
                    <div className="p-6 rounded-2xl bg-[#1a1d24] border border-pink-500/20 flex flex-col gap-6 overflow-x-auto">
                      {/* Root Node */}
                      <div className="flex flex-col items-center">
                        <div className="px-6 py-3 rounded-2xl bg-pink-500 text-white font-bold text-lg shadow-lg border border-pink-400/50">
                          {artifact.root.label}
                        </div>
                        <div className="w-0.5 h-6 bg-pink-500/50" />
                      </div>

                      {/* Level 1 Branches */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {artifact.root.children?.map((branch) => (
                          <div
                            key={branch.id}
                            className="p-4 rounded-2xl bg-surface-900/80 border border-pink-500/30 flex flex-col gap-3 shadow-md"
                          >
                            <h4 className="font-bold text-pink-300 text-sm sm:text-base border-b border-white/10 pb-2">
                              {branch.label}
                            </h4>
                            <div className="flex flex-col gap-2">
                              {branch.children?.map((leaf) => (
                                <div
                                  key={leaf.id}
                                  className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-xs text-white/80"
                                >
                                  {leaf.label}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. REPORTS */}
                {artifact.type === "reports" && (
                  <div className="flex flex-col gap-6 max-w-3xl mx-auto bg-surface-900/40 p-6 sm:p-8 rounded-2xl border border-white/10">
                    <div className="border-b border-white/10 pb-4 mb-2">
                      <span className="text-xs font-mono uppercase tracking-widest text-yellow-400">
                        Executive Briefing
                      </span>
                      <h3 className="text-2xl font-bold font-editorial text-white mt-1">
                        {artifact.title}
                      </h3>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {artifact.topics.map((t, idx) => (
                          <span
                            key={idx}
                            className="text-xs px-2.5 py-0.5 rounded-full bg-white/5 text-white/70 border border-white/10"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-6 text-white/85 font-editorial leading-relaxed">
                      {artifact.sections.map((section, idx) => (
                        <div key={idx} className="flex flex-col gap-2">
                          <h4 className="font-bold text-lg text-yellow-400/90">{section.heading}</h4>
                          <p className="text-sm sm:text-base whitespace-pre-line text-white/80 leading-relaxed">
                            {section.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 6. FLASHCARDS */}
                {artifact.type === "flashcards" && (
                  <div className="flex flex-col items-center gap-6">
                    <div className="text-xs font-mono text-white/50">
                      Kartu {currentCardIndex + 1} dari {artifact.total_cards} •{" "}
                      {knownCards.length} Dikuasai
                    </div>

                    {/* 3D Flip Card */}
                    <div
                      onClick={() => setIsFlipped(!isFlipped)}
                      className="w-full max-w-lg aspect-[4/3] sm:aspect-[16/10] cursor-pointer perspective-1000"
                    >
                      <motion.div
                        animate={{ rotateY: isFlipped ? 180 : 0 }}
                        transition={{ duration: 0.5 }}
                        className="relative w-full h-full rounded-3xl p-8 bg-gradient-to-br from-[#232026] to-[#17151a] border border-orange-500/30 shadow-2xl flex flex-col justify-between select-none"
                        style={{ transformStyle: "preserve-3d" }}
                      >
                        {!isFlipped ? (
                          <div className="flex flex-col justify-between h-full">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">
                                {artifact.cards[currentCardIndex].tag}
                              </span>
                              <span className="text-xs text-white/40">Pertanyaan</span>
                            </div>
                            <h3 className="text-xl sm:text-2xl font-bold font-editorial text-white text-center px-4">
                              {artifact.cards[currentCardIndex].front}
                            </h3>
                            <div className="text-xs text-center text-white/40">
                              (Klik kartu untuk membalik dan melihat jawaban)
                            </div>
                          </div>
                        ) : (
                          <div
                            className="flex flex-col justify-between h-full"
                            style={{ transform: "rotateY(180deg)" }}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                Jawaban
                              </span>
                              <span className="text-xs text-white/40">Jawaban Dokumen</span>
                            </div>
                            <p className="text-base sm:text-lg font-editorial text-white/95 text-center px-4 leading-relaxed">
                              {artifact.cards[currentCardIndex].back}
                            </p>
                            <div className="text-xs text-center text-white/40">
                              (Klik kartu untuk kembali)
                            </div>
                          </div>
                        )}
                      </motion.div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => {
                          setIsFlipped(false);
                          setCurrentCardIndex(Math.max(0, currentCardIndex - 1));
                        }}
                        disabled={currentCardIndex === 0}
                        className="px-4 py-2 rounded-xl text-sm font-medium bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        Sebelumnya
                      </button>

                      <button
                        onClick={() => {
                          if (!knownCards.includes(artifact.cards[currentCardIndex].id)) {
                            setKnownCards([...knownCards, artifact.cards[currentCardIndex].id]);
                          }
                          setIsFlipped(false);
                          if (currentCardIndex < artifact.cards.length - 1) {
                            setCurrentCardIndex(currentCardIndex + 1);
                          }
                        }}
                        className="px-5 py-2 rounded-xl text-sm font-bold bg-orange-500 hover:bg-orange-400 text-white transition-colors"
                      >
                        Sudah Paham ✓
                      </button>

                      <button
                        onClick={() => {
                          setIsFlipped(false);
                          setCurrentCardIndex(Math.min(artifact.cards.length - 1, currentCardIndex + 1));
                        }}
                        disabled={currentCardIndex === artifact.cards.length - 1}
                        className="px-4 py-2 rounded-xl text-sm font-medium bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        Selanjutnya
                      </button>
                    </div>
                  </div>
                )}

                {/* 7. QUIZ */}
                {artifact.type === "quiz" && (
                  <div className="flex flex-col gap-6 max-w-2xl mx-auto">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-sky-950/30 border border-sky-500/20">
                      <div>
                        <span className="font-bold text-white text-sm">Evaluasi Mandiri Dokumen</span>
                        <p className="text-xs text-white/50">Jawab pertanyaan berikut berdasarkan teks yang dianalisis.</p>
                      </div>
                      <span className="text-xs font-mono text-sky-300">
                        {Object.keys(selectedAnswers).length} / {artifact.total_questions} Terjawab
                      </span>
                    </div>

                    <div className="flex flex-col gap-6">
                      {artifact.questions.map((q, qIndex) => {
                        const isAnswered = selectedAnswers[q.id] !== undefined;
                        const chosen = selectedAnswers[q.id];

                        return (
                          <div
                            key={q.id}
                            className="p-5 rounded-2xl bg-surface-900/60 border border-white/10 flex flex-col gap-4"
                          >
                            <h4 className="font-bold text-base text-white">
                              {qIndex + 1}. {q.question}
                            </h4>

                            <div className="flex flex-col gap-2.5">
                              {q.options.map((opt, optIndex) => {
                                const isSelected = chosen === optIndex;
                                const isCorrect = optIndex === q.correct_index;

                                let btnStyle = "bg-white/5 border-white/10 hover:bg-white/10 text-white/80";
                                if (isAnswered) {
                                  if (isCorrect) {
                                    btnStyle = "bg-emerald-500/20 border-emerald-500/60 text-emerald-300 font-semibold";
                                  } else if (isSelected) {
                                    btnStyle = "bg-rose-500/20 border-rose-500/60 text-rose-300 line-through";
                                  } else {
                                    btnStyle = "opacity-40 border-white/5";
                                  }
                                }

                                return (
                                  <button
                                    key={optIndex}
                                    onClick={() => {
                                      if (!isAnswered) {
                                        setSelectedAnswers({ ...selectedAnswers, [q.id]: optIndex });
                                      }
                                    }}
                                    disabled={isAnswered}
                                    className={cn(
                                      "text-left p-3.5 rounded-xl border text-sm transition-all duration-200",
                                      btnStyle
                                    )}
                                  >
                                    <span className="font-mono text-xs mr-2 text-white/40">
                                      {String.fromCharCode(65 + optIndex)}.
                                    </span>
                                    {opt}
                                  </button>
                                );
                              })}
                            </div>

                            {isAnswered && (
                              <div className="p-3 rounded-xl bg-black/40 border border-white/10 text-xs text-white/70">
                                <span className="font-bold text-sky-400 block mb-0.5">Penjelasan:</span>
                                {q.explanation}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 8. INFOGRAPHIC */}
                {artifact.type === "infographic" && (
                  <div className="flex flex-col gap-6">
                    {/* Stats Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {artifact.stats.map((stat, i) => (
                        <div
                          key={i}
                          className="p-5 rounded-2xl bg-gradient-to-br from-purple-950/40 to-surface-900 border border-purple-500/30 flex flex-col gap-1 shadow-lg"
                        >
                          <span className="text-xs font-mono uppercase text-purple-300">{stat.label}</span>
                          <span className="text-3xl font-bold font-editorial text-white">{stat.value}</span>
                          <p className="text-xs text-white/50 mt-1">{stat.description}</p>
                        </div>
                      ))}
                    </div>

                    {/* Highlights */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {artifact.highlights.map((h, i) => (
                        <div
                          key={i}
                          className="p-5 rounded-2xl bg-surface-900/60 border border-white/10 flex flex-col gap-2"
                        >
                          <h4 className="font-bold text-sm text-purple-300 uppercase tracking-wider">{h.title}</h4>
                          <p className="text-sm font-editorial text-white/80 leading-relaxed">{h.content}</p>
                        </div>
                      ))}
                    </div>

                    {/* Key Quote Banner */}
                    <div className="p-6 rounded-2xl bg-purple-950/20 border border-purple-500/20 text-center">
                      <span className="text-3xl text-purple-400">“</span>
                      <p className="text-base sm:text-xl italic font-editorial text-white/90 max-w-2xl mx-auto -mt-3">
                        {artifact.key_quote}
                      </p>
                    </div>
                  </div>
                )}

                {/* 9. DATA TABLE */}
                {artifact.type === "data_table" && (
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="relative flex-1 max-w-xs">
                        <Search className="w-4 h-4 text-white/40 absolute left-3 top-3" />
                        <input
                          type="text"
                          value={tableSearch}
                          onChange={(e) => setTableSearch(e.target.value)}
                          placeholder="Cari aspek atau temuan..."
                          className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-500/50"
                        />
                      </div>

                      <button
                        onClick={() => handleDownloadCSV(artifact)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 transition-colors w-fit"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Ekspor CSV
                      </button>
                    </div>

                    <div className="overflow-x-auto rounded-2xl border border-white/10 bg-surface-900/60">
                      <table className="w-full text-left text-sm">
                        <thead className="border-b border-white/10 bg-white/5 text-xs font-mono uppercase text-white/60">
                          <tr>
                            {artifact.columns.map((col, idx) => (
                              <th key={idx} className="p-3.5">
                                {col}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {artifact.rows
                            .filter(
                              (r) =>
                                !tableSearch ||
                                r.aspect.toLowerCase().includes(tableSearch.toLowerCase()) ||
                                r.description.toLowerCase().includes(tableSearch.toLowerCase())
                            )
                            .map((row) => (
                              <tr key={row.no} className="hover:bg-white/5 transition-colors">
                                <td className="p-3.5 font-mono text-xs text-white/40">{row.no}</td>
                                <td className="p-3.5 font-bold text-white whitespace-nowrap">{row.aspect}</td>
                                <td className="p-3.5 text-white/80 font-editorial leading-relaxed max-w-md">
                                  {row.description}
                                </td>
                                <td className="p-3.5">
                                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 whitespace-nowrap">
                                    {row.significance}
                                  </span>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
