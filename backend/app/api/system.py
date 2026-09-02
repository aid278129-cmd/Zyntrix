from fastapi import APIRouter
from backend.app.core.config import settings

router = APIRouter(prefix="/system", tags=["System Architecture"])


@router.get("/info", summary="System Information & M0 Architecture State")
async def get_system_info():
    return {
        "project": settings.PROJECT_NAME,
        "team": settings.PROJECT_TEAM,
        "sih_problem_id": settings.SIH_PROBLEM_ID,
        "milestone": "M0 - Engineering Foundation",
        "compliance_principle": "LLM generates explanations; retrieved evidence establishes compliance claims.",
        "evaluator_weaknesses_addressed": [
            "Accuracy validation framework designed (no fabricated claims/metrics)",
            "Deterministic applicability and multi-state compliance model (minimal LLM decision dependency)",
            "Real BIS Indian Standards schema foundation (IS catalog & clause-level provenance)",
        ],
        "active_modules": {
            "api_gateway": "READY",
            "database_orm": "READY",
            "pydantic_schemas": "READY",
            "citation_guard_contract": "READY",
            "product_dna_schema": "READY",
            "rag_clause_retrieval": "PLANNED_FOR_M1",
            "gap_analysis_engine": "PLANNED_FOR_M1",
            "evidence_graph": "PLANNED_FOR_M1",
            "ocr_multilingual": "PLANNED_FOR_M1",
        },
    }
