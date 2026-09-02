"""Rule Coverage Registry and Candidate Standard Generator for Indian Standards.

Architecture:
Product DNA
   ↓
Category Taxonomy
   ↓
Rule Coverage Registry
   ↓
Candidate Generation (with explicit match features)
   ↓
Verified Source Filter
   ↓
Deterministic Candidate Explanation
   ↓
Coverage Gap vs Not Applicable Separation
"""
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

from backend.app.schemas.product_dna import ProductDNACore
from backend.app.services.applicability.taxonomy import (
    get_taxonomy_category,
    get_required_attribute_profile,
    AttributeState,
    ProductCategoryDefinition,
    RequiredAttributeProfile,
)


class StandardCandidate(BaseModel):
    """Structured candidate standard output with full deterministic provenance and explanation."""
    standard_number: str
    standard_title: str
    status: str  # LIKELY_APPLICABLE | MORE_INFORMATION_REQUIRED | COVERAGE_GAP | NOT_APPLICABLE
    regulatory_status: str  # VERIFIED_MANDATORY_QCO | MANDATORY_CRS | VOLUNTARY | COVERAGE_NOT_ESTABLISHED
    generated_by_rule: str
    source_status: str  # VERIFIED_OFFICIAL | SYNTHETIC_FIXTURE | UNVERIFIED
    contributing_attributes: Dict[str, Any]
    missing_blocking_attributes: List[str] = Field(default_factory=list)
    confidence: float = 1.0
    explanation: str
    is_coverage_gap: bool = False
    llm_decision: bool = False


class CandidateGenerationResult(BaseModel):
    product_category: str
    taxonomy_id: Optional[str] = None
    coverage_state: str  # COVERED | CATALOG_NOT_COVERED
    candidates: List[StandardCandidate] = Field(default_factory=list)
    has_coverage_gap: bool = False
    explanation: str


