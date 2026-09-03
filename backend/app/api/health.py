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
    description="Verify operational status of API, PostgreSQL database, and pgvector extension.",
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
    summary="PostgreSQL / Standalone Health Check",
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
