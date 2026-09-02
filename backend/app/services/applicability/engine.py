import os
import json
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from backend.app.schemas.product_dna import ProductDNACore
from backend.app.services.applicability.evaluator import evaluate_condition


class RuleSourceReference(BaseModel):
    source_type: str
    publisher: str
    url: Optional[str] = None


class DeclarativeRule(BaseModel):
    rule_id: str
    name: str
    description: str
    priority: int = 10
    verification_status: str = "VERIFIED"  # VERIFIED | REQUIRES_EXPERT_REVIEW | DEVELOPMENT_ONLY
    conditions: Dict[str, Any]
    result: Dict[str, Any]
    sources: List[RuleSourceReference] = Field(default_factory=list)


class ApplicabilityDecision(BaseModel):
    """Structured applicability output separating technical relevance from regulatory mandate."""
    standard_number: str
    standard_title: str
    technical_relevance: str  # LIKELY_APPLICABLE | POSSIBLY_APPLICABLE | MORE_INFORMATION_REQUIRED | NOT_APPLICABLE
    regulatory_status: str    # VERIFIED_MANDATORY_QCO | MANDATORY_CRS | VOLUNTARY | MORE_INFORMATION_REQUIRED
    matched_rule_id: str
    rule_verification_status: str
    scheme: str
    mandatory_reason: Optional[str] = None
    explanation: str
    sources: List[RuleSourceReference] = Field(default_factory=list)
    llm_decision: bool = False  # Always False for deterministic engine


RULES_DIR = os.path.join(os.path.dirname(__file__), "rules")


def load_declarative_rules() -> List[DeclarativeRule]:
    """Load all declarative JSON rules from rules directory."""
    rules = []
    if not os.path.exists(RULES_DIR):
        return rules

    for fname in os.listdir(RULES_DIR):
        if fname.endswith(".json"):
            fpath = os.path.join(RULES_DIR, fname)
            with open(fpath, "r", encoding="utf-8") as f:
                data = json.load(f)
                rules.append(DeclarativeRule(**data))

    rules.sort(key=lambda r: r.priority, reverse=True)
    return rules


def determine_applicability(
    dna: ProductDNACore,
    authoritative_only: bool = True,
) -> List[ApplicabilityDecision]:
    """Determine Indian Standards applicability using verified declarative rules.
    
    Rule Engine Safety:
    In authoritative mode, rules marked with verification_status != 'VERIFIED'
    cannot produce authoritative compliance decisions.
    """
    rules = load_declarative_rules()
    decisions: List[ApplicabilityDecision] = []

    for rule in rules:
        # Rule safety check
        if authoritative_only and rule.verification_status != "VERIFIED":
            continue

        is_match = evaluate_condition(rule.conditions, dna)
        if is_match:
            res = rule.result
            tech_rel = res.get("technical_relevance", "LIKELY_APPLICABLE")
            reg_stat = res.get("regulatory_status", "VERIFIED_MANDATORY_QCO")

            # Formulate structured explanation
            explanation = (
                f"Deterministic rule {rule.rule_id} evaluated TRUE for product category '{dna.category}' "
                f"matching criteria in {res.get('standard_number')}. "
                f"Mandatory statutory status: {res.get('mandatory_reason', 'Regulated standard')}."
            )

            decisions.append(
                ApplicabilityDecision(
                    standard_number=res.get("standard_number", "IS UNKNOWN"),
                    standard_title=res.get("standard_title", ""),
                    technical_relevance=tech_rel,
                    regulatory_status=reg_stat,
                    matched_rule_id=rule.rule_id,
                    rule_verification_status=rule.verification_status,
                    scheme=res.get("scheme", "Scheme I"),
                    mandatory_reason=res.get("mandatory_reason"),
                    explanation=explanation,
                    sources=rule.sources,
                    llm_decision=False,
                )
            )

    return decisions
