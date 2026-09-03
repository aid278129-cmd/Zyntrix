import uuid
from typing import List, Dict, Any, Optional, Tuple
from backend.app.services.gap_analysis.evidence_extractor import StructuredEvidence
from backend.app.models.requirement_evidence_link import RequirementEvidenceLink


# Clause to attribute mapping
CLAUSE_ATTRIBUTE_MAPPING: Dict[str, List[str]] = {
    "4.2.1": ["material_grade_verified", "materials"],
    "REQ-MAT-304": ["material_grade_verified", "materials"],
    "5.2": ["leakage_test_result"],
    "REQ-PERF-LEAK": ["leakage_test_result"],
    "5.4": ["tested_heat_retention_temp"],
    "REQ-PERF-THERM": ["tested_heat_retention_temp"],
    "7.1": ["artwork_label_verified"],
    "REQ-MARK-ISI": ["artwork_label_verified"],
}


def match_evidence_to_requirements(
    requirements_catalog: List[Dict[str, Any]],
    evidences: List[StructuredEvidence],
    assessment_id: Optional[str] = None,
) -> Tuple[
    Dict[str, List[StructuredEvidence]],
    List[RequirementEvidenceLink],
    Dict[str, Tuple[str, str]], # req_id -> (rule_result, rule_explanation)
]:
    """Deterministically match evidence items to standard requirements and evaluate conditions.
    
    Produces auditable RequirementEvidenceLink records.
    Answers: 'Why was this requirement evaluated with this verdict?'
    """
    req_evidence_map: Dict[str, List[StructuredEvidence]] = {}
    links: List[RequirementEvidenceLink] = []
    rule_results: Dict[str, Tuple[str, str]] = {}

    for req in requirements_catalog:
        req_id = req.get("id") or req.get("code") or "UNKNOWN"
        req_code = req.get("code", "")
        clause_num = req.get("clause_number", "")
        req_type = req.get("requirement_type", "")
        desc = req.get("description", "").lower()
        cond = req.get("measurable_condition", "")
        cond_lower = (cond or "").lower()

        # Find candidate attributes for this requirement
        target_attrs = set(CLAUSE_ATTRIBUTE_MAPPING.get(req_code, []) + CLAUSE_ATTRIBUTE_MAPPING.get(clause_num, []))
        if not target_attrs:
            if req_type == "MATERIAL":
                target_attrs.add("material_grade_verified")
            elif "leak" in desc or "inverted" in cond_lower:
                target_attrs.add("leakage_test_result")
            elif "thermal" in desc or "60" in cond_lower:
                target_attrs.add("tested_heat_retention_temp")
            elif "mark" in desc or "isi" in cond_lower:
                target_attrs.add("artwork_label_verified")

        # Match evidences
        matched_evs: List[StructuredEvidence] = []
        for ev in evidences:
            if ev.attribute in target_attrs:
                matched_evs.append(ev)
            elif clause_num and (f"clause {clause_num}" in ev.source_text.lower() or f"{clause_num}" in ev.source_text):
                matched_evs.append(ev)

        req_evidence_map[req_id] = matched_evs

        # Evaluate rule result if evidence exists
        if not matched_evs:
            rule_results[req_id] = ("INCONCLUSIVE", f"No documentary or test evidence provided for '{req_code}'.")
            continue

        # Evaluate specific deterministic rules
        rule_res = "PASS"
        rule_exp = ""

        # 1. Stainless steel raw material rule: Grade 304 or 316
        if req_code == "REQ-MAT-304" or req_type == "MATERIAL":
            has_304 = any(
                "304" in str(ev.normalized_value) or "316" in str(ev.normalized_value)
                for ev in matched_evs
            )
            if has_304:
                top_ev = matched_evs[0]
                rule_res = "PASS"
                rule_exp = (
                    f"Mill Test Certificate [{top_ev.evidence_id}] verifies Grade 304/316 austenitic stainless steel "
                    f"chemical composition (IS 6911)."
                )
            else:
                rule_res = "FAIL"
                rule_exp = f"Material certificate does not establish Grade 304 food-contact requirement."

        # 2. Inversion Leakage Test rule: zero leakage
        elif req_code == "REQ-PERF-LEAK" or "leak" in desc:
            all_passed = all(ev.normalized_value == 1.0 for ev in matched_evs)
            if all_passed:
                top_ev = matched_evs[0]
                rule_res = "PASS"
                page_str = f" (Page {top_ev.page_number})" if top_ev.page_number else ""
                rule_exp = (
                    f"Laboratory Test Report [{top_ev.evidence_id}]{page_str} from {top_ev.source_authority} "
                    f"confirms zero leakage, weeping, or seepage after 10-minute inversion test (Clause 5.2)."
                )
            else:
                rule_res = "FAIL"
                rule_exp = "Laboratory test report indicates moisture leakage or failed inversion test."

        # 3. Thermal Performance Test rule: >= 60 deg C after 6 hours
        elif req_code == "REQ-PERF-THERM" or "thermal" in desc:
            temps = [ev.normalized_value for ev in matched_evs if isinstance(ev.normalized_value, (int, float))]
            if temps and min(temps) >= 60.0:
                top_ev = matched_evs[0]
                page_str = f" (Page {top_ev.page_number})" if top_ev.page_number else ""
                rule_res = "PASS"
                rule_exp = (
                    f"Physical test [{top_ev.evidence_id}]{page_str} confirms water temperature of {min(temps)}°C "
                    f"after 6 hours (meets >= 60°C threshold under Clause 5.4)."
                )
            elif temps:
                rule_res = "FAIL"
                rule_exp = (
                    f"Physical test shows water temperature of {min(temps)}°C after 6 hours, which is BELOW the "
                    f"mandatory 60°C threshold under Clause 5.4."
                )
            else:
                rule_res = "INCONCLUSIVE"
                rule_exp = "No measurable water temperature value extracted."

        # 4. Marking artwork rule
        elif req_code == "REQ-MARK-ISI" or req_type == "MARKING":
            if any(ev.normalized_value == 1.0 for ev in matched_evs):
                top_ev = matched_evs[0]
                rule_res = "PASS"
                rule_exp = f"Packaging label artwork [{top_ev.evidence_id}] includes verified ISI Standard Mark layout and capacity."
            else:
                rule_res = "FAIL"
                rule_exp = "Submitted packaging artwork lacks mandatory ISI Standard Mark details."

        rule_results[req_id] = (rule_res, rule_exp)

        # Create RequirementEvidenceLink records
        for ev in matched_evs:
            link = RequirementEvidenceLink(
                id=f"LNK-{uuid.uuid4().hex[:8].upper()}",
                assessment_id=assessment_id,
                requirement_id=req_id,
                evidence_id=ev.evidence_id,
                linkage_type="DIRECT_SUPPORT" if rule_res == "PASS" else "CONTRADICTION",
                relevance="PRIMARY",
                linkage_confidence=ev.extraction_confidence,
                supporting_excerpt=ev.source_excerpt or ev.source_text,
                evaluation_rule=cond or desc,
                rule_result=rule_res,
                metadata_json={
                    "evidence_type": ev.evidence_type,
                    "source_authority": ev.source_authority,
                    "page_number": ev.page_number,
                    "attribute": ev.attribute,
                    "normalized_value": ev.normalized_value,
                },
            )
            links.append(link)

    return req_evidence_map, links, rule_results
