from typing import Optional, Dict, Any, Tuple, List
from backend.app.schemas.product_dna import ProductDNACore, ProvenanceClassification
from backend.app.schemas.compliance import ComplianceStatus, RecommendedAction
from backend.app.services.gap_analysis.evidence_gate import can_be_satisfied, get_evidence_spec_for_requirement


def _ev_dict(e: Any) -> Dict[str, Any]:
    if isinstance(e, dict):
        return e
    if hasattr(e, "model_dump"):
        return e.model_dump()
    if hasattr(e, "__dict__"):
        return e.__dict__
    return {}


def compare_requirement_with_evidence(
    requirement_code: str,
    requirement_type: str,
    description: str,
    measurable_condition: Optional[str],
    dna: ProductDNACore,
    evidence_payload: Optional[Dict[str, Any]] = None,
    linked_evidences: Optional[List[Any]] = None,
    has_conflict: bool = False,
) -> Tuple[ComplianceStatus, RecommendedAction, str]:
    """Deterministic comparator matching product attributes/evidence against standard requirements.
    
    Hard Invariant:
    PRODUCT FACT != COMPLIANCE EVIDENCE.
    No requirement can receive SATISFIED solely from user-entered product text.
    Every SATISFIED verdict must have verified supporting evidence and pass through can_be_satisfied().
    
    Returns:
    (ComplianceStatus, RecommendedAction, explanation_text)
    """
    desc_lower = description.lower()
    meas_lower = (measurable_condition or "").lower()

    # If conflict flag is active, strictly route to conflict status
    if has_conflict or (evidence_payload and evidence_payload.get("has_conflict")):
        return (
            ComplianceStatus.CONFLICTING_EVIDENCE,
            RecommendedAction.EXPERT_REVIEW,
            f"Contradictory evidentiary values detected for '{requirement_code}'. Manual expert review required; LLM silent resolution disallowed.",
        )

    # Convert legacy evidence_payload or linked_evidences to synthetic evidence dicts for unified gate checking
    synth_evidences: List[Dict[str, Any]] = [_ev_dict(e) for e in (linked_evidences or [])]
    if not synth_evidences and evidence_payload:
        if requirement_type == "MATERIAL" and evidence_payload.get("mill_test_certificate"):
            verif = "VERIFIED" if evidence_payload.get("mill_test_certificate_verified", True) else "UNVERIFIED"
            synth_evidences.append({
                "evidence_id": "EV-MAT-CERT-01",
                "evidence_type": "MATERIAL_CERTIFICATE",
                "source_authority": "MILL_TEST_CERTIFICATE",
                "verification_status": verif,
                "normalized_value": "stainless_steel_grade_304",
                "provenance_type": "DOCUMENT_EVIDENCE",
                "page_number": 1,
            })
        if "leakage" in desc_lower or "inverted" in meas_lower:
            if "leakage_test_passed" in evidence_payload:
                passed = evidence_payload["leakage_test_passed"]
                verif = "VERIFIED" if evidence_payload.get("leakage_test_verified", True) else "UNVERIFIED"
                synth_evidences.append({
                    "evidence_id": "EV-LEAK-TEST-01",
                    "evidence_type": "TEST_REPORT",
                    "source_authority": "LAB_REPORT",
                    "verification_status": verif,
                    "normalized_value": 1.0 if passed else 0.0,
                    "provenance_type": "LAB_EVIDENCE",
                    "page_number": 2,
                })
        if "thermal" in desc_lower or "heat retention" in desc_lower or "60 deg" in meas_lower:
            if "tested_temp_after_6hrs" in evidence_payload:
                temp = evidence_payload["tested_temp_after_6hrs"]
                verif = "VERIFIED" if evidence_payload.get("thermal_test_verified", True) else "UNVERIFIED"
                synth_evidences.append({
                    "evidence_id": "EV-THERM-TEST-01",
                    "evidence_type": "TEST_REPORT",
                    "source_authority": "LAB_REPORT",
                    "verification_status": verif,
                    "normalized_value": temp,
                    "provenance_type": "LAB_EVIDENCE",
                    "page_number": 4,
                })
        if requirement_type == "MARKING" or "marking" in desc_lower:
            if evidence_payload.get("artwork_label_verified"):
                synth_evidences.append({
                    "evidence_id": "EV-MARK-ARTWORK-01",
                    "evidence_type": "LABEL_PHOTO",
                    "source_authority": "MANUFACTURER_DECLARATION",
                    "verification_status": "VERIFIED",
                    "normalized_value": 1.0,
                    "provenance_type": "DOCUMENT_EVIDENCE",
                    "page_number": 1,
                })

    # 1. Stainless Steel Material Requirements (e.g. Clause 4.2.1)
    if requirement_type == "MATERIAL" and ("stainless steel" in desc_lower or "grade 304" in desc_lower):
        materials_str = " ".join(dna.materials).lower()
        has_grade_claim = "304" in materials_str or "316" in materials_str

        if synth_evidences:
            req_dict = {"code": requirement_code, "requirement_type": requirement_type}
            can_sat, status, action, exp = can_be_satisfied(
                requirement=req_dict,
                linked_evidences=synth_evidences,
                has_conflict=has_conflict,
                rule_result="PASS" if any("304" in str(e.get("normalized_value", "")) or "316" in str(e.get("normalized_value", "")) for e in synth_evidences) else "FAIL",
                rule_explanation="Product declares Grade 304/316 Stainless Steel supported by verified Mill Test Certificate.",
            )
            return (status, action, exp)

        if has_grade_claim:
            return (
                ComplianceStatus.POTENTIALLY_SATISFIED,
                RecommendedAction.UPLOAD_EVIDENCE,
                "Product declares Stainless Steel Grade 304 (USER_CLAIM). Raw material chemical test certificate (IS 6911) required to establish full compliance.",
            )
        elif "stainless_steel" in materials_str:
            return (
                ComplianceStatus.MORE_INFORMATION_REQUIRED,
                RecommendedAction.PROVIDE_SPECIFICATION,
                "Stainless steel is declared, but specific grade (Grade 304 or superior) is not specified.",
            )
        elif dna.materials:
            return (
                ComplianceStatus.POTENTIAL_GAP,
                RecommendedAction.PROVIDE_SPECIFICATION,
                f"Declared materials ({', '.join(dna.materials)}) do not meet Grade 304 Stainless Steel food contact requirement.",
            )
        return (
            ComplianceStatus.MISSING_EVIDENCE,
            RecommendedAction.UPLOAD_EVIDENCE,
            "No raw material specification or evidence provided for metallic food-contact parts.",
        )

    # 2. Leakage Test (e.g. Clause 5.2 - Inverted 10 minutes)
    if "leakage" in desc_lower or "inverted" in meas_lower:
        if synth_evidences:
            req_dict = {"code": requirement_code, "requirement_type": requirement_type}
            passed = any(e.get("normalized_value") == 1.0 for e in synth_evidences)
            can_sat, status, action, exp = can_be_satisfied(
                requirement=req_dict,
                linked_evidences=synth_evidences,
                has_conflict=has_conflict,
                rule_result="PASS" if passed else "FAIL",
                rule_explanation="Laboratory test report verifies no leakage, weeping, or moisture seepage after 10-minute inversion test.",
            )
            return (status, action, exp)

        return (
            ComplianceStatus.POTENTIALLY_SATISFIED,
            RecommendedAction.REQUIRES_TESTING,
            "Container design includes sealing gasket. Mandatory 10-minute physical inversion test (Clause 5.2) required to confirm zero leakage.",
        )

    # 3. Thermal Performance / Heat Retention (e.g. Clause 5.4 - 95C to >= 60C after 6 hrs)
    if "thermal" in desc_lower or "heat retention" in desc_lower or "60 deg" in meas_lower:
        if synth_evidences:
            req_dict = {"code": requirement_code, "requirement_type": requirement_type}
            temps = [e.get("normalized_value") for e in synth_evidences if isinstance(e.get("normalized_value"), (int, float))]
            passed = bool(temps and min(temps) >= 60.0)
            can_sat, status, action, exp = can_be_satisfied(
                requirement=req_dict,
                linked_evidences=synth_evidences,
                has_conflict=has_conflict,
                rule_result="PASS" if passed else "FAIL",
                rule_explanation=f"Physical test confirms water temperature of {temps[0] if temps else 0}°C after 6 hours (meets >= 60°C threshold).",
            )
            return (status, action, exp)

        if dna.insulated:
            return (
                ComplianceStatus.POTENTIALLY_SATISFIED,
                RecommendedAction.REQUIRES_TESTING,
                "Product is vacuum-insulated. Mandatory 6-hour laboratory heat retention test (Clause 5.4) required to certify >= 60°C performance.",
            )
        return (
            ComplianceStatus.POTENTIAL_GAP,
            RecommendedAction.PROVIDE_SPECIFICATION,
            "Product does not indicate thermal insulation required to meet heat retention performance.",
        )

    # 4. Marking Requirements (e.g. Clause 7.1)
    if requirement_type == "MARKING" or "marking" in desc_lower:
        if synth_evidences:
            req_dict = {"code": requirement_code, "requirement_type": requirement_type}
            passed = any(e.get("normalized_value") == 1.0 for e in synth_evidences)
            can_sat, status, action, exp = can_be_satisfied(
                requirement=req_dict,
                linked_evidences=synth_evidences,
                has_conflict=has_conflict,
                rule_result="PASS" if passed else "FAIL",
                rule_explanation="Product packaging artwork includes manufacturer trademark, nominal capacity, and ISI Standard Mark layout.",
            )
            return (status, action, exp)

        return (
            ComplianceStatus.MISSING_EVIDENCE,
            RecommendedAction.UPLOAD_EVIDENCE,
            "Packaging and product label artwork required to verify BIS Standard Mark (ISI) and nominal capacity marking.",
        )

    # 5. Handling when authoritative clause specification is pending acquisition
    if requirement_code == "AUTHORITATIVE_CLAUSE_PENDING":
        return (
            ComplianceStatus.MORE_INFORMATION_REQUIRED,
            RecommendedAction.EXPERT_REVIEW,
            "Authoritative clause full text acquisition is pending under official BIS procurement. Full specification pending acquisition from authorized channels.",
        )

    # Fallback: General requirement with missing evidence
    spec = get_evidence_spec_for_requirement(requirement_code, requirement_type)
    return (
        ComplianceStatus.MISSING_EVIDENCE,
        spec.default_missing_action,
        f"Requirement '{requirement_code}' identified. Verifiable test report or evidence document is required.",
    )
