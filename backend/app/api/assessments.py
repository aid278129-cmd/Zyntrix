from typing import List, Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from backend.app.database.session import get_db
from backend.app.models.assessment import Assessment, AssessmentSnapshot
from backend.app.models.product import Product
from backend.app.schemas.assessment import (
    AssessmentCreateRequest,
    AssessmentUpdateRequest,
    AssessmentSummaryResponse,
    AssessmentSnapshotRecord,
    CompliancePassport,
    AssessmentDetailResponse,
    AssessmentChatRequest,
    AssessmentChatResponse,
)
from backend.app.services.assessment.service import AssessmentService
from backend.app.services.gap_analysis.evidence_extractor import StructuredEvidence
from backend.app.services.laboratory.test_roadmap import TestRoadmapItem, RecognizedLaboratory

router = APIRouter(prefix="/assessments", tags=["MSME Assessment & Compliance Passport"])


@router.post("", response_model=AssessmentDetailResponse, status_code=status.HTTP_201_CREATED, summary="Create New Assessment")
async def create_assessment(req: AssessmentCreateRequest, db: AsyncSession = Depends(get_db)):
    assessment = await AssessmentService.create_assessment(db, req)
    return await AssessmentService.get_assessment_detail(db, assessment)


@router.get("", response_model=List[AssessmentSummaryResponse], summary="List All Assessments")
async def list_assessments(db: AsyncSession = Depends(get_db)):
    stmt = select(Assessment).order_by(Assessment.created_at.desc())
    res = await db.execute(stmt)
    assessments = res.scalars().all()
    return [AssessmentService.compute_summary(a) for a in assessments]


@router.get("/{assessment_id}", response_model=AssessmentDetailResponse, summary="Get Full Assessment Workspace")
async def get_assessment(assessment_id: str, db: AsyncSession = Depends(get_db)):
    stmt = select(Assessment).where(Assessment.id == assessment_id)
    res = await db.execute(stmt)
    assessment = res.scalar_one_or_none()
    if not assessment:
        raise HTTPException(status_code=404, detail=f"Assessment '{assessment_id}' not found.")
    return await AssessmentService.get_assessment_detail(db, assessment)


@router.patch("/{assessment_id}", response_model=AssessmentSummaryResponse, summary="Update Assessment Status/Mode")
async def update_assessment(assessment_id: str, req: AssessmentUpdateRequest, db: AsyncSession = Depends(get_db)):
    stmt = select(Assessment).where(Assessment.id == assessment_id)
    res = await db.execute(stmt)
    assessment = res.scalar_one_or_none()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found.")
    
    if req.title:
        assessment.title = req.title
    if req.status:
        assessment.status = req.status
    if req.mode:
        assessment.mode = req.mode
    
    await db.commit()
    await db.refresh(assessment)
    return AssessmentService.compute_summary(assessment)


@router.get("/{assessment_id}/summary", response_model=AssessmentSummaryResponse, summary="Get Structured Assessment Counts")
async def get_assessment_summary(assessment_id: str, db: AsyncSession = Depends(get_db)):
    stmt = select(Assessment).where(Assessment.id == assessment_id)
    res = await db.execute(stmt)
    assessment = res.scalar_one_or_none()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found.")
    return AssessmentService.compute_summary(assessment)


@router.get("/{assessment_id}/passport", response_model=CompliancePassport, summary="Generate Auditable Compliance Passport")
async def get_compliance_passport(assessment_id: str, db: AsyncSession = Depends(get_db)):
    stmt = select(Assessment).where(Assessment.id == assessment_id)
    res = await db.execute(stmt)
    assessment = res.scalar_one_or_none()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found.")
    
    prod_stmt = select(Product).where(Product.id == assessment.product_id)
    p_res = await db.execute(prod_stmt)
    prod = p_res.scalar_one_or_none()
    prod_name = prod.name if prod else "Domestic Vacuum Flask"
    category = prod.category if prod else "Drinkware & Food Contact Containers"

    return AssessmentService.generate_compliance_passport(assessment, prod_name, category)


@router.get("/{assessment_id}/snapshots", response_model=List[AssessmentSnapshotRecord], summary="List Point-in-time Snapshots")
async def list_assessment_snapshots(assessment_id: str, db: AsyncSession = Depends(get_db)):
    stmt = select(AssessmentSnapshot).where(AssessmentSnapshot.assessment_id == assessment_id).order_by(AssessmentSnapshot.version.desc())
    res = await db.execute(stmt)
    snaps = res.scalars().all()
    return [
        AssessmentSnapshotRecord(
            snapshot_id=s.id,
            assessment_id=s.assessment_id,
            version=s.version,
            trigger_event=s.trigger_event,
            created_at=s.created_at,
            knowledge_version=s.knowledge_version,
            summary_counts=s.summary_counts,
        )
        for s in snaps
    ]


