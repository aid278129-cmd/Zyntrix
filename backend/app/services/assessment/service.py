"""Assessment Service orchestrating the unified MSME assessment lifecycle.

Unifies:
Product Input -> Product DNA -> Clarification -> Applicability -> Hybrid Retrieval
-> Requirements -> Evidence -> Gap Analysis -> Testing Roadmap -> Labs
-> Evidence Graph -> Compliance Passport -> Point-in-time Snapshots.
"""
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from backend.app.models.assessment import Assessment, AssessmentSnapshot, AssessmentStatus
from backend.app.models.product import Product
from backend.app.models.decision_record import DecisionRecord
from backend.app.schemas.product_dna import ProductDNACore, ClarificationRequirement
from backend.app.schemas.compliance import ComplianceStatus, RecommendedAction
from backend.app.schemas.assessment import (
    AssessmentCreateRequest,
    AssessmentSummaryResponse,
    CompliancePassport,
    PassportTrustSection,
    PassportSourceIndexItem,
    AssessmentDetailResponse,
)
from backend.app.services.product_dna.extractor import extract_product_dna_from_text
from backend.app.services.clarification.engine import (
    detect_missing_attributes,
    apply_clarification_response,
)
from backend.app.services.applicability.engine import (
    determine_applicability,
    ApplicabilityDecision,
)
from backend.app.services.gap_analysis.engine import (
    evaluate_compliance_gaps,
    StandardComplianceEvaluation,
)
from backend.app.services.gap_analysis.graph_builder import (
    build_evidence_graph,
    EvidenceGraphData,
)
from backend.app.services.gap_analysis.evidence_extractor import (
    extract_evidence_from_snippet,
    detect_evidence_conflicts,
    StructuredEvidence,
)
from backend.app.services.laboratory.test_roadmap import (
    compile_testing_roadmap,
    get_verified_laboratories,
    TestRoadmapItem,
    RecognizedLaboratory,
)


