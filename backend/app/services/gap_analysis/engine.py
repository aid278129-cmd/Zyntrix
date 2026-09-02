from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from backend.app.schemas.product_dna import ProductDNACore
from backend.app.schemas.compliance import ComplianceStatus, RecommendedAction
from backend.app.services.gap_analysis.comparator import compare_requirement_with_evidence


class ClauseRequirementEvaluation(BaseModel):
    requirement_id: str
    clause_number: str
    clause_title: str
    requirement_code: str
    requirement_type: str
    description: str
    measurable_condition: Optional[str] = None
    status: ComplianceStatus
    recommended_action: Optional[RecommendedAction] = None
    explanation: str
    evidence_ids: List[str] = Field(default_factory=list)
    decision_engine: str = "DETERMINISTIC_RULE_ENGINE"
    llm_decision: bool = False


class StandardComplianceEvaluation(BaseModel):
    standard_number: str
    standard_title: str
    overall_status: ComplianceStatus
    total_requirements: int
    satisfied_count: int
    potentially_satisfied_count: int
    missing_evidence_count: int
    gaps_count: int
    evaluations: List[ClauseRequirementEvaluation]


def evaluate_compliance_gaps(
    standard_number: str,
    standard_title: str,
    requirements_catalog: List[Dict[str, Any]],
    dna: ProductDNACore,
    evidence_payload: Optional[Dict[str, Any]] = None,
) -> StandardComplianceEvaluation:
    """Evaluate all requirements for an applicable standard against Product DNA and evidence.
    
    Deterministic evaluation:
    - Never calls LLM for compliance authority (llm_decision is always False).
    - Returns structured verdicts and operational recommended actions.
    """
    evaluations: List[ClauseRequirementEvaluation] = []
    satisfied_cnt = 0
    pot_sat_cnt = 0
    missing_cnt = 0
    gap_cnt = 0

    for req in requirements_catalog:
        req_id = req.get("id", f"REQ-{req.get('clause_number')}")
        clause_num = req.get("clause_number", "")
        clause_title = req.get("clause_title", "")
        req_code = req.get("code", f"REQ-{clause_num}")
        req_type = req.get("requirement_type", "PERFORMANCE")
        description = req.get("description", "")
        condition = req.get("measurable_condition")

        status, action, explanation = compare_requirement_with_evidence(
            requirement_code=req_code,
            requirement_type=req_type,
            description=description,
            measurable_condition=condition,
            dna=dna,
            evidence_payload=evidence_payload,
        )

        if status == ComplianceStatus.SATISFIED:
            satisfied_cnt += 1
        elif status == ComplianceStatus.POTENTIALLY_SATISFIED:
            pot_sat_cnt += 1
        elif status in (ComplianceStatus.MISSING_EVIDENCE, ComplianceStatus.MORE_INFORMATION_REQUIRED):
            missing_cnt += 1
        elif status in (ComplianceStatus.POTENTIAL_GAP, ComplianceStatus.CONFLICTING_EVIDENCE):
            gap_cnt += 1

        evaluations.append(
            ClauseRequirementEvaluation(
                requirement_id=req_id,
                clause_number=clause_num,
                clause_title=clause_title,
                requirement_code=req_code,
                requirement_type=req_type,
                description=description,
                measurable_condition=condition,
                status=status,
                recommended_action=action,
                explanation=explanation,
                decision_engine="DETERMINISTIC_RULE_ENGINE",
                llm_decision=False,
            )
        )

    # Compute overall status
    if gap_cnt > 0:
        overall = ComplianceStatus.POTENTIAL_GAP
    elif missing_cnt > 0:
        overall = ComplianceStatus.MISSING_EVIDENCE
    elif pot_sat_cnt > 0:
        overall = ComplianceStatus.POTENTIALLY_SATISFIED
    elif satisfied_cnt == len(requirements_catalog) and satisfied_cnt > 0:
        overall = ComplianceStatus.SATISFIED
    else:
        overall = ComplianceStatus.MORE_INFORMATION_REQUIRED

    return StandardComplianceEvaluation(
        standard_number=standard_number,
        standard_title=standard_title,
        overall_status=overall,
        total_requirements=len(evaluations),
        satisfied_count=satisfied_cnt,
        potentially_satisfied_count=pot_sat_cnt,
        missing_evidence_count=missing_cnt,
        gaps_count=gap_cnt,
        evaluations=evaluations,
    )
