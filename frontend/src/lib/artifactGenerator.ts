/**
 * Client-Side Artifact Generator for AI Document Detector
 * Generates 9 rich studio artifacts (NotebookLM-style) directly in the browser:
 * - Audio Overview (Interactive podcast script & voices)
 * - Slide Deck (Presentation structure)
 * - Video Overview (Visual storyboard & script)
 * - Mind Map (Hierarchical concept tree)
 * - Reports (Executive briefing)
 * - Flashcards (Interactive study cards)
 * - Quiz (Multiple-choice interactive quiz)
 * - Infographic (Visual metrics and quotes)
 * - Data Table (Structured tabular findings)
 */

export interface DialogueItem {
  speaker: string;
  role: string;
  avatar: string;
  text: string;
}

export interface AudioOverviewData {
  type: "audio_overview";
  title: string;
  summary: string;
  duration_estimate: string;
  dialogue: DialogueItem[];
  full_script: string;
}

export interface SlideItem {
  slide_number: number;
  title: string;
  subtitle: string;
  bullets: string[];
  notes: string;
}

export interface SlideDeckData {
  type: "slide_deck";
  title: string;
  total_slides: number;
  slides: SlideItem[];
}

export interface VideoScene {
  scene_number: number;
  timing: string;
  title: string;
  visual_prompt: string;
  on_screen_text: string;
  voiceover: string;
}

export interface VideoOverviewData {
  type: "video_overview";
  title: string;
  estimated_duration: string;
  scenes: VideoScene[];
}

export interface MindMapNode {
  id: string;
  label: string;
  category?: string;
  children?: MindMapNode[];
}

export interface MindMapData {
  type: "mind_map";
  title: string;
  root: MindMapNode;
}

export interface ReportSection {
  heading: string;
  content: string;
}

export interface ReportsData {
  type: "reports";
  title: string;
  executive_summary: string;
  sections: ReportSection[];
  topics: string[];
}

export interface FlashcardItem {
  id: number;
  front: string;
  back: string;
  tag: string;
}

export interface FlashcardsData {
  type: "flashcards";
  title: string;
  total_cards: number;
  cards: FlashcardItem[];
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
}

export interface QuizData {
  type: "quiz";
  title: string;
  total_questions: number;
  questions: QuizQuestion[];
}

export interface InfographicStat {
  label: string;
  value: string;
  description: string;
}

export interface InfographicHighlight {
  title: string;
  content: string;
}

export interface InfographicData {
  type: "infographic";
  title: string;
  stats: InfographicStat[];
  highlights: InfographicHighlight[];
  key_quote: string;
}

export interface DataTableRow {
  no: number;
  aspect: string;
  description: string;
  significance: string;
}

export interface DataTableData {
  type: "data_table";
  title: string;
  columns: string[];
  rows: DataTableRow[];
}

export type StudioArtifact =
  | AudioOverviewData
  | SlideDeckData
  | VideoOverviewData
  | MindMapData
  | ReportsData
  | FlashcardsData
  | QuizData
  | InfographicData
  | DataTableData;

function extractKeySentences(text: string, maxCount: number = 10): string[] {
  const raw = text.split(/(?<=[.!?])\s+/);
  const filtered = raw
    .map((s) => s.trim())
    .filter((s) => s.length > 20 && !s.startsWith("http"));
  if (filtered.length === 0) {
    return [text.slice(0, 200) || "Teks dokumen telah dianalisis."];
  }
  return filtered.slice(0, maxCount);
}

