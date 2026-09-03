import re
import hashlib
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List, Tuple
from pydantic import BaseModel, Field


class StructuredEvidence(BaseModel):
    """Normalized structured evidence representation extracted from test reports, datasheets, or specs."""
    evidence_id: str
    assessment_id: Optional[str] = None
    document_id: Optional[str] = None
    evidence_type: str = "TEST_REPORT"  # TEST_REPORT | LAB_REPORT | MATERIAL_CERTIFICATE | etc.
    source_type: str = "LABORATORY"  # LABORATORY | MANUFACTURER | REGULATOR | USER_UPLOAD
    source_authority: str = "LAB_REPORT"  # NABL_ACCREDITED_LAB | BIS_OFFICIAL | etc.
    verification_status: str = "VERIFIED"  # VERIFIED | UNVERIFIED | REJECTED | REQUIRES_REVIEW
    extracted_claim: Optional[str] = None
    attribute: str
    raw_value: str
    normalized_value: Any
    normalized_unit: Optional[str] = None
    page_number: Optional[int] = None
    page: Optional[int] = None
    bounding_box: Optional[Dict[str, Any]] = None
    source_excerpt: Optional[str] = None
    source_text: str = ""
    extraction_method: str = "STRUCTURED_PARSE"
    extraction_confidence: float = Field(default=1.0, ge=0.0, le=1.0)
    confidence: float = Field(default=1.0, ge=0.0, le=1.0)
    authority: str = "LAB_REPORT"
    verified_by: Optional[str] = None
    verified_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    evidence_hash: Optional[str] = None

    def model_post_init(self, __context: Any) -> None:
        if self.page is not None and self.page_number is None:
            self.page_number = self.page
        elif self.page_number is not None and self.page is None:
            self.page = self.page_number
        if not self.source_excerpt and self.source_text:
            self.source_excerpt = self.source_text
        elif not self.source_text and self.source_excerpt:
            self.source_text = self.source_excerpt
        if not self.authority and self.source_authority:
            self.authority = self.source_authority
        elif not self.source_authority and self.authority:
            self.source_authority = self.authority
        if not self.evidence_hash and self.source_text:
            self.evidence_hash = hashlib.sha256(self.source_text.encode("utf-8")).hexdigest()


class StructuredTable(BaseModel):
    """Extracted technical table matrix."""
    table_id: str
    page: int
    headers: List[str]
    rows: List[List[str]]
    confidence: float = 1.0
    extraction_method: str = "LAYOUT_PARSER"


def normalize_evidence_units(raw_val: str) -> Tuple[Any, Optional[str]]:
    """Normalize values and technical units (e.g. 60 deg C -> (60.0, 'C'))."""
    clean = raw_val.strip()
    
    # Temperature: 60 °C, 60C, 60 degrees Celsius, 60 deg C
    temp_match = re.search(r"([\d\.]+)\s*(?:°\s*c|deg\s*c|celsius|c\b)", clean, re.I)
    if temp_match:
        try:
            return float(temp_match.group(1)), "C"
        except ValueError:
            pass

    # Percentage: 0.05%, 0.05 percent
    pct_match = re.search(r"([\d\.]+)\s*(?:%|percent)", clean, re.I)
    if pct_match:
        try:
            return float(pct_match.group(1)), "%"
        except ValueError:
            pass

    # Volume / Capacity: 1000 ml, 1 litre, 0.75 L
    vol_litre = re.search(r"([\d\.]+)\s*(?:litres?|liters?|l\b)", clean, re.I)
    if vol_litre:
        try:
            return float(vol_litre.group(1)) * 1000.0, "ml"
        except ValueError:
            pass

    vol_ml = re.search(r"([\d\.]+)\s*(?:ml|millilitres?|milliliters?)\b", clean, re.I)
    if vol_ml:
        try:
            return float(vol_ml.group(1)), "ml"
        except ValueError:
            pass

    # Duration: 6 hours, 6h, 10 minutes, 10 min
    hour_match = re.search(r"([\d\.]+)\s*(?:hours?|hrs?|h\b)", clean, re.I)
    if hour_match:
        return float(hour_match.group(1)), "hours"

    min_match = re.search(r"([\d\.]+)\s*(?:minutes?|mins?|m\b)", clean, re.I)
    if min_match:
        return float(min_match.group(1)), "minutes"

    # Numeric fallback
    num_match = re.search(r"^([\d\.]+)$", clean)
    if num_match:
        try:
            return float(num_match.group(1)), None
        except ValueError:
            pass

    return clean, None


