/**
 * Client-side AI Detection Engine & Fallback
 * Implements the exact same statistical NLP heuristics as the Python backend:
 * - Per-sentence classification
 * - Pseudo-Perplexity (word length variance, bigrams, punctuation, TTR)
 * - Burstiness (sentence length variation)
 * - Repetitive pattern detection
 */

export interface SentenceResult {
  text: string;
  label: "ai" | "human" | "paraphrase";
  confidence: number;
  perplexity: number;
  burstiness: number | null;
}

export interface AnalysisResponse {
  id?: string | null;
  filename?: string | null;
  file_type?: string | null;
  ai_score: number;
  human_score: number;
  confidence: number;
  total_sentences: number;
  ai_sentences: number;
  human_sentences: number;
  paraphrased_sentences: number;
  avg_perplexity: number;
  avg_burstiness: number;
  repetition_score: number;
  readability?: Record<string, number>;
  sentences: SentenceResult[];
  processing_time_ms?: number;
}

const PERPLEXITY_AI_THRESHOLD = 30.0;
const PERPLEXITY_HUMAN_THRESHOLD = 55.0;
const TTR_AI_THRESHOLD = 0.45;
const TTR_HUMAN_THRESHOLD = 0.70;

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 5);
}

function tokenizeWords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 0);
}

function typeTokenRatio(words: string[]): number {
  if (words.length === 0) return 0;
  const unique = new Set(words);
  return unique.size / words.length;
}

function calculatePerplexity(sentence: string): number {
  const words = tokenizeWords(sentence);
  if (words.length < 2) return 50.0;

  const ttr = typeTokenRatio(words);
  const wordLengths = words.map((w) => w.length);
  const avgLen = wordLengths.reduce((a, b) => a + b, 0) / wordLengths.length;
  const variance =
    wordLengths.reduce((acc, len) => acc + Math.pow(len - avgLen, 2), 0) /
    wordLengths.length;
  const lenStd = Math.sqrt(variance);

  // Bigram uniqueness
  const bigrams: string[] = [];
  for (let i = 0; i < words.length - 1; i++) {
    bigrams.push(`${words[i]} ${words[i + 1]}`);
  }
  const uniqueBigrams = new Set(bigrams).size;
  const bigramRatio = bigrams.length > 0 ? uniqueBigrams / bigrams.length : 1.0;

  // Punctuation density
  const punctMatches = sentence.match(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g);
  const punctCount = punctMatches ? punctMatches.length : 0;
  const punctDensity = sentence.length > 0 ? punctCount / sentence.length : 0;

  const perplexity =
    ttr * 30 +
    Math.min(lenStd, 3) * 10 +
    bigramRatio * 25 +
    Math.min(punctDensity * 100, 10) * 1.5 +
    Math.min(words.length, 30) * 0.3;

  return Math.round(Math.max(0, Math.min(perplexity, 100)) * 100) / 100;
}

function calculateBurstiness(sentences: string[]): number {
  if (sentences.length < 2) return 0.0;
  const lengths = sentences.map((s) => tokenizeWords(s).length);
  const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length;
  if (mean === 0) return 0.0;

  const variance =
    lengths.reduce((acc, l) => acc + Math.pow(l - mean, 2), 0) / lengths.length;
  const std = Math.sqrt(variance);
  const cv = (std / mean) * 100;
  return Math.round(Math.min(cv, 100) * 100) / 100;
}

function detectRepetitivePatterns(sentences: string[]): number {
  if (sentences.length < 3) return 0.0;
  const starters = sentences.map((s) => {
    const w = tokenizeWords(s);
    return w.slice(0, 3).join(" ");
  });

  const counts: Record<string, number> = {};
  starters.forEach((st) => {
    counts[st] = (counts[st] || 0) + 1;
  });

  let repeated = 0;
  Object.values(counts).forEach((c) => {
    if (c > 1) repeated++;
  });
  const repetitionRatio = starters.length > 0 ? repeated / starters.length : 0;

  const formulaicStarts = [
    "in addition", "furthermore", "moreover", "however", "on the other hand",
    "in conclusion", "to summarize", "it is important", "it is worth", "it should be noted",
    "this is because", "this means that", "as a result", "first", "second", "third", "finally"
  ];

  let formulaicCount = 0;
  sentences.forEach((s) => {
    const sLower = s.toLowerCase().trim();
    if (formulaicStarts.some((f) => sLower.startsWith(f))) {
      formulaicCount++;
    }
  });
  const formulaicRatio = sentences.length > 0 ? formulaicCount / sentences.length : 0;

  return Math.round(Math.min(repetitionRatio * 0.6 + formulaicRatio * 0.4, 1.0) * 10000) / 10000;
}

