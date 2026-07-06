"""
AI Document Detector — Metadata Forensics Service
Analyzes document metadata for anomalies and authenticity indicators.

Detects:
- Time anomalies (creation time vs document length)
- Tool fingerprinting (known AI-related tools)
- Authorship inconsistencies
- Suspicious editing patterns
"""

from typing import Dict, Any, List, Optional
from datetime import datetime


class MetadataForensicsService:
    """Service for forensic analysis of document metadata."""

    # Known AI-related tools / generators
    AI_TOOL_INDICATORS = [
        "chatgpt", "gpt", "openai", "claude", "anthropic",
        "jasper", "copy.ai", "writesonic", "grammarly ai",
        "notion ai", "bing chat", "gemini", "bard",
        "quillbot", "spinbot", "articleforge",
    ]

    # Normal writing speeds (words per minute)
    SLOW_WRITING_WPM = 5    # Very slow / careful editing
    FAST_WRITING_WPM = 150  # Extremely fast (suspicious)
    NORMAL_MIN_WPM = 10
    NORMAL_MAX_WPM = 60

    def analyze(self, metadata: Dict[str, Any]) -> Dict[str, Any]:
        """
        Perform forensic analysis on document metadata.

        Args:
            metadata: Raw metadata dictionary from TextExtractorService.

        Returns:
            Forensics report with anomalies and risk assessment.
        """
        anomalies: List[Dict[str, str]] = []
        risk_factors: List[float] = []

        # 1. Time anomaly detection
        time_result = self._check_time_anomaly(metadata)
        if time_result:
            anomalies.extend(time_result["anomalies"])
            risk_factors.append(time_result["risk"])

        # 2. Tool fingerprinting
        tool_result = self._check_tool_fingerprint(metadata)
        if tool_result:
            anomalies.extend(tool_result["anomalies"])
            risk_factors.append(tool_result["risk"])

        # 3. Author analysis
        author_result = self._check_author(metadata)
        if author_result:
            anomalies.extend(author_result["anomalies"])
            risk_factors.append(author_result["risk"])

        # 4. Revision analysis
        revision_result = self._check_revisions(metadata)
        if revision_result:
            anomalies.extend(revision_result["anomalies"])
            risk_factors.append(revision_result["risk"])

        # Calculate overall risk level
        if risk_factors:
            avg_risk = sum(risk_factors) / len(risk_factors)
            max_risk = max(risk_factors)
            # Weight towards maximum risk
            overall_risk = (avg_risk * 0.4) + (max_risk * 0.6)
        else:
            overall_risk = 0.0

        if overall_risk >= 0.7:
            risk_level = "high"
        elif overall_risk >= 0.4:
            risk_level = "medium"
        else:
            risk_level = "low"

        return {
            "anomalies": anomalies,
            "risk_level": risk_level,
            "risk_score": round(overall_risk, 3),
            "author": metadata.get("author"),
            "creator_tool": metadata.get("creator_tool"),
            "producer": metadata.get("producer"),
            "creation_date": metadata.get("creation_date"),
            "modification_date": metadata.get("modification_date"),
            "file_hash": metadata.get("file_hash"),
            "page_count": metadata.get("page_count"),
            "total_words": metadata.get("total_words"),
        }

    def _check_time_anomaly(self, metadata: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Detect time anomalies: very short editing time for long documents.
        If a 5000-word document was created and modified within 2 minutes,
        it's likely pasted from an AI tool.
        """
        creation = metadata.get("creation_date")
        modification = metadata.get("modification_date")
        total_words = metadata.get("total_words", 0)

        if not creation or not modification or not total_words:
            return None

        anomalies = []
        risk = 0.0

        try:
            # Parse ISO dates
            if isinstance(creation, str):
                created_dt = datetime.fromisoformat(creation.replace("Z", "+00:00"))
            else:
                created_dt = creation

            if isinstance(modification, str):
                modified_dt = datetime.fromisoformat(modification.replace("Z", "+00:00"))
            else:
                modified_dt = modification

            # Calculate editing duration in minutes
            delta = (modified_dt - created_dt).total_seconds() / 60.0

            if delta <= 0:
                delta = 0.1  # Avoid division by zero

            # Calculate effective writing speed (words per minute)
            wpm = total_words / delta if delta > 0 else float("inf")

            if wpm > self.FAST_WRITING_WPM:
                anomalies.append({
                    "type": "time_anomaly",
                    "description": (
                        f"Extremely fast writing speed detected: {wpm:.0f} words/min "
                        f"({total_words} words in {delta:.1f} minutes). "
                        f"This suggests content was pasted from an external source."
                    ),
                    "severity": "high",
                })
                risk = 0.9
            elif wpm > self.NORMAL_MAX_WPM:
                anomalies.append({
                    "type": "time_anomaly",
                    "description": (
                        f"Unusually fast writing speed: {wpm:.0f} words/min "
                        f"({total_words} words in {delta:.1f} minutes). "
                        f"Normal range is {self.NORMAL_MIN_WPM}-{self.NORMAL_MAX_WPM} wpm."
                    ),
                    "severity": "medium",
                })
                risk = 0.5

            # Check if creation and modification are identical
            if abs((modified_dt - created_dt).total_seconds()) < 5:
                anomalies.append({
                    "type": "time_anomaly",
                    "description": (
                        "Creation and modification timestamps are nearly identical, "
                        "suggesting the document was not revised after initial creation."
                    ),
                    "severity": "low",
                })
                risk = max(risk, 0.3)

        except (ValueError, TypeError) as e:
            pass  # Skip if dates can't be parsed

        return {"anomalies": anomalies, "risk": risk} if anomalies else None

    def _check_tool_fingerprint(self, metadata: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Check if creation tools suggest AI-generated content."""
        anomalies = []
        risk = 0.0

        # Check creator, producer, and other tool fields
        tool_fields = [
            metadata.get("creator_tool", ""),
            metadata.get("producer", ""),
        ]

        for tool in tool_fields:
            if not tool:
                continue
            tool_lower = tool.lower()

            for indicator in self.AI_TOOL_INDICATORS:
                if indicator in tool_lower:
                    anomalies.append({
                        "type": "tool_fingerprint",
                        "description": (
                            f"Document was created with a tool associated with AI: '{tool}'. "
                            f"Matched indicator: '{indicator}'."
                        ),
                        "severity": "high",
                    })
                    risk = 0.8
                    break

        # Check for Google Docs (not AI, but notable for copy-paste workflows)
        for tool in tool_fields:
            if tool and "google" in tool.lower():
                anomalies.append({
                    "type": "tool_info",
                    "description": f"Document created with Google suite: '{tool}'.",
                    "severity": "low",
                })
                risk = max(risk, 0.1)

        return {"anomalies": anomalies, "risk": risk} if anomalies else None

    def _check_author(self, metadata: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Check for missing or suspicious author information."""
        anomalies = []
        risk = 0.0

        author = metadata.get("author")

        if not author or author.strip() == "":
            anomalies.append({
                "type": "author_missing",
                "description": "No author information found in the document metadata.",
                "severity": "low",
            })
            risk = 0.2

        elif author.lower() in ["unknown", "user", "admin", "administrator", "owner"]:
            anomalies.append({
                "type": "author_generic",
                "description": (
                    f"Generic author name detected: '{author}'. "
                    f"This may indicate the document was not properly attributed."
                ),
                "severity": "low",
            })
            risk = 0.2

        return {"anomalies": anomalies, "risk": risk} if anomalies else None

    def _check_revisions(self, metadata: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Check revision count for anomalies."""
        anomalies = []
        risk = 0.0

        revision = metadata.get("revision")
        total_words = metadata.get("total_words", 0)

        if revision is not None:
            try:
                rev_count = int(revision)
                if rev_count <= 1 and total_words > 500:
                    anomalies.append({
                        "type": "low_revisions",
                        "description": (
                            f"Document has only {rev_count} revision(s) despite containing "
                            f"{total_words} words. Long documents typically go through "
                            f"multiple revisions during writing."
                        ),
                        "severity": "medium",
                    })
                    risk = 0.4
            except (ValueError, TypeError):
                pass

        return {"anomalies": anomalies, "risk": risk} if anomalies else None