def generate_candidate_standards(dna: ProductDNACore) -> CandidateGenerationResult:
    """Generate and rank candidate Indian Standards deterministically.
    
    Strict Safety Rules:
    1. If the product category is outside codified coverage, explicitly returns COVERAGE_GAP / CATALOG_NOT_COVERED
       rather than asserting that no standards exist in India.
    2. If a blocking attribute is missing, flags MORE_INFORMATION_REQUIRED with explicit missing fields.
    3. LLM decision authority is strictly 0.0.
    """
    tax = get_taxonomy_category(dna.category) or get_taxonomy_category(dna.product_name)
    candidates: List[StandardCandidate] = []

    attr_dict = {a.name: a.value for a in dna.attributes}

    # Case 1: Category not covered in current verified rule registry
    if not tax or tax.coverage_state == "CATALOG_NOT_COVERED":
        return CandidateGenerationResult(
            product_category=dna.category,
            taxonomy_id=tax.canonical_category_id if tax else None,
            coverage_state="CATALOG_NOT_COVERED",
            candidates=[
                StandardCandidate(
                    standard_number="CATALOG_COVERAGE_GAP",
                    standard_title=f"Uncataloged Category: {dna.category}",
                    status="COVERAGE_GAP",
                    regulatory_status="COVERAGE_NOT_ESTABLISHED",
                    generated_by_rule="RULE_REGISTRY_BOUNDARY",
                    source_status="UNVERIFIED",
                    contributing_attributes=attr_dict,
                    missing_blocking_attributes=[],
                    confidence=0.0,
                    explanation=(
                        f"The Zyntrix verified rule base currently has no codified Indian Standard rules "
                        f"for '{dna.category}'. This indicates a knowledge coverage boundary, NOT that the product "
                        f"is exempt from BIS regulation in India."
                    ),
                    is_coverage_gap=True,
                    llm_decision=False,
                )
            ],
            has_coverage_gap=True,
            explanation=f"Category '{dna.category}' is outside the current demonstration rule coverage.",
        )

    # Case 2: Drinkware & Food Contact Containers
    if tax.canonical_category_id == "CAT-DRINKWARE":
        profile = get_required_attribute_profile("IS 17526:2021")
        missing_blockers: List[str] = []

        # Check blocking attributes
        materials_str = " ".join(dna.materials).lower()
        has_metal = "stainless_steel" in materials_str or "steel" in materials_str or "metal" in materials_str
        
        # Check if non-metallic (e.g. plastic bottle without vacuum)
        if "polypropylene" in materials_str and not dna.insulated:
            return CandidateGenerationResult(
                product_category=dna.category,
                taxonomy_id=tax.canonical_category_id,
                coverage_state="COVERED",
                candidates=[
                    StandardCandidate(
                        standard_number="IS 17526:2021",
                        standard_title="Domestic Stainless Steel Vacuum Flask/Bottle",
                        status="NOT_APPLICABLE",
                        regulatory_status="VOLUNTARY",
                        generated_by_rule="APP-DRINKWARE-001",
                        source_status="VERIFIED_OFFICIAL",
                        contributing_attributes={"materials": dna.materials, "insulated": dna.insulated},
                        missing_blocking_attributes=[],
                        confidence=1.0,
                        explanation="Product is uninsulated plastic container; IS 17526:2021 applies specifically to double-wall stainless steel vacuum containers.",
                        is_coverage_gap=False,
                        llm_decision=False,
                    )
                ],
                has_coverage_gap=False,
                explanation="Product is non-metallic and outside IS 17526 scope.",
            )

        if not dna.materials and not has_metal:
            missing_blockers.append("materials")
        if not dna.insulated and "insulated" not in attr_dict:
            missing_blockers.append("insulated")

        status = "MORE_INFORMATION_REQUIRED" if missing_blockers else "LIKELY_APPLICABLE"
        reg_status = "VERIFIED_MANDATORY_QCO" if not missing_blockers else "MORE_INFORMATION_REQUIRED"

        explanation = (
            f"Candidate generated by Rule APP-DRINKWARE-001 for {dna.category}. "
            f"Mandated by DPIIT Quality Control Order 2023 for Domestic Vacuum Flasks. "
            + (f"Missing blocking attributes: {', '.join(missing_blockers)}." if missing_blockers else "All blocking attributes satisfied.")
        )

        candidates.append(
            StandardCandidate(
                standard_number="IS 17526:2021",
                standard_title="Domestic Stainless Steel Vacuum Flask/Bottle",
                status=status,
                regulatory_status=reg_status,
                generated_by_rule="APP-DRINKWARE-001",
                source_status="VERIFIED_OFFICIAL",
                contributing_attributes={
                    "category": dna.category,
                    "materials": dna.materials,
                    "insulated": dna.insulated,
                    "capacity_ml": attr_dict.get("capacity_ml"),
                },
                missing_blocking_attributes=missing_blockers,
                confidence=0.98 if not missing_blockers else 0.75,
                explanation=explanation,
                is_coverage_gap=False,
                llm_decision=False,
            )
        )

    # Case 3: Electrical & Domestic Appliances
    elif tax.canonical_category_id == "CAT-ELECTRICAL":
        profile = get_required_attribute_profile("IS 302-2-15:2009")
        missing_blockers = []
        if "voltage" not in attr_dict:
            missing_blockers.append("voltage")

        status = "MORE_INFORMATION_REQUIRED" if missing_blockers else "LIKELY_APPLICABLE"
        candidates.append(
            StandardCandidate(
                standard_number="IS 302-2-15:2009",
                standard_title="Safety of Household Electrical Appliances — Particular Requirements for Heating Liquids",
                status=status,
                regulatory_status="VERIFIED_MANDATORY_QCO",
                generated_by_rule="APP-ELECTRICAL-001",
                source_status="VERIFIED_OFFICIAL",
                contributing_attributes={"electrical": dna.electrical, "category": dna.category},
                missing_blocking_attributes=missing_blockers,
                confidence=0.95,
                explanation=f"Generated by Rule APP-ELECTRICAL-001 for liquid heating domestic appliances under Central QCO.",
                is_coverage_gap=False,
                llm_decision=False,
            )
        )

    return CandidateGenerationResult(
        product_category=dna.category,
        taxonomy_id=tax.canonical_category_id,
        coverage_state="COVERED",
        candidates=candidates,
        has_coverage_gap=False,
        explanation=f"Identified {len(candidates)} candidate standard(s) under taxonomy '{tax.category_name}'.",
    )