def extract_evidence_from_snippet(
    snippet: str,
    evidence_type: str = "TEST_REPORT",
    document_id: Optional[str] = None,
    page: Optional[int] = None,
    authority: str = "LAB_REPORT",
    assessment_id: Optional[str] = None,
) -> List[StructuredEvidence]:
    """Extract structured evidence parameters from document snippet or lab test report text.
    
    Treats all incoming snippets as untrusted data, passing them through security prompt sanitization.
    Zero LLM compliance authority: returns raw structured attributes for deterministic evaluation.
    """
    from backend.app.services.security.prompt_guard import scan_and_sanitize_untrusted_text

    scan_res = scan_and_sanitize_untrusted_text(snippet)
    clean_snippet = scan_res.sanitized_text

    evidences: List[StructuredEvidence] = []
    text_lower = clean_snippet.lower()

    # 1. Temperature / Heat retention parameter (e.g. 64.5 deg C)
    temp_search = re.search(
        r"(?:temperature|heat retention|thermal performance|water temp)[^\d\n]*([\d\.]+\s*(?:°\s*c|deg\s*c|c\b))",
        clean_snippet,
        re.I,
    )
    if temp_search:
        raw_v = temp_search.group(1)
        norm_v, unit = normalize_evidence_units(raw_v)
        ev_id = f"EV-TEMP-{page or 1}-{int(norm_v)}"
        evidences.append(
            StructuredEvidence(
                evidence_id=ev_id,
                assessment_id=assessment_id,
                document_id=document_id or f"DOC-{authority}",
                evidence_type=evidence_type,
                source_type="LABORATORY" if "LAB" in authority else "MANUFACTURER",
                source_authority=authority,
                verification_status="VERIFIED" if authority in ("LAB_REPORT", "NABL_ACCREDITED_LAB", "BIS_OFFICIAL") else "REQUIRES_REVIEW",
                extracted_claim=f"Tested heat retention water temperature {norm_v}°{unit} after 6 hours.",
                attribute="tested_heat_retention_temp",
                raw_value=raw_v,
                normalized_value=norm_v,
                normalized_unit=unit,
                page_number=page,
                page=page,
                source_excerpt=clean_snippet[:250],
                source_text=clean_snippet[:250],
                extraction_method="STRUCTURED_PARSE",
                extraction_confidence=0.98,
                authority=authority,
            )
        )

    # 2. Inversion / Leakage parameter
    if any(k in text_lower for k in ["leakage", "inverted", "seepage"]):
        passed = (
            "no leakage" in text_lower
            or "nil" in text_lower
            or "zero leakage" in text_lower
            or "passed" in text_lower
        ) and "leakage observed" not in text_lower.replace("zero leakage observed", "").replace("no leakage observed", "")
        
        # If text explicitly says 'leakage observed' without zero/no
        if "leakage observed" in text_lower and not ("zero leakage" in text_lower or "no leakage" in text_lower):
            passed = False

        ev_id = f"EV-LEAK-{page or 1}"
        evidences.append(
            StructuredEvidence(
                evidence_id=ev_id,
                assessment_id=assessment_id,
                document_id=document_id or f"DOC-{authority}",
                evidence_type=evidence_type,
                source_type="LABORATORY" if "LAB" in authority else "MANUFACTURER",
                source_authority=authority,
                verification_status="VERIFIED" if authority in ("LAB_REPORT", "NABL_ACCREDITED_LAB", "BIS_OFFICIAL") else "REQUIRES_REVIEW",
                extracted_claim="10-minute inversion test: zero leakage or moisture seepage confirmed." if passed else "Leakage test failed.",
                attribute="leakage_test_result",
                raw_value="PASSED" if passed else "FAILED",
                normalized_value=1.0 if passed else 0.0,
                normalized_unit=None,
                page_number=page,
                page=page,
                source_excerpt=clean_snippet[:250],
                source_text=clean_snippet[:250],
                extraction_method="STRUCTURED_PARSE",
                extraction_confidence=0.95,
                authority=authority,
            )
        )

    # 3. Material Certificate parameter (e.g. Grade 304 chemical composition)
    if "grade 304" in text_lower or "ss 304" in text_lower or "grade 201" in text_lower or "grade 316" in text_lower:
        grade = "Grade 304"
        norm_grade = "stainless_steel_grade_304"
        if "grade 201" in text_lower or "ss 201" in text_lower:
            grade = "Grade 201"
            norm_grade = "stainless_steel_grade_201"
        elif "grade 316" in text_lower or "ss 316" in text_lower:
            grade = "Grade 316"
            norm_grade = "stainless_steel_grade_316"

        ev_id = f"EV-MAT-{page or 1}"
        ev_type = "MATERIAL_CERTIFICATE" if "cert" in text_lower or "mill" in text_lower else evidence_type
        evidences.append(
            StructuredEvidence(
                evidence_id=ev_id,
                assessment_id=assessment_id,
                document_id=document_id or f"DOC-MAT-{grade.replace(' ', '')}",
                evidence_type=ev_type,
                source_type="MANUFACTURER" if "mill" in text_lower else "LABORATORY",
                source_authority=authority,
                verification_status="VERIFIED" if ("mill" in text_lower or "cert" in text_lower or "LAB" in authority) else "REQUIRES_REVIEW",
                extracted_claim=f"Material grade certified as {grade} (IS 6911 chemical composition).",
                attribute="material_grade_verified",
                raw_value=grade,
                normalized_value=norm_grade,
                normalized_unit=None,
                page_number=page,
                page=page,
                source_excerpt=clean_snippet[:250],
                source_text=clean_snippet[:250],
                extraction_method="STRUCTURED_PARSE",
                extraction_confidence=0.96,
                authority=authority,
            )
        )

    # 4. Capacity parameter
    cap_search = re.search(r"(?:capacity|volume)[^\d\n]*([\d\.]+\s*(?:ml|millilitres?|litres?|liter|l)\b)", clean_snippet, re.I)
    if cap_search:
        raw_c = cap_search.group(1)
        norm_c, u_c = normalize_evidence_units(raw_c)
        ev_id = f"EV-CAP-{page or 1}-{int(norm_c)}"
        evidences.append(
            StructuredEvidence(
                evidence_id=ev_id,
                assessment_id=assessment_id,
                document_id=document_id or f"DOC-{authority}",
                evidence_type=evidence_type,
                source_type="LABORATORY" if "LAB" in authority else "MANUFACTURER",
                source_authority=authority,
                verification_status="VERIFIED" if authority in ("LAB_REPORT", "NABL_ACCREDITED_LAB", "BIS_OFFICIAL") else "REQUIRES_REVIEW",
                extracted_claim=f"Measured product nominal capacity: {norm_c} {u_c}.",
                attribute="capacity_ml",
                raw_value=raw_c,
                normalized_value=norm_c,
                normalized_unit=u_c,
                page_number=page,
                page=page,
                source_excerpt=clean_snippet[:250],
                source_text=clean_snippet[:250],
                extraction_method="STRUCTURED_PARSE",
                extraction_confidence=0.97,
                authority=authority,
            )
        )

    # 5. Marking / Artwork parameter
    if any(k in text_lower for k in ["artwork", "label", "isi mark", "standard mark", "marking"]):
        marked = "isi" in text_lower or "standard mark" in text_lower or "trademark" in text_lower
        ev_id = f"EV-MARK-{page or 1}"
        evidences.append(
            StructuredEvidence(
                evidence_id=ev_id,
                assessment_id=assessment_id,
                document_id=document_id or f"DOC-ARTWORK",
                evidence_type="LABEL_PHOTO" if "photo" in text_lower else "PRODUCT_SPECIFICATION",
                source_type="MANUFACTURER",
                source_authority="MANUFACTURER_DECLARATION",
                verification_status="VERIFIED" if marked else "REQUIRES_REVIEW",
                extracted_claim="Product label artwork includes manufacturer trademark, nominal capacity, and ISI Standard Mark layout." if marked else "Marking incomplete.",
                attribute="artwork_label_verified",
                raw_value="VERIFIED" if marked else "UNVERIFIED",
                normalized_value=1.0 if marked else 0.0,
                normalized_unit=None,
                page_number=page,
                page=page,
                source_excerpt=clean_snippet[:250],
                source_text=clean_snippet[:250],
                extraction_method="STRUCTURED_PARSE",
                extraction_confidence=0.95,
                authority=authority,
            )
        )

    return evidences


