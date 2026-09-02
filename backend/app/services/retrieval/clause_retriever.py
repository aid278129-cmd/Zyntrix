from typing import List, Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from backend.app.models.clause import Clause
from backend.app.models.standard import Standard
from backend.app.models.document import Document
from backend.app.models.source import Source
from backend.app.models.requirement import Requirement
from backend.app.services.ingestion.embedder import default_embedding_provider, cosine_similarity
from backend.app.schemas.clause import ClauseSearchResult, RequirementSchema


async def search_clauses(
    db: AsyncSession,
    query: str,
    standard_number: Optional[str] = None,
    verified_only: bool = True,
    include_unverified: bool = False,
    top_k: int = 5,
    min_score: float = 0.1,
) -> List[ClauseSearchResult]:
    """Retrieve semantically and metadata-filtered clauses with provenance citations.

    Trust enforcement: verified_only=True is the safe backend default.
    Unverified knowledge is only returned when include_unverified=True
    (developer inspection mode). Never use unverified knowledge for
    final compliance claims.
    """
    query_vector = default_embedding_provider.embed_text(query)

    # Base query joined with Standard and preloading requirements
    stmt = (
        select(Clause)
        .join(Standard, Clause.standard_id == Standard.id)
        .options(selectinload(Clause.standard), selectinload(Clause.requirements))
    )

    # Trust enforcement: backend-safe verified-only default
    if verified_only and not include_unverified:
        stmt = stmt.where(
            Clause.verification_status == "VERIFIED",
            Standard.verification_status == "VERIFIED",
            Standard.status == "ACTIVE",
        )
    elif not include_unverified:
        # Even without verified_only, exclude SUPERSEDED
        stmt = stmt.where(Standard.status.in_(["ACTIVE", "REVISED"]))

    if standard_number:
        stmt = stmt.where(Standard.standard_number == standard_number)

    result = await db.execute(stmt)
    clauses: List[Clause] = result.scalars().all()

    scored_results = []
    for c in clauses:
        clause_vector = c.embedding
        if not clause_vector:
            continue

        score = cosine_similarity(query_vector, clause_vector)
        if score >= min_score:
            scored_results.append((score, c))

    # Sort descending by similarity score
    scored_results.sort(key=lambda x: x[0], reverse=True)
    top_results = scored_results[:top_k]

    # Resolve source authority for the document chain
    search_responses: List[ClauseSearchResult] = []
    for score, c in top_results:
        std = c.standard

        # Determine source authority from document -> source chain
        source_authority = None
        if c.source_document_id:
            doc_stmt = select(Document).where(Document.id == c.source_document_id)
            doc_res = await db.execute(doc_stmt)
            doc = doc_res.scalar_one_or_none()
            if doc and doc.source_id:
                src_stmt = select(Source).where(Source.id == doc.source_id)
                src_res = await db.execute(src_stmt)
                src = src_res.scalar_one_or_none()
                if src:
                    source_authority = src.authority_level

        req_schemas = [
            RequirementSchema(
                id=r.id,
                clause_id=r.clause_id,
                code=r.code,
                requirement_type=r.requirement_type,
                description=r.description,
                measurable_condition=r.measurable_condition,
                evidence_type=r.evidence_type,
                test_method_reference=r.test_method_reference,
                interpretation_status=r.interpretation_status,
                verification_status=r.verification_status,
            )
            for r in c.requirements
        ]

        # Citation object with trust signals
        citation_obj = {
            "document_id": c.source_document_id,
            "standard_number": std.standard_number if std else "IS UNKNOWN",
            "standard_title": std.title if std else "",
            "clause_number": c.clause_number,
            "clause_title": c.title,
            "section": c.section,
            "page_number": c.page_number or c.page_start,
            "page_start": c.page_start,
            "page_end": c.page_end,
            "verification_status": c.verification_status,
            "source_authority": source_authority,
            "supporting_text": c.text_content[:500],
        }

        search_responses.append(
            ClauseSearchResult(
                clause_id=c.id,
                standard_id=c.standard_id,
                standard_number=std.standard_number if std else "IS UNKNOWN",
                standard_title=std.title if std else "",
                clause_number=c.clause_number,
                clause_title=c.title,
                section=c.section,
                page_number=c.page_number or c.page_start,
                text_content=c.text_content,
                similarity_score=round(score, 4),
                verification_status=c.verification_status,
                source_authority=source_authority,
                requirements=req_schemas,
                citation=citation_obj,
            )
        )

    return search_responses