function extractKeywords(text: string): string[] {
  const words = text.match(/\b[A-Za-zÀ-ÿ0-9_-]{4,}\b/g) || [];
  const stopwords = new Set([
    "yang", "untuk", "pada", "dengan", "adalah", "dalam", "dari", "akan",
    "juga", "oleh", "atau", "tentang", "dapat", "bahwa", "ini", "itu",
    "this", "that", "with", "from", "have", "were", "been", "which", "their",
    "these", "those", "about", "would", "there", "could", "other", "after", "then"
  ]);
  const freq: Record<string, number> = {};
  for (const w of words) {
    const lower = w.toLowerCase();
    if (!stopwords.has(lower) && isNaN(Number(lower))) {
      const capitalized = w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
      freq[capitalized] = (freq[capitalized] || 0) + 1;
    }
  }
  const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);
  return sorted.slice(0, 8).map((entry) => entry[0]);
}

export function generateClientArtifact(
  artifactType: string,
  text: string,
  title: string = "Dokumen"
): StudioArtifact {
  const sentences = extractKeySentences(text, 12);
  const keywords = extractKeywords(text);
  const keyTopic = keywords[0] || "Kajian Dokumen";

  switch (artifactType) {
    case "audio_overview": {
      const dialogue: DialogueItem[] = [
        {
          speaker: "Alex",
          role: "Host Utama",
          avatar: "🎙️",
          text: `Halo semuanya! Di sesi Audio Overview kali ini, kita kedatangan materi menarik seputar ${keywords.slice(0, 3).join(", ") || keyTopic}.`,
        },
        {
          speaker: "Taylor",
          role: "Analis Riset",
          avatar: "💡",
          text: `Halo Alex! Yang langsung menarik perhatian saya adalah bagaimana dokumen ini memaparkan hubungan antara konsep-konsep kuncinya.`,
        },
      ];

      const intros = [
        "Salah satu fakta penting yang digarisbawahi adalah:",
        "Menariknya, dokumen ini menyoroti bahwa:",
        "Kalau kita tinjau lebih jauh dari data yang ada:",
        "Dan poin ini berujung pada temuan esensial:",
      ];

      sentences.slice(0, 4).forEach((sent, idx) => {
        dialogue.push({
          speaker: idx % 2 === 0 ? "Alex" : "Taylor",
          role: idx % 2 === 0 ? "Host Utama" : "Analis Riset",
          avatar: idx % 2 === 0 ? "🎙️" : "💡",
          text: `${intros[idx % intros.length]} "${sent}"`,
        });
      });

      dialogue.push({
        speaker: "Alex",
        role: "Host Utama",
        avatar: "🎙️",
        text: `Sebuah kesimpulan yang sangat padat dan membuka perspektif baru. Itulah rangkuman Audio Overview kita hari ini!`,
      });

      const fullScript = dialogue
        .map((d) => `${d.speaker} (${d.role}): ${d.text}`)
        .join("\n\n");

      return {
        type: "audio_overview",
        title: `Audio Overview: ${title}`,
        summary: `Eksplorasi audio dua perspektif mengkaji pilar dan kesimpulan utama dari materi ${keyTopic}.`,
        duration_estimate: `${Math.max(1, Math.round(fullScript.split(" ").length * 0.0075))} min`,
        dialogue,
        full_script: fullScript,
      };
    }

    case "slide_deck": {
      const slides: SlideItem[] = [
        {
          slide_number: 1,
          title: `Tinjauan Materi: ${title}`,
          subtitle: "Presentasi Ringkas & Analisis Dokumen",
          bullets: [
            `Fokus Utama: ${keywords.slice(0, 4).join(", ") || "Analisis Komprehensif"}`,
            "Ekstraksi data faktual dan sintesis temuan utama",
            "Disusun secara otomatis untuk tinjauan cepat",
          ],
          notes: "Gunakan slide ini untuk menyamakan pemahaman awal audiens.",
        },
        {
          slide_number: 2,
          title: "Latar Belakang & Pernyataan Masalah",
          subtitle: "Fondasi Konseptual",
          bullets: [
            sentences[0] || "Konteks pembuka yang mendasari penulisan dokumen.",
            sentences[1] || "Signifikansi isu yang diangkat bagi pembaca.",
          ],
          notes: "Tekankan alasan mengapa topik ini penting dikaji sekarang.",
        },
        {
          slide_number: 3,
          title: "Temuan & Pengamatan Kunci",
          subtitle: "Sintesis Data dan Bukti",
          bullets: [
            sentences[2] || "Observasi signifikan pertama dalam materi.",
            sentences[3] || "Argumen pendukung yang memperkuat analisis.",
            sentences[4] || "Keterkaitan fakta yang teridentifikasi.",
          ],
          notes: "Fokuskan pada hasil observasi yang paling berdampak.",
        },
        {
          slide_number: 4,
          title: "Implikasi & Prospek Praktis",
          subtitle: "Dampak terhadap Implementasi",
          bullets: [
            sentences[5] || "Bagaimana temuan ini memengaruhi ekosistem terkait.",
            `Peluang pengembangan dalam ranah ${keyTopic}.`,
            "Tantangan dan batasan yang perlu diantisipasi.",
          ],
          notes: "Ajak audiens mendiskusikan penerapan praktis.",
        },
        {
          slide_number: 5,
          title: "Konklusi & Rekomendasi",
          subtitle: "Langkah Tindak Lanjut",
          bullets: [
            sentences[sentences.length - 1] || "Kesimpulan terpadu dari seluruh isi materi.",
            "Langkah validasi dan penerapan jangka pendek.",
            "Referensi berharga untuk penelitian atau kerja lanjutan.",
          ],
          notes: "Tutup dengan ajakan bertindak yang jelas.",
        },
      ];

      return {
        type: "slide_deck",
        title: `Slide Deck: ${title}`,
        total_slides: slides.length,
        slides,
      };
    }

    case "video_overview": {
      const scenes: VideoScene[] = [
        {
          scene_number: 1,
          timing: "00:00 - 00:20",
          title: "Intro & Hook Naratif",
          visual_prompt: `Animasi tipografi modern menyorot kata '${keyTopic}' dengan transisi partikel elegan di latar belakang gelap.`,
          on_screen_text: `RINGKASAN CEPAT: ${keyTopic.toUpperCase()}`,
          voiceover: `Mari kita telaah dokumen ini dalam hitungan menit. Apa gagasan terbesar yang sebenarnya disajikan?`,
        },
        {
          scene_number: 2,
          timing: "00:20 - 00:50",
          title: "Premis & Konteks Dasar",
          visual_prompt: "Visual dokumen bergerak perlahan dengan penyorot teks bercahaya pada kutipan kunci.",
          on_screen_text: "KONSEP FUNDAMENTAL",
          voiceover: sentences[0] || "Penulis membuka analisis dengan landasan yang kuat dan terarah.",
        },
        {
          scene_number: 3,
          timing: "00:50 - 01:25",
          title: "Temuan Inti & Eksplorasi",
          visual_prompt: "Grafis diagram dinamis memvisualisasikan hubungan data yang diekstraksi.",
          on_screen_text: "TEMUAN UTAMA",
          voiceover: sentences[1] || "Tinjauan mendalam menunjukkan pola yang konsisten dan menarik.",
        },
        {
          scene_number: 4,
          timing: "01:25 - 01:50",
          title: "Kesimpulan & Takeaway",
          visual_prompt: "Tampilan kartu rangkuman bersih dengan lencana tanda centang bergradasi.",
          on_screen_text: "KESIMPULAN",
          voiceover: sentences[sentences.length - 1] || "Itulah intisari dokumen yang berhasil diekstrak.",
        },
      ];

      return {
        type: "video_overview",
        title: `Video Storyboard: ${title}`,
        estimated_duration: "01:50",
        scenes,
      };
    }

    case "mind_map": {
      const rootNode: MindMapNode = {
        id: "root",
        label: keyTopic,
        category: "root",
        children: [
          {
            id: "branch-1",
            label: "Fondasi & Konteks",
            children: [
              { id: "b1-1", label: keywords[1] || "Premis Teoretis" },
              { id: "b1-2", label: (sentences[0]?.slice(0, 45) || "Pengantar Masalah") + "..." },
            ],
          },
          {
            id: "branch-2",
            label: "Temuan & Analisis",
            children: [
              { id: "b2-1", label: keywords[2] || "Data Kunci" },
              { id: "b2-2", label: (sentences[1]?.slice(0, 45) || "Argumen Empiris") + "..." },
              { id: "b2-3", label: (sentences[2]?.slice(0, 45) || "Dinamika Riset") + "..." },
            ],
          },
          {
            id: "branch-3",
            label: "Dampak & Implikasi",
            children: [
              { id: "b3-1", label: keywords[3] || "Aplikasi Praktis" },
              { id: "b3-2", label: (sentences[sentences.length - 1]?.slice(0, 45) || "Arah Masa Depan") + "..." },
            ],
          },
        ],
      };

      return {
        type: "mind_map",
        title: `Mind Map: ${title}`,
        root: rootNode,
      };
    }

    case "reports": {
      const execSummary = sentences.slice(0, 3).join(" ") || text.slice(0, 300);
      const sections: ReportSection[] = [
        {
          heading: "1. Ringkasan Eksekutif",
          content: execSummary,
        },
        {
          heading: "2. Konstruk Konseptual Dokumen",
          content: `Analisis teks mengidentifikasi keterkaitan erat antara konsep-konsep berikut: ${keywords.join(
            ", "
          )}. Paparan dibangun dengan struktur argumentasi deduktif yang terarah.`,
        },
        {
          heading: "3. Temuan Inti yang Diekstraksi",
          content: sentences.slice(3, 7).map((s) => `• ${s}`).join("\n\n") || "Temuan utama tercakup dalam ringkasan eksekutif.",
        },
        {
          heading: "4. Rekomendasi & Tindak Lanjut",
          content: sentences[sentences.length - 1] || "Disarankan untuk melakukan telaah komparatif tambahan guna memperkaya wawasan.",
        },
      ];

      return {
        type: "reports",
        title: `Laporan Analisis Eksekutif: ${title}`,
        executive_summary: execSummary,
        sections,
        topics: keywords,
      };
    }

    case "flashcards": {
      const cards: FlashcardItem[] = [
        {
          id: 1,
          front: `Apa tema sentral yang dibahas dalam dokumen ini?`,
          back: `Dokumen meneliti topik utama seputar ${keywords.slice(0, 3).join(", ") || keyTopic} dan implikasinya.`,
          tag: "Konsep Inti",
        },
        {
          id: 2,
          front: "Bagaimana premis atau latar belakang yang diuraikan?",
          back: sentences[0] || "Penulis memaparkan latar belakang konseptual yang melandasi kajian.",
          tag: "Latar Belakang",
        },
        {
          id: 3,
          front: "Apa temuan atau bukti utama yang diajukan?",
          back: sentences[1] || sentences[0] || "Temuan didasarkan pada observasi data dan sintesis argumen.",
          tag: "Temuan Data",
        },
        {
          id: 4,
          front: "Bagaimana korelasi analisis dalam dokumen?",
          back: sentences[2] || sentences[0] || "Teks memperlihatkan keterhubungan antara variabel kajian.",
          tag: "Analisis",
        },
        {
          id: 5,
          front: "Apa kesimpulan pokok dokumen?",
          back: sentences[sentences.length - 1] || "Kesimpulan merangkum intisari dan rekomendasi tindak lanjut.",
          tag: "Kesimpulan",
        },
      ];

      return {
        type: "flashcards",
        title: `Flashcards: ${title}`,
        total_cards: cards.length,
        cards,
      };
    }

    case "quiz": {
      const questions: QuizQuestion[] = [
        {
          id: 1,
          question: `Apa fokus utama dokumen '${title}'?`,
          options: [
            `Kajian terstruktur mengenai ${keyTopic} dan topik terkait`,
            "Tinjauan umum arsitektur bangunan kuno",
            "Petunjuk instalasi perangkat keras periferal",
            "Kompilasi resep masakan tradisional",
          ],
          correct_index: 0,
          explanation: `Berdasarkan ekstraksi semantik dokumen, ${keyTopic} merupakan poros utama pembahasan.`,
        },
        {
          id: 2,
          question: "Manakah pernyataan yang sesuai dengan isi dokumen?",
          options: [
            sentences[0]?.slice(0, 130) || "Dokumen memuat data dan observasi faktual.",
            "Dokumen membuktikan bahwa seluruh hipotesis sebelumnya salah tanpa uji empiris.",
            "Penulis merekomendasikan pembatalan seluruh proyek penelitian.",
            "Tidak ditemukan informasi apapun dalam materi yang diunggah.",
          ],
          correct_index: 0,
          explanation: "Opsi pertama merupakan kutipan faktual yang diekstraksi langsung dari dokumen.",
        },
        {
          id: 3,
          question: "Apa aspek yang ditegaskan dalam pembahasan analisis?",
          options: [
            "Data yang disajikan tidak memiliki relevansi.",
            sentences[1]?.slice(0, 130) || "Observasi analitis memperkuat temuan utama.",
            "Semua argumen harus diabaikan demi efisiensi.",
            "Penelitian tidak dapat dilanjutkan.",
          ],
          correct_index: 1,
          explanation: "Observasi ini mencerminkan analisis mendalam yang terkandung di dalam teks.",
        },
      ];

      return {
        type: "quiz",
        title: `Kuis Pemahaman: ${title}`,
        total_questions: questions.length,
        questions,
      };
    }

    case "infographic": {
      const words = text.split(/\s+/).filter(Boolean);
      const stats: InfographicStat[] = [
        {
          label: "Volume Dokumen",
          value: `${words.length.toLocaleString()} Kata`,
          description: "Cakupan teks yang berhasil diproses",
        },
        {
          label: "Klaster Topik",
          value: `${keywords.length} Konsep`,
          description: `Fokus: ${keywords.slice(0, 3).join(", ") || "Inti Riset"}`,
        },
        {
          label: "Poin Esensial",
          value: `${sentences.length} Temuan`,
          description: "Argumen terstruktur berkepadatan tinggi",
        },
      ];

      const highlights: InfographicHighlight[] = [
        {
          title: "Premis Awal",
          content: sentences[0] || "Landasan konseptual yang kokoh dalam dokumen.",
        },
        {
          title: "Bukti Nyata",
          content: sentences[1] || "Argumentasi analitis yang memperkuat hipotesis.",
        },
        {
          title: "Konklusi Strategis",
          content: sentences[sentences.length - 1] || "Intisari konklusif untuk arahan implementasi.",
        },
      ];

      return {
        type: "infographic",
        title: `Infografis Ringkas: ${title}`,
        stats,
        highlights,
        key_quote: sentences[0] || text.slice(0, 160),
      };
    }

    case "data_table": {
      const columns = ["No", "Dimensi / Topik", "Temuan Terobservasi", "Tingkat Prioritas"];
      const prioritasList = ["Tinggi", "Sangat Tinggi", "Kritikal", "Sedang", "Tinggi"];
      const rows: DataTableRow[] = sentences.slice(0, 5).map((s, idx) => ({
        no: idx + 1,
        aspect: keywords[idx] || `Aspek #${idx + 1}`,
        description: s,
        significance: prioritasList[idx % prioritasList.length],
      }));

      return {
        type: "data_table",
        title: `Tabel Data & Matriks Analisis: ${title}`,
        columns,
        rows,
      };
    }

    default:
      throw new Error(`Tipe artefak '${artifactType}' tidak dikenal.`);
  }
}
