import uuid
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from backend.app.database.session import get_db
from backend.app.models.product import Product
from backend.app.models.standard import Standard
from backend.app.models.clause import Clause
from backend.app.models.decision_record import DecisionRecord
from backend.app.schemas.product_dna import (
    ProductDNACore,
    ProductDNAResponse,
    ClarificationRequirement,
)
from backend.app.services.product_dna.extractor import extract_product_dna_from_text
from backend.app.services.clarification.engine import (
    detect_missing_attributes,
    apply_clarification_response,
)
from backend.app.services.applicability.engine import (
    determine_applicability,
    load_declarative_rules,
    ApplicabilityDecision,
    DeclarativeRule,
)
from backend.app.services.gap_analysis.engine import (
    evaluate_compliance_gaps,
    StandardComplianceEvaluation,
)
from backend.app.services.gap_analysis.graph_builder import (
    build_evidence_graph,
    EvidenceGraphData,
)

router = APIRouter(prefix="/products", tags=["Product DNA & Compliance Intelligence"])


class ProductAnalyzeRequest(BaseModel):
    description: str = Field(..., min_length=5, description="Technical or commercial product description")
    document_ids: List[str] = Field(default_factory=list)
    authoritative_mode: bool = False  # If True, only use officially verified standard knowledge


class ClarifyRequest(BaseModel):
    attribute: str
    value: str
    source: str = "USER"


class ProductAnalyzeResponse(BaseModel):
    product_id: str
    product_dna: ProductDNACore
    clarifications: List[ClarificationRequirement]
    applicability: List[ApplicabilityDecision]
    compliance: Optional[StandardComplianceEvaluation] = None
    evidence_graph: EvidenceGraphData
    is_authoritative: bool = False
    evaluation_mode: str = "DEVELOPMENT_MODE"  # AUTHORITATIVE_MODE | DEVELOPMENT_MODE


# In-memory session store for interactive Product DNA workspace
_PRODUCT_WORKSPACE_STORE: Dict[str, Dict[str, Any]] = {}


@router.post(
    "/analyze",
    response_model=ProductAnalyzeResponse,
    summary="End-to-End Product Compliance Analysis",
    description="Extracts Product DNA, detects missing fields, evaluates deterministic applicability rules, and performs compliance gap analysis.",
)
async def analyze_product(
    req: ProductAnalyzeRequest,
    db: AsyncSession = Depends(get_db),
):
    product_id = str(uuid.uuid4())

    # 1. Extract Product DNA
    dna = extract_product_dna_from_text(req.description)

    # 2. Detect missing fields for clarification
    clarifications = detect_missing_attributes(dna)
    dna.pending_clarifications = clarifications

    # 3. Determine Applicability using deterministic rules
    applicability = determine_applicability(dna, authoritative_only=req.authoritative_mode)

    # 4. Standard requirements catalog lookup
    compliance_eval: Optional[StandardComplianceEvaluation] = None
    if applicability:
        primary_app = applicability[0]
        
        # Representative clauses for IS 17526:2021
        req_catalog = [
            {
                "id": "req-4-2-1",
                "clause_number": "4.2.1",
                "clause_title": "Stainless Steel Parts",
                "code": "REQ-MAT-304",
                "requirement_type": "MATERIAL",
                "description": "All metallic parts in direct contact with food shall be manufactured from Stainless Steel Grade 304 or superior.",
                "measurable_condition": "Grade 304 of IS 6911",
            },
            {
                "id": "req-5-2",
                "clause_number": "5.2",
                "clause_title": "Leakage Test",
                "code": "REQ-PERF-LEAK",
                "requirement_type": "PERFORMANCE",
                "description": "Container filled to capacity and inverted for 10 minutes shall show zero leakage or moisture seepage.",
                "measurable_condition": "Inverted 10 minutes, zero leakage",
            },
            {
                "id": "req-5-4",
                "clause_number": "5.4",
                "clause_title": "Thermal Performance Test",
                "code": "REQ-PERF-THERM",
                "requirement_type": "PERFORMANCE",
                "description": "Initial hot water at 95 deg C sealed at room ambient; after 6 hours temperature shall not be less than 60 deg C.",
                "measurable_condition": ">= 60 deg C after 6 hours",
            },
            {
                "id": "req-7-1",
                "clause_number": "7.1",
                "clause_title": "Marking Requirements",
                "code": "REQ-MARK-ISI",
                "requirement_type": "MARKING",
                "description": "Legibly marked with manufacturer trademark, nominal capacity, and the BIS Standard Mark (ISI Mark).",
                "measurable_condition": "Standard Mark (ISI Mark) + capacity",
            },
        ]

        compliance_eval = evaluate_compliance_gaps(
            standard_number=primary_app.standard_number,
            standard_title=primary_app.standard_title,
            requirements_catalog=req_catalog,
            dna=dna,
        )

        # Store DecisionRecords in database for auditable traceability
        for ev in compliance_eval.evaluations:
            rec = DecisionRecord(
                product_id=product_id,
                standard_number=primary_app.standard_number,
                clause_number=ev.clause_number,
                requirement_id=ev.requirement_id,
                status=ev.status.value,
                recommended_action=ev.recommended_action.value if ev.recommended_action else None,
                rule_id=primary_app.matched_rule_id,
                decision_engine="DETERMINISTIC_RULE_ENGINE",
                llm_decision=False,
                explanation=ev.explanation,
                inputs_snapshot=dna.model_dump(),
            )
            db.add(rec)
        await db.commit()

    # 5. Build Evidence Graph
    graph_data = build_evidence_graph(
        product_id=product_id,
        dna=dna,
        applicability=applicability,
        compliance=compliance_eval,
    )

    # Save to workspace cache
    _PRODUCT_WORKSPACE_STORE[product_id] = {
        "dna": dna,
        "clarifications": clarifications,
        "applicability": applicability,
        "compliance": compliance_eval,
        "evidence_graph": graph_data,
        "is_authoritative": req.authoritative_mode,
    }

    return ProductAnalyzeResponse(
        product_id=product_id,
        product_dna=dna,
        clarifications=clarifications,
        applicability=applicability,
        compliance=compliance_eval,
        evidence_graph=graph_data,
        is_authoritative=req.authoritative_mode,
        evaluation_mode="AUTHORITATIVE_MODE" if req.authoritative_mode else "DEVELOPMENT_MODE",
    )