function classifySentence(sentence: string, overallBurstiness: number): SentenceResult {
  const words = tokenizeWords(sentence);
  const perplexity = calculatePerplexity(sentence);
  const ttr = typeTokenRatio(words);

  let aiInd = 0.0;
  let humInd = 0.0;

  if (perplexity < PERPLEXITY_AI_THRESHOLD) {
    aiInd += 3.0;
  } else if (perplexity > PERPLEXITY_HUMAN_THRESHOLD) {
    humInd += 3.0;
  } else {
    const ratio =
      (perplexity - PERPLEXITY_AI_THRESHOLD) /
      (PERPLEXITY_HUMAN_THRESHOLD - PERPLEXITY_AI_THRESHOLD);
    humInd += 3.0 * ratio;
    aiInd += 3.0 * (1 - ratio);
  }

  if (ttr < TTR_AI_THRESHOLD) {
    aiInd += 2.0;
  } else if (ttr > TTR_HUMAN_THRESHOLD) {
    humInd += 2.0;
  } else {
    const ratio = (ttr - TTR_AI_THRESHOLD) / (TTR_HUMAN_THRESHOLD - TTR_AI_THRESHOLD);
    humInd += 2.0 * ratio;
    aiInd += 2.0 * (1 - ratio);
  }

  if (words.length > 0) {
    if (words.length >= 12 && words.length <= 22) {
      aiInd += 1.5;
    } else {
      humInd += 1.5;
    }
  }

  if (overallBurstiness < 15.0) {
    aiInd += 1.5;
  } else if (overallBurstiness > 30.0) {
    humInd += 1.5;
  }

  const total = 8.0;
  const humanProb = humInd / total;

  let label: "ai" | "human" | "paraphrase";
  let confidence: number;

  if (humanProb < 0.4) {
    label = "ai";
    confidence = 1.0 - humanProb;
  } else if (humanProb > 0.65) {
    label = "human";
    confidence = humanProb;
  } else {
    label = "paraphrase";
    confidence = 0.5 + Math.abs(humanProb - 0.5);
  }

  return {
    text: sentence,
    label,
    confidence: Math.round(Math.min(Math.max(confidence, 0.0), 1.0) * 100) / 100,
    perplexity,
    burstiness: null,
  };
}

export function analyzeTextClientSide(text: string): AnalysisResponse {
  const startTime = Date.now();
  const sentences = splitSentences(text);

  if (sentences.length === 0) {
    return {
      ai_score: 0,
      human_score: 0,
      confidence: 0,
      total_sentences: 0,
      ai_sentences: 0,
      human_sentences: 0,
      paraphrased_sentences: 0,
      avg_perplexity: 0,
      avg_burstiness: 0,
      repetition_score: 0,
      sentences: [],
      processing_time_ms: 0,
    };
  }

  const burstiness = calculateBurstiness(sentences);
  const results = sentences.map((s) => classifySentence(s, burstiness));
  const repetitionScore = detectRepetitivePatterns(sentences);

  const aiCount = results.filter((r) => r.label === "ai").length;
  const humanCount = results.filter((r) => r.label === "human").length;
  const paraphraseCount = results.filter((r) => r.label === "paraphrase").length;
  const total = results.length;

  let aiScore = Math.round((aiCount / total) * 100 * 10) / 10;
  let humanScore = Math.round((humanCount / total) * 100 * 10) / 10;

  if (repetitionScore > 0.3) {
    const aiBoost = repetitionScore * 15;
    aiScore = Math.min(aiScore + aiBoost, 100);
    humanScore = Math.max(100 - aiScore, 0);
  }

  const avgConfidence =
    results.reduce((acc, r) => acc + r.confidence, 0) / total;
  const avgPerplexity =
    results.reduce((acc, r) => acc + r.perplexity, 0) / total;

  return {
    ai_score: Math.round(aiScore * 10) / 10,
    human_score: Math.round(humanScore * 10) / 10,
    confidence: Math.round(avgConfidence * 100) / 100,
    total_sentences: total,
    ai_sentences: aiCount,
    human_sentences: humanCount,
    paraphrased_sentences: paraphraseCount,
    avg_perplexity: Math.round(avgPerplexity * 10) / 10,
    avg_burstiness: burstiness,
    repetition_score: repetitionScore,
    sentences: results,
    processing_time_ms: Date.now() - startTime,
  };
}
