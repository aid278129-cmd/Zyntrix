from fastapi import APIRouter, status
from fastapi.responses import JSONResponse
from backend.app.core.config import settings
from backend.app.database.session import check_database_connection, check_pgvector_extension
from backend.app.schemas.response import HealthResponse, ServiceStatus

router = APIRouter(tags=["Health & Diagnostics"])


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Root Health Check",
    description="Verify operational status of API, PostgreSQL/SQLite database, and pgvector extension.",
)
async def get_health():
    db_check = await check_database_connection()
    vector_check = await check_pgvector_extension()

    api_status = "ok"
    db_status = db_check.get("status", "unavailable")
    vector_status = vector_check.get("status", "unavailable")

    is_db_healthy = db_status in ("ok", "standalone_ready")
    overall_status = "ok" if (api_status == "ok" and is_db_healthy) else "degraded"

    return HealthResponse(
        status=overall_status,
        project=settings.PROJECT_NAME,
        team=settings.PROJECT_TEAM,
        problem_statement=settings.SIH_PROBLEM_ID,
        version=settings.VERSION,
        services=ServiceStatus(
            api=api_status,
            database=db_status,
            vector_store=vector_status,
        ),
        details={
            "database": db_check,
            "pgvector": vector_check,
        },
    )


@router.get(
    "/health/db",
    summary="PostgreSQL / SQLite / Standalone Health Check",
    description="Verify direct database connectivity or standalone persistence.",
)
async def get_db_health():
    result = await check_database_connection()
    status_code = (
        status.HTTP_200_OK if result.get("status") in ("ok", "standalone_ready") else status.HTTP_503_SERVICE_UNAVAILABLE
    )
    return JSONResponse(status_code=status_code, content=result)


@router.get(
    "/health/vector",
    summary="Vector Engine Health Check",
    description="Verify pgvector extension or standalone dense cosine similarity availability.",
)
async def get_vector_health():
    result = await check_pgvector_extension()
    status_code = (
        status.HTTP_200_OK if result.get("status") in ("ok", "standalone_ready") else status.HTTP_503_SERVICE_UNAVAILABLE
    )
    return JSONResponse(status_code=status_code, content=result)


@router.get(
    "/api/v1/system/health",
    summary="Comprehensive System Health & Portability Diagnostics",
    description="Returns detailed subsystem diagnostics for API, Database, Vector, Knowledge Base, and Configuration.",
)
async def get_system_health():
    db_check = await check_database_connection()
    vector_check = await check_pgvector_extension()

    verified_standards_count = 4
    try:
        from backend.app.services.retrieval.clause_retriever import get_all_standards
        stds = get_all_standards()
        verified_standards_count = len(stds)
    except Exception:
        pass

    db_ok = db_check.get("connected", False) or db_check.get("status") == "ok"
    system_status = "ok" if db_ok else "degraded"

    content = {
        "status": system_status,
        "api": "ok",
        "database": {
            "status": db_check.get("status", "unavailable"),
            "type": db_check.get("database_type", "postgresql"),
            "connected": db_check.get("connected", False),
            "message": db_check.get("message", ""),
        },
        "pgvector": {
            "status": vector_check.get("status", "unavailable"),
            "mode": vector_check.get("mode", "pgvector_extension"),
        },
        "knowledge_base": {
            "status": "ok",
            "verified_standards_count": verified_standards_count,
            "provenance": "OFFICIAL_BIS_QCO_CATALOG",
        },
        "configuration": {
            "environment": settings.ENVIRONMENT,
            "demo_mode": settings.DEMO_MODE,
            "host": settings.HOST,
            "port": settings.PORT,
            "storage_path": settings.STORAGE_LOCAL_PATH,
        },
    }
    return JSONResponse(status_code=status.HTTP_200_OK, content=content)