def detect_evidence_conflicts(evidences: List[StructuredEvidence]) -> List[Dict[str, Any]]:
    """Deterministically detect evidentiary contradictions across documents and parameters.
    
    Checks:
    - Numeric conflicts (e.g. Report 1: 1000ml vs Report 2: 750ml, or 64.5°C vs 54°C)
    - Unit-normalized conflicts (e.g. 1 L vs 750 ml)
    - Textual attribute conflicts (e.g. Grade 304 vs Grade 201)
    - Distinguishes consistent evidence (multiple documents agreeing) from conflicting evidence.
    
    The system NEVER silently resolves conflicts via LLM guessing; returns CONFLICTING_EVIDENCE + EXPERT_REVIEW.
    """
    conflicts = []
    attr_grouped: Dict[str, List[StructuredEvidence]] = {}
    for ev in evidences:
        attr_grouped.setdefault(ev.attribute, []).append(ev)

    for attr, ev_list in attr_grouped.items():
        if len(ev_list) <= 1:
            continue

        # Extract normalized values
        distinct_vals = []
        for ev in ev_list:
            val = ev.normalized_value
            # Check if this val is significantly different from existing distinct_vals
            matched = False
            for dv in distinct_vals:
                if isinstance(val, (int, float)) and isinstance(dv, (int, float)):
                    # Within 0.5% tolerance is considered consistent
                    if abs(val - dv) <= max(0.005 * max(abs(val), abs(dv)), 0.1):
                        matched = True
                        break
                elif str(val).strip().lower() == str(dv).strip().lower():
                    matched = True
                    break
            if not matched:
                distinct_vals.append(val)

        if len(distinct_vals) > 1:
            conflicts.append({
                "attribute": attr,
                "conflict_type": (
                    "NUMERIC_CONFLICT"
                    if all(isinstance(v, (int, float)) for v in distinct_vals)
                    else "TEXTUAL_CONFLICT"
                ),
                "conflict_description": (
                    f"Conflicting evidentiary values detected for attribute '{attr}': {distinct_vals}. "
                    "Independent documents present contradictory findings."
                ),
                "distinct_values": distinct_vals,
                "competing_evidences": [
                    {
                        "evidence_id": ev.evidence_id,
                        "document_id": ev.document_id,
                        "authority": ev.source_authority or ev.authority,
                        "raw_value": ev.raw_value,
                        "normalized_value": ev.normalized_value,
                        "normalized_unit": ev.normalized_unit,
                        "page": ev.page_number or ev.page,
                    }
                    for ev in ev_list
                ],
                "recommended_action": "EXPERT_REVIEW",
            })

    return conflicts
