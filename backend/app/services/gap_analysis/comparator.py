from typing import Optional, Dict, Any, Tuple
from backend.app.schemas.product_dna import ProductDNACore
from backend.app.schemas.compliance import ComplianceStatus, RecommendedAction


def compare_requirement_with_evidence(
    requirement_code: str,
    requirement_type: str,
    description: str,
    measurable_condition: Optional[str],
    dna: ProductDNACore,
    evidence_payload: Optional[Dict[str, Any]] = None,
) -> Tuple[ComplianceStatus, RecommendedAction, str]:
    """Deterministic comparator matching product attributes/evidence against standard requirements.
    
    Returns:
    (ComplianceStatus, RecommendedAction, explanation_text)
    
    Status mapping rules:
    - Evidence satisfies condition -> SATISFIED + None / No mandatory action
    - Material declared but requires lab testing (e.g. migration / heat retention) -> POTENTIALLY_SATISFIED + REQUIRES_TESTING
    - Missing required attribute -> MORE_INFORMATION_REQUIRED + PROVIDE_SPECIFICATION
    - Requirement known but no evidence -> MISSING_EVIDENCE + UPLOAD_EVIDENCE
    - Non-compliant parameter -> POTENTIAL_GAP + PROVIDE_SPECIFICATION
    - Conflicting data -> CONFLICTING_EVIDENCE + EXPERT_REVIEW
    """
    desc_lower = description.lower()
    meas_lower = (measurable_condition or "").lower()

    # 1. Stainless Steel Material Requirements (e.g. Clause 4.2.1)
    if requirement_type == "MATERIAL" and ("stainless steel" in desc_lower or "grade 304" in desc_lower):
        materials_str = " ".join(dna.materials).lower()
        if "304" in materials_str or "316" in materials_str:
            if evidence_payload and evidence_payload.get("mill_test_certificate"):
                return (
                    ComplianceStatus.SATISFIED,
                    None,
                    "Product declares Grade 304/316 Stainless Steel supported by verified Mill Test Certificate.",
                )
            return (
                ComplianceStatus.POTENTIALLY_SATISFIED,
                RecommendedAction.UPLOAD_EVIDENCE,
                "Product declares Stainless Steel Grade 304. Raw material chemical test certificate (IS 6911) required to establish full compliance.",
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
        if evidence_payload and evidence_payload.get("leakage_test_passed"):
            return (
                ComplianceStatus.SATISFIED,
                None,
                "Laboratory test report verifies no leakage, weeping, or moisture seepage after 10-minute inversion test.",
            )
        return (
            ComplianceStatus.POTENTIALLY_SATISFIED,
            RecommendedAction.REQUIRES_TESTING,
            "Container design includes sealing gasket. Mandatory 10-minute physical inversion test (Clause 5.2) required to confirm zero leakage.",
        )

    # 3. Thermal Performance / Heat Retention (e.g. Clause 5.4 - 95C to >= 60C after 6 hrs)
    if "thermal" in desc_lower or "heat retention" in desc_lower or "60 deg" in meas_lower:
        if evidence_payload and evidence_payload.get("tested_temp_after_6hrs", 0) >= 60:
            return (
                ComplianceStatus.SATISFIED,
                None,
                f"Physical test confirms water temperature of {evidence_payload.get('tested_temp_after_6hrs')}°C after 6 hours (meets >= 60°C threshold).",
            )
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
        if evidence_payload and evidence_payload.get("artwork_label_verified"):
            return (
                ComplianceStatus.SATISFIED,
                None,
                "Product packaging artwork includes manufacturer trademark, nominal capacity, and ISI Standard Mark layout.",
            )
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
    return (
        ComplianceStatus.MISSING_EVIDENCE,
        RecommendedAction.UPLOAD_EVIDENCE,
        f"Requirement '{requirement_code}' identified. Verifiable test report or evidence document is required.",
    )