@router.post("/{assessment_id}/snapshot", response_model=AssessmentSnapshotRecord, summary="Manually Trigger Snapshot")
async def create_manual_snapshot(assessment_id: str, db: AsyncSession = Depends(get_db)):
    stmt = select(Assessment).where(Assessment.id == assessment_id)
    res = await db.execute(stmt)
    assessment = res.scalar_one_or_none()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found.")
    
    snap = await AssessmentService.create_snapshot(db, assessment, trigger_event="MANUAL_SNAPSHOT_REQUEST")
    return AssessmentSnapshotRecord(
        snapshot_id=snap.id,
        assessment_id=snap.assessment_id,
        version=snap.version,
        trigger_event=snap.trigger_event,
        created_at=snap.created_at,
        knowledge_version=snap.knowledge_version,
        summary_counts=snap.summary_counts,
    )


class EvidenceSubmitRequest(BaseModel):
    snippet: str
    evidence_type: str = "TEST_REPORT"
    authority: str = "LAB_REPORT"
    page: Optional[int] = None


from pydantic import BaseModel

@router.post("/{assessment_id}/evidence", response_model=AssessmentDetailResponse, summary="Upload Evidence to Assessment")
async def add_assessment_evidence(assessment_id: str, req: EvidenceSubmitRequest, db: AsyncSession = Depends(get_db)):
    stmt = select(Assessment).where(Assessment.id == assessment_id)
    res = await db.execute(stmt)
    assessment = res.scalar_one_or_none()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found.")
    
    updated_asm = await AssessmentService.add_evidence_and_recalculate(
        db=db,
        assessment=assessment,
        snippet=req.snippet,
        evidence_type=req.evidence_type,
        authority=req.authority,
        page=req.page,
    )
    return await AssessmentService.get_assessment_detail(db, updated_asm)


class ClarifySubmitRequest(BaseModel):
    attribute: str
    value: str


@router.post("/{assessment_id}/clarify", response_model=AssessmentDetailResponse, summary="Answer Clarification Question")
async def answer_assessment_clarification(assessment_id: str, req: ClarifySubmitRequest, db: AsyncSession = Depends(get_db)):
    stmt = select(Assessment).where(Assessment.id == assessment_id)
    res = await db.execute(stmt)
    assessment = res.scalar_one_or_none()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found.")
    
    updated_asm = await AssessmentService.answer_clarification_and_recalculate(
        db=db,
        assessment=assessment,
        attribute_name=req.attribute,
        raw_value=req.value,
    )
    return await AssessmentService.get_assessment_detail(db, updated_asm)


@router.post("/{assessment_id}/chat", response_model=AssessmentChatResponse, summary="Context-Aware Assessment Chat Assistant")
async def chat_with_assessment(assessment_id: str, req: AssessmentChatRequest, db: AsyncSession = Depends(get_db)):
    stmt = select(Assessment).where(Assessment.id == assessment_id)
    res = await db.execute(stmt)
    assessment = res.scalar_one_or_none()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found.")
    
    res_dict = AssessmentService.answer_assessment_question(assessment, req.message)
    return AssessmentChatResponse(**res_dict)


@router.post("/demo/reset", response_model=AssessmentDetailResponse, summary="Reset/Initialize Golden SIH Demo Assessment")
async def reset_golden_demo_assessment(db: AsyncSession = Depends(get_db)):
    """Creates or resets the deterministic Golden SIH Demo Case without external network dependency."""
    from backend.app.services.assessment.golden_demo import GOLDEN_DEMO_PRODUCT
    req = AssessmentCreateRequest(**GOLDEN_DEMO_PRODUCT)
    asm = await AssessmentService.create_assessment(db, req)
    return await AssessmentService.get_assessment_detail(db, asm)


@router.get("/evaluation/m5", summary="Run Comprehensive M5 Multi-Dimensional Evaluation")
async def get_m5_evaluation_metrics():
    """Execute evaluation over the 30 stratified benchmark cases and return honest empirical metrics."""
    from backend.app.services.evaluation.m5_evaluator import run_m5_comprehensive_evaluation
    return run_m5_comprehensive_evaluation()
