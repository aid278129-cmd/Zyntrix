from fastapi import APIRouter, HTTPException
from backend.app.core.config import settings
from backend.app.services.diagnostics.dependency_checker import (
    check_all_dependencies,
    SystemDiagnosticsResponse,
    DependencyHealthRecord,
)

router = APIRouter(prefix="/system", tags=["System Architecture & Diagnostics"])


@router.get("/info", summary="System Information & M0 Architecture State")
async def get_system_info():
    return {
        "project": settings.PROJECT_NAME,
        "team": settings.PROJECT_TEAM,
        "sih_problem_id": settings.SIH_PROBLEM_ID,
        "milestone": "M0 - Engineering Foundation",
        "current_audit": "M20 - System Diagnostics & Integration Audit",
        "compliance_principle": "LLM generates explanations; retrieved evidence establishes compliance claims.",
        "active_modules": {
            "api_gateway": "READY",
            "database_orm": "READY",
            "pydantic_schemas": "READY",
            "citation_guard_contract": "READY",
            "product_dna_schema": "READY",
            "rag_clause_retrieval": "READY",
            "gap_analysis_engine": "READY",
            "evidence_graph": "READY",
            "ocr_multilingual": "READY",
            "compliance_passport": "READY",
        },
    }


@router.get("/dependencies", response_model=SystemDiagnosticsResponse, summary="Comprehensive System & Dependency Diagnostics")
async def get_dependencies():
    """Returns complete runtime health, latency, configuration, and fallback status across all services."""
    return check_all_dependencies()