class AssessmentService:
    """Core service managing assessment execution, state aggregation, snapshotting, and passport generation."""

    @staticmethod
    def _build_requirements_catalog(authoritative_mode: bool) -> List[Dict[str, Any]]:
        if authoritative_mode:
            return [
                {
                    "id": "req-auth-pending",
                    "clause_number": "PENDING",
                    "clause_title": "Official Standard Specification Acquisition Pending",
                    "code": "AUTHORITATIVE_CLAUSE_PENDING",
                    "requirement_type": "REGULATORY_GOVERNANCE",
                    "description": "Full official technical standard specification document for IS 17526:2021 is pending acquisition from authorized Bureau of Indian Standards procurement channel. Official Gazette QCO Order 2023 and BIS Product Manual PM/IS 17526/1 are verified.",
                    "measurable_condition": "Verified official publication from Bureau of Indian Standards",
                }
            ]
        return [
            {
                "id": "req-4-2-1",
                "clause_number": "4.2.1",
                "clause_title": "Stainless Steel Parts (Development Test Fixture)",
                "code": "REQ-MAT-304",
                "requirement_type": "MATERIAL",
                "description": "All metallic parts in direct contact with food shall be manufactured from Stainless Steel Grade 304 or superior.",
                "measurable_condition": "Grade 304 of IS 6911",
            },
            {
                "id": "req-5-2",
                "clause_number": "5.2",
                "clause_title": "Leakage Test (Development Test Fixture)",
                "code": "REQ-PERF-LEAK",
                "requirement_type": "PERFORMANCE",
                "description": "Container filled to capacity and inverted for 10 minutes shall show zero leakage or moisture seepage.",
                "measurable_condition": "Inverted 10 minutes, zero leakage",
            },
            {
                "id": "req-5-4",
                "clause_number": "5.4",
                "clause_title": "Thermal Performance Test (Development Test Fixture)",
                "code": "REQ-PERF-THERM",
                "requirement_type": "PERFORMANCE",
                "description": "Initial hot water at 95 deg C sealed at room ambient; after 6 hours temperature shall not be less than 60 deg C.",
                "measurable_condition": ">= 60 deg C after 6 hours",
            },
            {
                "id": "req-7-1",
                "clause_number": "7.1",
                "clause_title": "Marking Requirements (Development Test Fixture)",
                "code": "REQ-MARK-ISI",
                "requirement_type": "MARKING",
                "description": "Legibly marked with manufacturer trademark, nominal capacity, and the BIS Standard Mark (ISI Mark).",
                "measurable_condition": "Standard Mark (ISI Mark) + capacity",
            },
        ]

    @classmethod
    async def create_assessment(
        cls,
        db: AsyncSession,
        req: AssessmentCreateRequest,
    ) -> Assessment:
        """Create a new assessment with initial product DNA extraction and applicability calculation."""
        product_id = f"PROD-{uuid.uuid4().hex[:8].upper()}"
        assessment_id = f"ASM-{uuid.uuid4().hex[:8].upper()}"
        assessment_num = f"ASM-2026-{uuid.uuid4().hex[:6].upper()}"

        # 1. Extract Product DNA
        dna = extract_product_dna_from_text(req.description)
        dna.product_name = req.product_name
        if req.category:
            dna.category = req.category
        clarifications = detect_missing_attributes(dna)
        dna.pending_clarifications = clarifications

        # 2. Determine Applicability
        applicability = determine_applicability(dna, authoritative_only=req.authoritative_mode)

        # 3. Evaluate initial compliance gaps
        compliance_eval: Optional[StandardComplianceEvaluation] = None
        standard_number = "IS 17526:2021"
        standard_title = "Domestic Stainless Steel Vacuum Flask/Bottle"
        if applicability:
            standard_number = applicability[0].standard_number
            standard_title = applicability[0].standard_title

        catalog = cls._build_requirements_catalog(req.authoritative_mode)
        compliance_eval = evaluate_compliance_gaps(
            standard_number=standard_number,
            standard_title=standard_title,
            requirements_catalog=catalog,
            dna=dna,
        )

        # 4. Create Product & Assessment in DB
        prod = Product(
            id=product_id,
            name=req.product_name,
            category=req.category,
            description=req.description,
            dna_metadata=dna.model_dump(),
        )
        db.add(prod)

        mode_str = "AUTHORITATIVE_MODE" if req.authoritative_mode else "DEVELOPMENT_MODE"
        init_status = AssessmentStatus.COLLECTING_INFORMATION if clarifications else AssessmentStatus.COMPLIANCE_REVIEW

        assessment = Assessment(
            id=assessment_id,
            product_id=product_id,
            assessment_number=assessment_num,
            title=f"Compliance Assessment - {req.product_name}",
            status=init_status.value,
            mode=mode_str,
            current_version=1,
            product_dna_snapshot=dna.model_dump(),
            applicability_snapshot=[a.model_dump() for a in applicability],
            compliance_summary_snapshot=compliance_eval.model_dump() if compliance_eval else {},
            evidence_ids=[],
            source_ids=["SRC-BIS-OFFICIAL", "SRC-DPIIT-QCO-2023"],
        )
        db.add(assessment)
        await db.commit()
        await db.refresh(assessment)

        # 5. Create Genesis Snapshot for Reproducibility
        await cls.create_snapshot(
            db=db,
            assessment=assessment,
            trigger_event="ASSESSMENT_INITIALIZED",
        )

        return assessment

    @classmethod
    async def create_snapshot(
        cls,
        db: AsyncSession,
        assessment: Assessment,
        trigger_event: str,
    ) -> AssessmentSnapshot:
        """Create an immutable point-in-time assessment snapshot recording exact inputs, rules, and outcomes."""
        summary = cls.compute_summary(assessment)
        snapshot = AssessmentSnapshot(
            id=f"SNAP-{uuid.uuid4().hex[:8].upper()}",
            assessment_id=assessment.id,
            version=assessment.current_version,
            trigger_event=trigger_event,
            product_dna_state=assessment.product_dna_snapshot,
            knowledge_version="M4.0-OFFICIAL-2023",
            rule_versions={
                "APP_DRINKWARE_001": "1.0.0",
                "IS_17526_2021": "First Edition 2021 + Amend 1-2",
            },
            decision_records_snapshot=assessment.compliance_summary_snapshot.get("evaluations", []),
            evidence_ids=assessment.evidence_ids,
            summary_counts=summary.model_dump(),
        )
        db.add(snapshot)
        await db.commit()
        await db.refresh(snapshot)
        return snapshot

    @classmethod
    def compute_summary(cls, assessment: Assessment) -> AssessmentSummaryResponse:
        """Compute structured count-based summary without fake percentages."""
        comp = assessment.compliance_summary_snapshot or {}
        evals = comp.get("evaluations", [])

        sat = sum(1 for e in evals if e.get("status") == ComplianceStatus.SATISFIED.value)
        pot_sat = sum(1 for e in evals if e.get("status") == ComplianceStatus.POTENTIALLY_SATISFIED.value)
        miss = sum(1 for e in evals if e.get("status") == ComplianceStatus.MISSING_EVIDENCE.value)
        more_info = sum(1 for e in evals if e.get("status") == ComplianceStatus.MORE_INFORMATION_REQUIRED.value)
        gaps = sum(1 for e in evals if e.get("status") == ComplianceStatus.POTENTIAL_GAP.value)
        not_app = sum(1 for e in evals if e.get("status") == ComplianceStatus.NOT_APPLICABLE.value)
        conflicts = sum(1 for e in evals if e.get("status") == ComplianceStatus.CONFLICTING_EVIDENCE.value)
        expert = sum(1 for e in evals if e.get("status") == ComplianceStatus.REQUIRES_EXPERT_REVIEW.value)

        actions: Dict[str, int] = {}
        for e in evals:
            act = e.get("recommended_action")
            if act:
                actions[act] = actions.get(act, 0) + 1

        overall = comp.get("overall_status", ComplianceStatus.MORE_INFORMATION_REQUIRED.value)
        is_auth = assessment.mode == "AUTHORITATIVE_MODE"

        return AssessmentSummaryResponse(
            assessment_id=assessment.id,
            product_id=assessment.product_id,
            assessment_number=assessment.assessment_number,
            status=assessment.status,
            mode=assessment.mode,
            total_requirements=len(evals),
            satisfied_count=sat,
            potentially_satisfied_count=pot_sat,
            missing_evidence_count=miss,
            more_information_required_count=more_info,
            potential_gaps_count=gaps,
            not_applicable_count=not_app,
            conflicting_evidence_count=conflicts,
            expert_review_count=expert,
            recommended_actions=actions,
            summary_verdict=overall,
            trust_basis={
                "is_authoritative": is_auth,
                "verified_metadata": True,
                "verified_qco": True,
                "full_text_acquisition": "OFFICIAL_DOCUMENT_ACQUISITION_PENDING",
            },
        )

    @classmethod
    async def get_assessment_detail(
        cls,
        db: AsyncSession,
        assessment: Assessment,
    ) -> AssessmentDetailResponse:
        """Compose comprehensive assessment workspace detail."""
        prod_stmt = select(Product).where(Product.id == assessment.product_id)
        prod_res = await db.execute(prod_stmt)
        prod = prod_res.scalar_one_or_none()

        dna = ProductDNACore.model_validate(assessment.product_dna_snapshot or {})
        clarifications = detect_missing_attributes(dna)
        dna.pending_clarifications = clarifications

        applicability = [
            ApplicabilityDecision.model_validate(a)
            for a in (assessment.applicability_snapshot or [])
        ]
        
        comp_eval = None
        if assessment.compliance_summary_snapshot:
            comp_eval = StandardComplianceEvaluation.model_validate(assessment.compliance_summary_snapshot)

        # Roadmap and laboratories
        std_num = applicability[0].standard_number if applicability else "IS 17526:2021"
        roadmap = compile_testing_roadmap(std_num)
        labs = get_verified_laboratories(std_num)

        # Graph
        graph = build_evidence_graph(
            product_id=assessment.product_id,
            dna=dna,
            applicability=applicability,
            compliance=comp_eval,
        )

        summary = cls.compute_summary(assessment)

        return AssessmentDetailResponse(
            assessment_id=assessment.id,
            product_id=assessment.product_id,
            assessment_number=assessment.assessment_number,
            title=assessment.title,
            status=assessment.status,
            mode=assessment.mode,
            current_version=assessment.current_version,
            created_at=assessment.created_at,
            updated_at=assessment.updated_at,
            completed_at=assessment.completed_at,
            product_dna=dna,
            clarifications=clarifications,
            applicability=applicability,
            compliance=comp_eval,
            evidence_items=[],
            evidence_conflicts=[],
            testing_roadmap=roadmap,
            laboratories=labs,
            evidence_graph=graph,
            summary=summary,
        )

    @classmethod
    async def add_evidence_and_recalculate(
        cls,
        db: AsyncSession,
        assessment: Assessment,
        snippet: str,
        evidence_type: str = "TEST_REPORT",
        authority: str = "LAB_REPORT",
        page: Optional[int] = None,
    ) -> Assessment:
        """Extract evidence from snippet, detect conflicts, recalculate compliance, bump version, and save snapshot."""
        evs = extract_evidence_from_snippet(
            snippet=snippet,
            evidence_type=evidence_type,
            authority=authority,
            page=page,
        )
        conflicts = detect_evidence_conflicts(evs)

        # Build evidence payload dictionary
        evidence_payload: Dict[str, Any] = {}
        for ev in evs:
            if ev.attribute == "tested_heat_retention_temp":
                evidence_payload["tested_temp_after_6hrs"] = ev.normalized_value
            elif ev.attribute == "leakage_test_result":
                evidence_payload["leakage_test_passed"] = (ev.normalized_value == 1.0)
            elif ev.attribute == "material_grade_verified":
                evidence_payload["mill_test_certificate"] = True

        dna = ProductDNACore.model_validate(assessment.product_dna_snapshot or {})
        catalog = cls._build_requirements_catalog(assessment.mode == "AUTHORITATIVE_MODE")

        comp_eval = evaluate_compliance_gaps(
            standard_number=assessment.applicability_snapshot[0]["standard_number"] if assessment.applicability_snapshot else "IS 17526:2021",
            standard_title=assessment.applicability_snapshot[0]["standard_title"] if assessment.applicability_snapshot else "Domestic Stainless Steel Vacuum Flask/Bottle",
            requirements_catalog=catalog,
            dna=dna,
            evidence_payload=evidence_payload,
        )

        assessment.current_version += 1
        assessment.compliance_summary_snapshot = comp_eval.model_dump()
        new_ev_ids = [ev.evidence_id for ev in evs]
        assessment.evidence_ids = list(set((assessment.evidence_ids or []) + new_ev_ids))
        assessment.status = AssessmentStatus.COMPLIANCE_REVIEW.value

        await db.commit()
        await db.refresh(assessment)

        # Snapshot the new decision state
        await cls.create_snapshot(
            db=db,
            assessment=assessment,
            trigger_event=f"EVIDENCE_ADDED_{evidence_type}",
        )
        return assessment

    @classmethod
    async def answer_clarification_and_recalculate(
        cls,
        db: AsyncSession,
        assessment: Assessment,
        attribute_name: str,
        raw_value: str,
    ) -> Assessment:
        """Apply clarification answer to Product DNA, update database, re-evaluate reasoning, and create snapshot."""
        dna = ProductDNACore.model_validate(assessment.product_dna_snapshot or {})
        updated_dna = apply_clarification_response(
            dna=dna,
            attribute_name=attribute_name,
            raw_value=raw_value,
            source_type="USER_CORRECTION",
        )

        clarifications = detect_missing_attributes(updated_dna)
        updated_dna.pending_clarifications = clarifications

        is_auth = assessment.mode == "AUTHORITATIVE_MODE"
        applicability = determine_applicability(updated_dna, authoritative_only=is_auth)
        catalog = cls._build_requirements_catalog(is_auth)

        comp_eval = evaluate_compliance_gaps(
            standard_number=applicability[0].standard_number if applicability else "IS 17526:2021",
            standard_title=applicability[0].standard_title if applicability else "Domestic Stainless Steel Vacuum Flask/Bottle",
            requirements_catalog=catalog,
            dna=updated_dna,
        )

        assessment.current_version += 1
        assessment.product_dna_snapshot = updated_dna.model_dump()
        assessment.applicability_snapshot = [a.model_dump() for a in applicability]
        assessment.compliance_summary_snapshot = comp_eval.model_dump()
        if not clarifications:
            assessment.status = AssessmentStatus.COMPLIANCE_REVIEW.value

        await db.commit()
        await db.refresh(assessment)

        await cls.create_snapshot(
            db=db,
            assessment=assessment,
            trigger_event=f"CLARIFICATION_ANSWERED_{attribute_name}",
        )
        return assessment

    @classmethod
    def generate_compliance_passport(
        cls,
        assessment: Assessment,
        prod_name: str,
        category: str,
    ) -> CompliancePassport:
        """Compile first-class structured Compliance Passport with source index and honest trust disclaimers."""
        is_auth = assessment.mode == "AUTHORITATIVE_MODE"
        dna = ProductDNACore.model_validate(assessment.product_dna_snapshot or {})
        applicability = [
            ApplicabilityDecision.model_validate(a)
            for a in (assessment.applicability_snapshot or [])
        ]
        comp = assessment.compliance_summary_snapshot or {}
        evals = comp.get("evaluations", [])

        gaps = [
            e for e in evals
            if e.get("status") in (
                ComplianceStatus.POTENTIAL_GAP.value,
                ComplianceStatus.MISSING_EVIDENCE.value,
                ComplianceStatus.MORE_INFORMATION_REQUIRED.value,
                ComplianceStatus.CONFLICTING_EVIDENCE.value,
                ComplianceStatus.REQUIRES_EXPERT_REVIEW.value,
            )
        ]

        roadmap = compile_testing_roadmap("IS 17526:2021")
        labs = get_verified_laboratories("IS 17526:2021")

        actions = []
        for e in evals:
            if e.get("recommended_action"):
                actions.append({
                    "clause_number": e.get("clause_number"),
                    "action": e.get("recommended_action"),
                    "explanation": e.get("explanation"),
                })

        # Structured Source Index
        source_index = [
            PassportSourceIndexItem(
                source_index_id="SRC-001",
                citation_type="STANDARD",
                title="IS 17526:2021 - Domestic Stainless Steel Vacuum Flask/Bottle",
                standard_or_gazette_number="IS 17526:2021",
                clause_or_section="Scope & Technical Specifications",
                page=1,
                url="https://www.manakonline.in",
                authority="BIS_OFFICIAL",
                verification_status="VERIFIED_METADATA",
            ),
            PassportSourceIndexItem(
                source_index_id="SRC-002",
                citation_type="REGULATION",
                title="Insulated Flask, Bottles and Containers for Domestic Use (Quality Control) Order, 2023",
                standard_or_gazette_number="DPIIT Gazette Order 2023",
                clause_or_section="Section 16, 17, 25(3)",
                page=2,
                url="https://egazette.gov.in",
                authority="GOVERNMENT_OFFICIAL",
                verification_status="VERIFIED",
            ),
            PassportSourceIndexItem(
                source_index_id="SRC-003",
                citation_type="PRODUCT_MANUAL",
                title="BIS Product Manual for Domestic Stainless Steel Vacuum Flasks (PM/IS 17526/1)",
                standard_or_gazette_number="PM/IS 17526/1",
                clause_or_section="Scheme of Inspection & Testing (8-sample protocol)",
                page=4,
                url="https://www.bis.gov.in",
                authority="BIS_OFFICIAL",
                verification_status="VERIFIED",
            ),
        ]

        trust_section = PassportTrustSection(
            verified_official_metadata=True,
            verified_regulatory_sources=True,
            full_standard_text_status="OFFICIAL_DOCUMENT_ACQUISITION_PENDING",
            synthetic_development_data_used=not is_auth,
            trust_level_summary=(
                "AUTHORITATIVE_VERIFIED: Evaluated exclusively against verified BIS metadata, DPIIT QCO 2023, and BIS Product Manual PM/IS 17526/1. Unsupported clause claims strictly refused."
                if is_auth else
                "DEVELOPMENT_MODE: Evaluated using synthetic test fixtures for development and testing. Strictly non-authoritative."
            ),
        )

        limitations = [
            "This Compliance Assessment Passport is an evidence-backed technical roadmap, NOT an official Bureau of Indian Standards License or ISI Mark Certificate.",
            "Full official technical standard specification document for IS 17526:2021 is pending authorized acquisition.",
            "This platform produces testing parameters and schedules; it does not physically execute laboratory experiments.",
            "Accredited testing must be conducted at a verified BIS/NABL recognized laboratory facility.",
        ]

        return CompliancePassport(
            passport_id=f"PSP-{uuid.uuid4().hex[:8].upper()}",
            assessment_id=assessment.id,
            assessment_number=assessment.assessment_number,
            product_name=prod_name,
            category=category,
            mode=assessment.mode,
            generated_at=datetime.now(timezone.utc),
            claim_statement="Evidence-Backed Regulatory Compliance Assessment & Technical Gap Roadmap",
            trust_basis=trust_section,
            product_dna=dna,
            applicable_standards=applicability,
            compliance_evaluations=evals,
            gaps=gaps,
            testing_roadmap=roadmap,
            recognized_laboratories=labs,
            recommended_actions=actions,
            source_index=source_index,
            limitations=limitations,
        )

    @classmethod
    def answer_assessment_question(
        cls,
        assessment: Assessment,
        question: str,
    ) -> Dict[str, Any]:
        """Context-aware assistant operating strictly within the assessment, DNA, evidence, and rule boundaries."""
        q_lower = question.lower()
        comp = assessment.compliance_summary_snapshot or {}
        evals = comp.get("evaluations", [])
        dna = assessment.product_dna_snapshot or {}

        # Search matching clause in current assessment
        matched_eval = None
        for ev in evals:
            c_num = str(ev.get("clause_number", "")).lower()
            if c_num and (f"clause {c_num}" in q_lower or f"{c_num}" in q_lower):
                matched_eval = ev
                break

        if matched_eval:
            ans = (
                f"Clause {matched_eval.get('clause_number')} ({matched_eval.get('clause_title')}) is currently marked "
                f"'{matched_eval.get('status')}'. Reason: {matched_eval.get('explanation')}"
            )
            if matched_eval.get("recommended_action"):
                ans += f" Recommended Next Step: {matched_eval.get('recommended_action')}."
            citations = [
                {
                    "standard": comp.get("standard_number", "IS 17526:2021"),
                    "clause": matched_eval.get("clause_number"),
                    "source": "BIS Standards Catalog & Product Manual PM/IS 17526/1",
                }
            ]
        elif "gap" in q_lower or "missing" in q_lower:
            gaps = [e for e in evals if e.get("status") in (ComplianceStatus.MISSING_EVIDENCE.value, ComplianceStatus.POTENTIAL_GAP.value, ComplianceStatus.MORE_INFORMATION_REQUIRED.value)]
            ans = f"This assessment has identified {len(gaps)} compliance gap(s) or missing evidence items: " + "; ".join(f"Clause {g.get('clause_number')}: {g.get('explanation')}" for g in gaps)
            citations = [{"standard": "IS 17526:2021", "source": "Product Manual PM/IS 17526/1"}]
        elif "dna" in q_lower or "material" in q_lower or "capacity" in q_lower:
            ans = f"Current Product DNA record: Name: '{dna.get('product_name')}', Category: '{dna.get('category')}', Materials: {dna.get('materials')}, Capacity: {dna.get('capacity_ml')}ml, Insulated: {dna.get('insulated')}."
            citations = [{"source": "Product DNA Extractor & Normalizer"}]
        elif "passport" in q_lower or "certificate" in q_lower:
            ans = "The Compliance Passport provides an auditable technical roadmap and evidence breakdown. It is not an official BIS ISI license, which requires official laboratory testing and factory audit."
            citations = [{"source": "DPIIT QCO Order 2023", "clause": "Scheme-I Conformity Assessment Regulations"}]
        else:
            ans = (
                f"Assessment '{assessment.assessment_number}' is in mode '{assessment.mode}' with verdict '{comp.get('overall_status', 'UNDER_EVALUATION')}'. "
                "You can inspect Product DNA attributes, upload test reports, view the testing roadmap, or generate the auditable Compliance Passport."
            )
            citations = [{"source": "Zyntrix Assessment Context Engine"}]

        return {
            "answer": ans,
            "assessment_id": assessment.id,
            "context_used": {
                "assessment_number": assessment.assessment_number,
                "mode": assessment.mode,
                "overall_status": comp.get("overall_status"),
                "total_requirements": len(evals),
            },
            "citations": citations,
            "disclaimer": "AI assistant operates strictly in an explanatory capacity. All compliance decisions are deterministically computed by the rule engine.",
        }