@router.post(
    "/{product_id}/clarify",
    response_model=ProductAnalyzeResponse,
    summary="Answer Missing Attribute Clarification",
    description="Updates Product DNA with user answer, preserves provenance history, and re-evaluates affected reasoning.",
)
async def clarify_product_attribute(
    product_id: str,
    req: ClarifyRequest,
    db: AsyncSession = Depends(get_db),
):
    if product_id not in _PRODUCT_WORKSPACE_STORE:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product workspace session '{product_id}' not found.",
        )

    cached = _PRODUCT_WORKSPACE_STORE[product_id]
    dna: ProductDNACore = cached["dna"]

    # Safely apply clarification
    updated_dna = apply_clarification_response(
        dna=dna,
        attribute_name=req.attribute,
        raw_value=req.value,
        source_type=req.source,
    )

    # Re-evaluate
    clarifications = detect_missing_attributes(updated_dna)
    updated_dna.pending_clarifications = clarifications

    applicability = determine_applicability(updated_dna, authoritative_only=cached.get("is_authoritative", False))
    
    compliance_eval: Optional[StandardComplianceEvaluation] = None
    if applicability:
        primary_app = applicability[0]
        req_catalog = [
            {
                "id": "req-4-2-1",
                "clause_number": "4.2.1",
                "clause_title": "Stainless Steel Parts",
                "code": "REQ-MAT-304",
                "requirement_type": "MATERIAL",
                "description": "All metallic parts in direct contact with food shall be manufactured from Stainless Steel Grade 304 or superior.",
                "measurable_condition": "Grade 304 of IS 6911",
            },
            {
                "id": "req-5-2",
                "clause_number": "5.2",
                "clause_title": "Leakage Test",
                "code": "REQ-PERF-LEAK",
                "requirement_type": "PERFORMANCE",
                "description": "Container filled to capacity and inverted for 10 minutes shall show zero leakage or moisture seepage.",
                "measurable_condition": "Inverted 10 minutes, zero leakage",
            },
            {
                "id": "req-5-4",
                "clause_number": "5.4",
                "clause_title": "Thermal Performance Test",
                "code": "REQ-PERF-THERM",
                "requirement_type": "PERFORMANCE",
                "description": "Initial hot water at 95 deg C sealed at room ambient; after 6 hours temperature shall not be less than 60 deg C.",
                "measurable_condition": ">= 60 deg C after 6 hours",
            },
            {
                "id": "req-7-1",
                "clause_number": "7.1",
                "clause_title": "Marking Requirements",
                "code": "REQ-MARK-ISI",
                "requirement_type": "MARKING",
                "description": "Legibly marked with manufacturer trademark, nominal capacity, and the BIS Standard Mark (ISI Mark).",
                "measurable_condition": "Standard Mark (ISI Mark) + capacity",
            },
        ]
        compliance_eval = evaluate_compliance_gaps(
            standard_number=primary_app.standard_number,
            standard_title=primary_app.standard_title,
            requirements_catalog=req_catalog,
            dna=updated_dna,
        )

    graph_data = build_evidence_graph(
        product_id=product_id,
        dna=updated_dna,
        applicability=applicability,
        compliance=compliance_eval,
    )

    _PRODUCT_WORKSPACE_STORE[product_id].update({
        "dna": updated_dna,
        "clarifications": clarifications,
        "applicability": applicability,
        "compliance": compliance_eval,
        "evidence_graph": graph_data,
    })

    return ProductAnalyzeResponse(
        product_id=product_id,
        product_dna=updated_dna,
        clarifications=clarifications,
        applicability=applicability,
        compliance=compliance_eval,
        evidence_graph=graph_data,
        is_authoritative=cached.get("is_authoritative", False),
        evaluation_mode="AUTHORITATIVE_MODE" if cached.get("is_authoritative") else "DEVELOPMENT_MODE",
    )


@router.get("/{product_id}/dna", response_model=ProductDNACore)
async def get_product_dna(product_id: str):
    if product_id not in _PRODUCT_WORKSPACE_STORE:
        raise HTTPException(status_code=404, detail="Product not found")
    return _PRODUCT_WORKSPACE_STORE[product_id]["dna"]


@router.get("/{product_id}/applicability", response_model=List[ApplicabilityDecision])
async def get_product_applicability(product_id: str):
    if product_id not in _PRODUCT_WORKSPACE_STORE:
        raise HTTPException(status_code=404, detail="Product not found")
    return _PRODUCT_WORKSPACE_STORE[product_id]["applicability"]


@router.get("/{product_id}/evidence-graph", response_model=EvidenceGraphData)
async def get_product_evidence_graph(product_id: str):
    if product_id not in _PRODUCT_WORKSPACE_STORE:
        raise HTTPException(status_code=404, detail="Product not found")
    return _PRODUCT_WORKSPACE_STORE[product_id]["evidence_graph"]
