import re
from typing import Optional, Dict, Any, List, Tuple
from pydantic import BaseModel, Field


class StructuredEvidence(BaseModel):
    """Normalized structured evidence representation extracted from test reports, datasheets, or specs."""
    evidence_id: str
    evidence_type: str  # TEST_REPORT | DATASHEET | CERTIFICATE | BOM | USER_ASSERTED | OFFICIAL_SOURCE
    document_id: Optional[str] = None
    page: Optional[int] = None
    section: Optional[str] = None
    source_text: str
    attribute: str
    raw_value: str
    normalized_value: Any
    unit: Optional[str] = None
    extraction_method: str = "STRUCTURED_PARSE"  # STRUCTURED_PARSE | OCR_TABLE | REGEX
    confidence: float = Field(default=1.0, ge=0.0, le=1.0)
    authority: str = "MANUFACTURER_DOCUMENT"  # LAB_REPORT | CERTIFICATE | OFFICIAL_SOURCE | USER_ASSERTED
    verification_status: str = "REQUIRES_REVIEW"


class StructuredTable(BaseModel):
    """Extracted technical table matrix."""
    table_id: str
    page: int
    headers: List[str]
    rows: List[List[str]]
    confidence: float = 1.0
    extraction_method: str = "LAYOUT_PARSER"  # LAYOUT_PARSER | OCR_RECONSTRUCTION


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
) -> List[StructuredEvidence]:
    """Extract structured evidence parameters from document snippet or lab test report text."""
    from backend.app.services.security.prompt_guard import scan_and_sanitize_untrusted_text

    # Treat all evidence snippets as UNTRUSTED DATA and sanitize prompt injections
    scan_res = scan_and_sanitize_untrusted_text(snippet)
    clean_snippet = scan_res.sanitized_text

    evidences: List[StructuredEvidence] = []
    text_lower = clean_snippet.lower()

    # 1. Temperature / Heat retention parameter
    temp_search = re.search(r"(?:temperature|heat retention|thermal performance)[^\d\n]*([\d\.]+\s*(?:°\s*c|deg\s*c|c\b))", snippet, re.I)
    if temp_search:
        raw_v = temp_search.group(1)
        norm_v, unit = normalize_evidence_units(raw_v)
        evidences.append(
            StructuredEvidence(
                evidence_id=f"EV-TEMP-{page or 1}",
                evidence_type=evidence_type,
                document_id=document_id,
                page=page,
                source_text=snippet[:250],
                attribute="tested_heat_retention_temp",
                raw_value=raw_v,
                normalized_value=norm_v,
                unit=unit,
                confidence=0.98,
                authority=authority,
                verification_status="VERIFIED" if authority == "LAB_REPORT" else "REQUIRES_REVIEW",
            )
        )

    # 2. Inversion / Leakage parameter
    if any(k in text_lower for k in ["leakage", "inverted", "seepage"]):
        passed = "no leakage" in text_lower or "nil" in text_lower or "passed" in text_lower or "zero leakage" in text_lower
        evidences.append(
            StructuredEvidence(
                evidence_id=f"EV-LEAK-{page or 1}",
                evidence_type=evidence_type,
                document_id=document_id,
                page=page,
                source_text=snippet[:250],
                attribute="leakage_test_result",
                raw_value="PASSED" if passed else "FAILED",
                normalized_value=passed,
                unit=None,
                confidence=0.95,
                authority=authority,
                verification_status="VERIFIED" if authority == "LAB_REPORT" else "REQUIRES_REVIEW",
            )
        )

    # 3. Material Certificate parameter (e.g. Grade 304 chemical composition)
    if "grade 304" in text_lower or "ss 304" in text_lower:
        evidences.append(
            StructuredEvidence(
                evidence_id=f"EV-MAT-{page or 1}",
                evidence_type="CERTIFICATE" if "cert" in text_lower else evidence_type,
                document_id=document_id,
                page=page,
                source_text=snippet[:250],
                attribute="material_grade_verified",
                raw_value="Grade 304",
                normalized_value="stainless_steel_grade_304",
                unit=None,
                confidence=0.96,
                authority=authority,
                verification_status="VERIFIED" if "mill" in text_lower or "cert" in text_lower else "REQUIRES_REVIEW",
            )
        )

    return evidences


def detect_evidence_conflicts(evidences: List[StructuredEvidence]) -> List[Dict[str, Any]]:
    """Detect evidentiary contradictions across documents (e.g. Datasheet claims 60C but Lab Report reports 55C)."""
    conflicts = []
    attr_grouped: Dict[str, List[StructuredEvidence]] = {}
    for ev in evidences:
        attr_grouped.setdefault(ev.attribute, []).append(ev)

    for attr, ev_list in attr_grouped.items():
        if len(ev_list) > 1:
            values = {ev.normalized_value for ev in ev_list}
            if len(values) > 1:
                conflicts.append({
                    "attribute": attr,
                    "conflict_description": f"Conflicting evidentiary values detected for attribute '{attr}': {list(values)}",
                    "competing_evidences": [
                        {
                            "evidence_id": ev.evidence_id,
                            "authority": ev.authority,
                            "value": ev.normalized_value,
                            "source_doc": ev.document_id,
                            "page": ev.page,
                        }
                        for ev in ev_list
                    ],
                    "recommended_action": "EXPERT_REVIEW",
                })
    return conflicts
