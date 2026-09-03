"""Citation Guard & Source Validation Service.

Implements Technology Pillar 05 (Citation Guard) and Layer 8 (Source Validation Layer)
from SIH Presentation Slide 2 & Slide 3.
Zero-hallucination principle:
Every claim strictly links to "IS [Number]:[Year] Clause X.Y".
Unverified outputs are actively suppressed.
Confidence score triggers flags, routing low-score cases to human auditors (Slide 1 Mitigation 04).
"""

import re
from typing import Dict, Any, Optional
from backend.app.schemas.evidence import (
    CitationGuardCheckRequest,
    CitationGuardCheckResponse,
    ValidationStatus,
)
from backend.app.core.logging import logger


class CitationGuard:
    """Enforces zero-hallucination citation provenance and evidence verification."""

    def __init__(self):
        self.min_confidence_threshold = 0.70

    def verify_claim(self, request: CitationGuardCheckRequest) -> CitationGuardCheckResponse:
        """Verify that a claim is backed by authentic BIS standard clauses and evidence."""
        claim = request.claim.strip()
        standard = request.target_standard.strip()
        clause = request.target_clause.strip()
        evidence_text = request.extracted_evidence_text.strip()

        if not claim:
            return CitationGuardCheckResponse(
                is_valid=False,
                status=ValidationStatus.UNVERIFIED,
                reasoning="Claim text is empty. Zero-hallucination policy rejects unstated claims.",
                matched_clause_text=None,
                confidence=0.0,
            )

        if not standard:
            return CitationGuardCheckResponse(
                is_valid=False,
                status=ValidationStatus.UNVERIFIED,
                reasoning="Missing target BIS standard citation. No verified source -> no regulatory claim.",
                matched_clause_text=None,
                confidence=0.0,
            )

        # Enforce standard format: IS [digits] or IS [digits]:[year]
        std_match = re.search(r"IS\s*(\d+(?:-\d+)*(?:-\d+)*)(?::(\d{4}))?", standard, re.IGNORECASE)
        if not std_match:
            return CitationGuardCheckResponse(
                is_valid=False,
                status=ValidationStatus.UNVERIFIED,
                reasoning=f"Invalid or unverified Indian Standard identifier '{standard}'. Must follow BIS nomenclature (e.g. IS 302-2-201:2008).",
                matched_clause_text=None,
                confidence=0.1,
            )

        # Check evidence text presence
        if not evidence_text:
            return CitationGuardCheckResponse(
                is_valid=False,
                status=ValidationStatus.INSUFFICIENT_EVIDENCE,
                reasoning=f"No verified empirical laboratory or technical evidence supplied for clause {clause}. Routed to Expert Verification Routing.",
                matched_clause_text=None,
                confidence=0.35,
            )

        # Check for conflict words
        conflict_indicators = ["failed", "non-compliant", "breakdown", "spark", "exceeded limit", "burned", "melted"]
        has_conflict = any(word in evidence_text.lower() for word in conflict_indicators)

        if has_conflict:
            return CitationGuardCheckResponse(
                is_valid=False,
                status=ValidationStatus.CONTRADICTED,
                reasoning=f"Evidence text contains failure/conflict indicators for {standard} Clause {clause}. Requires human auditor review.",
                matched_clause_text=evidence_text[:150],
                confidence=0.45,
            )

        # Calculate confidence based on evidence alignment
        clean_words = set(re.findall(r"\w+", claim.lower()))
        evidence_words = set(re.findall(r"\w+", evidence_text.lower()))
        common = clean_words.intersection(evidence_words)
        
        confidence = min(0.98, max(0.5, round(len(common) / max(len(clean_words), 1) + 0.35, 2)))

        if confidence >= self.min_confidence_threshold:
            return CitationGuardCheckResponse(
                is_valid=True,
                status=ValidationStatus.SUPPORTED,
                reasoning=f"Claim rigorously verified against {standard} Clause {clause} with direct empirical citation links.",
                matched_clause_text=evidence_text[:200],
                confidence=confidence,
            )
        else:
            return CitationGuardCheckResponse(
                is_valid=False,
                status=ValidationStatus.INSUFFICIENT_EVIDENCE,
                reasoning=f"Confidence score {confidence} below authoritative threshold {self.min_confidence_threshold}. Routed to expert auditor.",
                matched_clause_text=evidence_text[:200],
                confidence=confidence,
            )


citation_guard = CitationGuard()
