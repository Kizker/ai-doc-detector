"""
AI Document Detector — AI Detection Service
Analyzes text to detect AI-generated content using linguistic heuristics
and statistical NLP analysis.

Detection approach:
1. Split text into sentences
2. Analyze each sentence using multiple linguistic features:
   - Vocabulary diversity (Type-Token Ratio)
   - Sentence length uniformity
   - Perplexity estimation (word predictability)
   - Burstiness (variation in sentence structure)
   - Readability scores (Flesch, Gunning Fog)
   - Repetitive pattern detection
3. Aggregate into per-sentence classification
4. Calculate overall AI probability score
"""

import re
import math
import string
from typing import List, Dict, Any, Optional, Tuple
from collections import Counter


class AIDetectorService:
    """Service for detecting AI-generated text content."""

    # ── Thresholds for classification ──────────────────────────────
    # These are tuned heuristics; in production, replace with a
    # trained classifier (e.g., roberta-base-openai-detector)
    PERPLEXITY_AI_THRESHOLD = 30.0       # Below = likely AI
    PERPLEXITY_HUMAN_THRESHOLD = 55.0    # Above = likely human
    BURSTINESS_AI_THRESHOLD = 15.0       # Below = likely AI (too uniform)
    TTR_AI_THRESHOLD = 0.45              # Below = repetitive (AI pattern)
    TTR_HUMAN_THRESHOLD = 0.70           # Above = diverse (human pattern)

    def __init__(self):
        """Initialize the AI detector with NLTK resources."""
        self._nltk_ready = False
        self._setup_nltk()

    def _setup_nltk(self):
        """Download required NLTK data if not present."""
        try:
            import nltk
            try:
                nltk.data.find("tokenizers/punkt_tab")
            except LookupError:
                try:
                    nltk.download("punkt_tab", quiet=True)
                except Exception:
                    pass
            self._nltk_ready = True
        except ImportError:
            self._nltk_ready = False

    def _split_sentences(self, text: str) -> List[str]:
        """Split text into sentences using NLTK or regex fallback."""
        if self._nltk_ready:
            try:
                import nltk
                sentences = nltk.sent_tokenize(text)
                return [s.strip() for s in sentences if len(s.strip()) > 5]
            except Exception:
                pass

        # Regex fallback
        sentences = re.split(r'(?<=[.!?])\s+', text.strip())
        return [s.strip() for s in sentences if len(s.strip()) > 5]

    def _tokenize_words(self, text: str) -> List[str]:
        """Tokenize text into words, removing punctuation."""
        text_clean = text.lower()
        # Remove punctuation
        text_clean = text_clean.translate(str.maketrans("", "", string.punctuation))
        words = text_clean.split()
        return [w for w in words if len(w) > 0]

    # ── Feature Extraction ─────────────────────────────────────────

    def _type_token_ratio(self, words: List[str]) -> float:
        """
        Calculate Type-Token Ratio (vocabulary diversity).
        AI text tends to reuse vocabulary more (lower TTR).
        Human text is more diverse (higher TTR).
        """
        if not words:
            return 0.0
        unique = len(set(words))
        total = len(words)
        return unique / total

    def _calculate_perplexity(self, sentence: str) -> float:
        """
        Estimate pseudo-perplexity based on linguistic features.

        Low perplexity = predictable, uniform = AI-like
        High perplexity = varied, creative = Human-like

        Uses a combination of:
        - Vocabulary diversity
        - Word length variation
        - Unique bigram ratio
        - Punctuation density
        """
        words = self._tokenize_words(sentence)
        if len(words) < 2:
            return 50.0  # Neutral for very short sentences

        # 1. Vocabulary diversity component
        ttr = self._type_token_ratio(words)

        # 2. Word length variation
        word_lengths = [len(w) for w in words]
        avg_len = sum(word_lengths) / len(word_lengths)
        len_variance = sum((l - avg_len) ** 2 for l in word_lengths) / len(word_lengths)
        len_std = math.sqrt(len_variance) if len_variance > 0 else 0

        # 3. Bigram uniqueness
        bigrams = list(zip(words[:-1], words[1:]))
        unique_bigrams = len(set(bigrams))
        bigram_ratio = unique_bigrams / len(bigrams) if bigrams else 1.0

        # 4. Punctuation density (humans use more varied punctuation)
        punct_count = sum(1 for c in sentence if c in string.punctuation)
        punct_density = punct_count / len(sentence) if sentence else 0

        # Combine into pseudo-perplexity score (0-100)
        perplexity = (
            ttr * 30 +                          # Vocabulary diversity
            min(len_std, 3) * 10 +              # Word length variation
            bigram_ratio * 25 +                  # Bigram uniqueness
            min(punct_density * 100, 10) * 1.5 + # Punctuation variety
            min(len(words), 30) * 0.3            # Sentence length bonus
        )

        return round(max(0, min(perplexity, 100)), 2)

    def _calculate_burstiness(self, sentences: List[str]) -> float:
        """
        Calculate burstiness across sentences.
        AI text has uniform sentence lengths (low burstiness).
        Human text varies significantly (high burstiness).
        """
        if len(sentences) < 2:
            return 0.0

        lengths = [len(self._tokenize_words(s)) for s in sentences]
        mean_len = sum(lengths) / len(lengths)

        if mean_len == 0:
            return 0.0

        variance = sum((l - mean_len) ** 2 for l in lengths) / len(lengths)
        std_dev = math.sqrt(variance)

        # Coefficient of variation normalized to 0-100
        cv = (std_dev / mean_len) * 100 if mean_len > 0 else 0
        return round(min(cv, 100), 2)

    def _detect_repetitive_patterns(self, sentences: List[str]) -> float:
        """
        Detect repetitive sentence starters and structures.
        AI text often starts sentences with similar patterns.
        Returns a score 0-1 where higher = more repetitive (AI-like).
        """
        if len(sentences) < 3:
            return 0.0

        # Check sentence starters (first 3 words)
        starters = []
        for s in sentences:
            words = self._tokenize_words(s)
            if len(words) >= 3:
                starters.append(" ".join(words[:3]))
            elif words:
                starters.append(" ".join(words))

        if not starters:
            return 0.0

        # Count repeated starters
        starter_counts = Counter(starters)
        repeated = sum(1 for count in starter_counts.values() if count > 1)
        repetition_ratio = repeated / len(starters) if starters else 0

        # Check for formulaic transitions
        formulaic_starts = [
            "in addition", "furthermore", "moreover", "however",
            "on the other hand", "in conclusion", "to summarize",
            "it is important", "it is worth", "it should be noted",
            "this is because", "this means that", "as a result",
            "first", "second", "third", "finally",
            "in this", "in the", "the", "this",
        ]

        formulaic_count = 0
        for s in sentences:
            s_lower = s.lower().strip()
            for formula in formulaic_starts:
                if s_lower.startswith(formula):
                    formulaic_count += 1
                    break

        formulaic_ratio = formulaic_count / len(sentences) if sentences else 0

        # Combine
        return round(min((repetition_ratio * 0.6 + formulaic_ratio * 0.4), 1.0), 4)

    def _get_readability(self, text: str) -> Dict[str, float]:
        """Calculate readability scores using textstat."""
        try:
            import textstat
            return {
                "flesch_reading_ease": textstat.flesch_reading_ease(text),
                "gunning_fog": textstat.gunning_fog(text),
                "automated_readability_index": textstat.automated_readability_index(text),
            }
        except ImportError:
            return {}

    # ── Classification ─────────────────────────────────────────────

    def _classify_sentence(self, sentence: str, overall_burstiness: float) -> Dict[str, Any]:
        """
        Classify a single sentence as AI or human-written.

        Uses multi-feature scoring:
        - Perplexity score
        - Vocabulary diversity
        - Sentence length patterns
        - Combined with overall document burstiness
        """
        words = self._tokenize_words(sentence)
        perplexity = self._calculate_perplexity(sentence)
        ttr = self._type_token_ratio(words)

        # ── Score calculation (0 = definitely AI, 1 = definitely human)
        ai_indicators = 0.0
        human_indicators = 0.0
        total_weight = 0.0

        # Perplexity signal (weight: 3)
        if perplexity < self.PERPLEXITY_AI_THRESHOLD:
            ai_indicators += 3.0
        elif perplexity > self.PERPLEXITY_HUMAN_THRESHOLD:
            human_indicators += 3.0
        else:
            # Interpolate
            ratio = (perplexity - self.PERPLEXITY_AI_THRESHOLD) / (
                self.PERPLEXITY_HUMAN_THRESHOLD - self.PERPLEXITY_AI_THRESHOLD
            )
            human_indicators += 3.0 * ratio
            ai_indicators += 3.0 * (1 - ratio)
        total_weight += 3.0

        # TTR signal (weight: 2)
        if ttr < self.TTR_AI_THRESHOLD:
            ai_indicators += 2.0
        elif ttr > self.TTR_HUMAN_THRESHOLD:
            human_indicators += 2.0
        else:
            ratio = (ttr - self.TTR_AI_THRESHOLD) / (
                self.TTR_HUMAN_THRESHOLD - self.TTR_AI_THRESHOLD
            )
            human_indicators += 2.0 * ratio
            ai_indicators += 2.0 * (1 - ratio)
        total_weight += 2.0

        # Burstiness context signal (weight: 1.5)
        if overall_burstiness < self.BURSTINESS_AI_THRESHOLD:
            ai_indicators += 1.5
        elif overall_burstiness > 30:
            human_indicators += 1.5
        else:
            ratio = (overall_burstiness - self.BURSTINESS_AI_THRESHOLD) / 15
            human_indicators += 1.5 * min(ratio, 1)
            ai_indicators += 1.5 * max(1 - ratio, 0)
        total_weight += 1.5

        # Sentence length signal (weight: 1)
        # AI tends to produce medium-length sentences (15-25 words)
        word_count = len(words)
        if 15 <= word_count <= 25:
            ai_indicators += 1.0  # Suspiciously uniform length
        elif word_count < 8 or word_count > 35:
            human_indicators += 1.0  # Very short or very long = human
        else:
            ai_indicators += 0.3
            human_indicators += 0.7
        total_weight += 1.0

        # Calculate human probability
        human_prob = human_indicators / total_weight if total_weight > 0 else 0.5

        # Classify
        if human_prob < 0.35:
            label = "ai"
            confidence = 1.0 - human_prob
        elif human_prob > 0.65:
            label = "human"
            confidence = human_prob
        else:
            label = "paraphrase"
            confidence = 0.5 + abs(human_prob - 0.5)

        return {
            "text": sentence,
            "label": label,
            "confidence": round(min(max(confidence, 0.0), 1.0), 4),
            "perplexity": perplexity,
            "burstiness": None,  # Set at document level
        }

    def analyze(self, text: str) -> Dict[str, Any]:
        """
        Analyze text for AI-generated content.

        Args:
            text: The text to analyze.

        Returns:
            Dictionary with overall scores and per-sentence results.
        """
        sentences = self._split_sentences(text)

        if not sentences:
            return {
                "ai_score": 0.0,
                "human_score": 0.0,
                "confidence": 0.0,
                "total_sentences": 0,
                "ai_sentences": 0,
                "human_sentences": 0,
                "paraphrased_sentences": 0,
                "sentences": [],
            }

        # Calculate document-level burstiness first
        burstiness = self._calculate_burstiness(sentences)

        # Classify each sentence with burstiness context
        results = [self._classify_sentence(s, burstiness) for s in sentences]

        # Check for repetitive patterns
        repetition_score = self._detect_repetitive_patterns(sentences)

        # Count by label
        ai_count = sum(1 for r in results if r["label"] == "ai")
        human_count = sum(1 for r in results if r["label"] == "human")
        paraphrase_count = sum(1 for r in results if r["label"] == "paraphrase")
        total = len(results)

        # Calculate base scores
        ai_score = round((ai_count / total) * 100, 1) if total > 0 else 0.0
        human_score = round((human_count / total) * 100, 1) if total > 0 else 0.0

        # Adjust scores with repetition pattern
        # High repetition increases AI score
        if repetition_score > 0.3:
            ai_boost = repetition_score * 15  # Up to +15%
            ai_score = min(ai_score + ai_boost, 100.0)
            human_score = max(100.0 - ai_score - (paraphrase_count / total * 100 if total > 0 else 0), 0.0)

        # Average confidence
        avg_confidence = sum(r["confidence"] for r in results) / total if total > 0 else 0.0

        # Average perplexity
        avg_perplexity = sum(r["perplexity"] for r in results) / total if total > 0 else 0.0

        # Readability metrics
        readability = self._get_readability(text)

        return {
            "ai_score": round(ai_score, 1),
            "human_score": round(human_score, 1),
            "confidence": round(avg_confidence, 4),
            "total_sentences": total,
            "ai_sentences": ai_count,
            "human_sentences": human_count,
            "paraphrased_sentences": paraphrase_count,
            "avg_perplexity": round(avg_perplexity, 2),
            "avg_burstiness": burstiness,
            "repetition_score": repetition_score,
            "readability": readability,
            "sentences": results,
        }
