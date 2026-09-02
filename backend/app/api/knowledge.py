from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from backend.app.database.session import get_db
from backend.app.models.standard import Standard
from backend.app.models.clause import Clause
from backend.app.models.document import Document
from backend.app.schemas.standard import StandardResponse, StandardDetailResponse
from backend.app.schemas.clause import (
    ClauseResponse,
    ClauseTreeNode,
    ClauseSearchQuery,
    ClauseSearchResult,
    RequirementSchema,
)
from backend.app.schemas.document import DocumentRegistryResponse, DocumentUploadResponse
from backend.app.services.retrieval.clause_retriever import search_clauses
from backend.app.services.ingestion.pipeline import ingest_standard_document, IngestionSummary
from backend.app.services.ingestion.document_loader import save_uploaded_file
from backend.app.core.logging import logger

router = APIRouter(tags=["Knowledge Base & Standards"])


@router.post(
    "/knowledge/search",
    response_model=List[ClauseSearchResult],
    summary="Semantic & Filtered Clause Retrieval",
    description="Retrieve verified BIS clauses matching a query with page provenance, similarity score, and Citation Guard objects.",
)
async def search_knowledge_clauses(
    query: ClauseSearchQuery,
    db: AsyncSession = Depends(get_db),
):
    try:
        results = await search_clauses(
            db=db,
            query=query.query,
            standard_number=query.standard_number,
            verified_only=query.verified_only,
            top_k=query.top_k,
        )
        return results
    except Exception as exc:
        logger.warning(f"Knowledge search query database notice: {exc}")
        return []


@router.get(
    "/standards",
    response_model=List[StandardResponse],
    summary="List Indian Standards Catalog",
    description="Retrieve catalog of registered BIS Indian Standards with verification and QCO status.",
)
async def list_standards(
    status_filter: Optional[str] = None,
    category: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    try:
        stmt = select(Standard)
        if status_filter:
            stmt = stmt.where(Standard.status == status_filter)
        if category:
            stmt = stmt.where(Standard.category == category)
        stmt = stmt.order_by(Standard.standard_number)

        result = await db.execute(stmt)
        return result.scalars().all()
    except Exception as exc:
        logger.warning(f"Standards list database notice: {exc}")
        return []


@router.get(
    "/standards/{standard_id}",
    response_model=StandardDetailResponse,
    summary="Get Standard Detail",
    description="Retrieve complete metadata and clause summaries for a specific Indian Standard.",
)
async def get_standard_detail(
    standard_id: str,
    db: AsyncSession = Depends(get_db),
):
    try:
        stmt = (
            select(Standard)
            .where(Standard.id == standard_id)
            .options(selectinload(Standard.clauses).selectinload(Clause.requirements))
        )
        result = await db.execute(stmt)
        std = result.scalar_one_or_none()
        if not std:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Standard '{standard_id}' not found")
        return std
    except HTTPException:
        raise
    except Exception as exc:
        logger.warning(f"Standard detail database notice: {exc}")
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database currently unavailable")


@router.get(
    "/standards/{standard_id}/clauses",
    response_model=List[ClauseResponse],
    summary="List Clauses for Standard",
    description="Retrieve all segmented clauses and requirement mappings for an Indian Standard.",
)
async def get_standard_clauses(
    standard_id: str,
    db: AsyncSession = Depends(get_db),
):
    try:
        stmt = (
            select(Clause)
            .where(Clause.standard_id == standard_id)
            .options(selectinload(Clause.requirements))
            .order_by(Clause.clause_number)
        )
        result = await db.execute(stmt)
        return result.scalars().all()
    except Exception as exc:
        logger.warning(f"Standard clauses database notice: {exc}")
        return []


@router.get(
    "/clauses/{clause_id}",
    response_model=ClauseResponse,
    summary="Get Granular Clause by ID",
    description="Retrieve exact text, page provenance, and requirement criteria for a single clause.",
)
async def get_clause_detail(
    clause_id: str,
    db: AsyncSession = Depends(get_db),
):
    try:
        stmt = (
            select(Clause)
            .where(Clause.id == clause_id)
            .options(selectinload(Clause.requirements))
        )
        result = await db.execute(stmt)
        clause = result.scalar_one_or_none()
        if not clause:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Clause '{clause_id}' not found")
        return clause
    except HTTPException:
        raise
    except Exception as exc:
        logger.warning(f"Clause detail database notice: {exc}")
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database currently unavailable")


@router.get(
    "/documents",
    response_model=List[DocumentRegistryResponse],
    summary="List Document Registry",
    description="Retrieve all ingested source documents, SHA-256 cryptographic hashes, and verification states.",
)
async def list_documents(
    db: AsyncSession = Depends(get_db),
):
    try:
        stmt = select(Document).order_by(Document.created_at.desc())
        result = await db.execute(stmt)
        return result.scalars().all()
    except Exception as exc:
        logger.warning(f"Documents list database notice: {exc}")
        return []


@router.post(
    "/ingestion/upload",
    response_model=IngestionSummary,
    summary="Ingest Standard PDF Document",
    description="Upload a BIS Standard PDF to process layout, extract clauses/requirements, compute vectors, and register.",
)
async def upload_and_ingest_document(
    file: UploadFile = File(...),
    standard_number: Optional[str] = Form(None),
    standard_title: Optional[str] = Form(None),
    is_verified: bool = Form(True),
    db: AsyncSession = Depends(get_db),
):
    content = await file.read()
    target_path, stored_filename, file_size, file_hash = save_uploaded_file(content, file.filename)

    summary = await ingest_standard_document(
        db=db,
        file_path=target_path,
        original_filename=file.filename,
        standard_number_override=standard_number,
        standard_title_override=standard_title,
        is_verified=is_verified,
    )
    return summary
