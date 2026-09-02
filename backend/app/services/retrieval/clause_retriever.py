from typing import List, Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from backend.app.models.clause import Clause
from backend.app.models.standard import Standard
from backend.app.models.document import Document
from backend.app.models.source import Source
from backend.app.services.ingestion.embedder import default_embedding_provider, cosine_similarity
from backend.app.services.retrieval.bm25 import BM25LexicalIndex
from backend.app.services.retrieval.reranker import default_reranker
from backend.app.schemas.clause import ClauseSearchResult, RequirementSchema


async def search_clauses(
    db: AsyncSession,
    query: str,
    standard_number: Optional[str] = None,
    verified_only: bool = True,
    include_unverified: bool = False,
    top_k: int = 5,
    min_score: float = 0.05,
    retrieval_mode: str = "HYBRID",  # HYBRID | DENSE | LEXICAL
    alpha: float = 0.5,             # Weight for lexical
    beta: float = 0.5,              # Weight for dense
    include_context: bool = True,
) -> List[ClauseSearchResult]:
    """Retrieve clauses using configurable Hybrid (BM25 Lexical + pgvector Dense) + Reranking.
    
    Pipeline:
    1. Metadata Filtering (trust enforcement, active standards, standard_number).
    2. BM25 Lexical Scoring over candidate corpus.
    3. Dense Vector Similarity Scoring.
    4. Candidate Union & Hybrid Scoring: score = alpha * norm(lexical) + beta * norm(dense).
    5. Deterministic Cross-Matching Reranker.
    6. Context window enrichment (parent clause resolution).
    """
    # 1. Metadata Filtering query joined with Standard and preloading requirements
    stmt = (
        select(Clause)
        .join(Standard, Clause.standard_id == Standard.id)
        .options(selectinload(Clause.standard), selectinload(Clause.requirements))
    )

    if verified_only and not include_unverified:
        stmt = stmt.where(
            Clause.verification_status == "VERIFIED",
            Standard.verification_status == "VERIFIED",
            Standard.status == "ACTIVE",
        )
    elif not include_unverified:
        stmt = stmt.where(Standard.status.in_(["ACTIVE", "REVISED"]))

    if standard_number:
        stmt = stmt.where(Standard.standard_number == standard_number)

    result = await db.execute(stmt)
    clauses: List[Clause] = result.scalars().all()

    if not clauses:
        return []

    # Map clauses by ID
    clause_map = {c.id: c for c in clauses}

    # 2. Dense Vector Scoring
    dense_scores: Dict[str, float] = {}
    if retrieval_mode in ("DENSE", "HYBRID"):
        query_vector = default_embedding_provider.embed_text(query)
        for c in clauses:
            if c.embedding:
                d_score = cosine_similarity(query_vector, c.embedding)
                dense_scores[c.id] = max(0.0, d_score)

    # 3. Lexical BM25 Scoring
    lexical_scores: Dict[str, float] = {}
    if retrieval_mode in ("LEXICAL", "HYBRID"):
        bm25 = BM25LexicalIndex()
        corpus = [(c.id, f"{c.clause_number} {c.title}\n{c.text_content}") for c in clauses]
        bm25.index_documents(corpus)
        raw_lex_scores = bm25.score(query)
        max_lex = max([s for _, s in raw_lex_scores], default=1.0) or 1.0
        for doc_id, score in raw_lex_scores:
            lexical_scores[doc_id] = score / max_lex  # Normalize to [0, 1]

    # 4. Candidate Union & Hybrid Score Calculation
    all_candidate_ids = set(dense_scores.keys()) | set(lexical_scores.keys())
    if not all_candidate_ids:
        # Fallback to text match if neither returned
        all_candidate_ids = set(clause_map.keys())

    candidate_dicts = []
    for cid in all_candidate_ids:
        c = clause_map[cid]
        d_val = dense_scores.get(cid, 0.0)
        l_val = lexical_scores.get(cid, 0.0)

        if retrieval_mode == "DENSE":
            comb_score = d_val
        elif retrieval_mode == "LEXICAL":
            comb_score = l_val
        else:
            comb_score = (alpha * l_val) + (beta * d_val)

        if comb_score >= min_score or retrieval_mode != "HYBRID":
            # Formulate match factors
            match_factors = {
                "exact_standard_match": standard_number == (c.standard.standard_number if c.standard else None),
                "exact_clause_mention": c.clause_number in query,
                "lexical_match_quality": "HIGH" if l_val > 0.4 else ("MEDIUM" if l_val > 0.1 else "LOW"),
                "semantic_similarity": "HIGH" if d_val > 0.7 else ("MEDIUM" if d_val > 0.4 else "LOW"),
            }

            candidate_dicts.append({
                "clause_id": c.id,
                "clause_obj": c,
                "clause_number": c.clause_number,
                "clause_title": c.title,
                "standard_number": c.standard.standard_number if c.standard else "IS UNKNOWN",
                "text_content": c.text_content,
                "dense_score": round(d_val, 4),
                "lexical_score": round(l_val, 4),
                "hybrid_score": round(comb_score, 4),
                "requirements": c.requirements,
                "match_factors": match_factors,
            })

    # 5. Reranking
    reranked = default_reranker.rerank(query, candidate_dicts)
    top_candidates = reranked[:top_k]

    # 6. Format search results with context window and citation
    search_responses: List[ClauseSearchResult] = []
    for cand in top_candidates:
        c: Clause = cand["clause_obj"]
        std = c.standard

        # Determine source authority
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

        # Context window: optionally fetch parent clause
        parent_info = None
        if include_context and c.parent_clause_id and c.parent_clause_id in clause_map:
            p = clause_map[c.parent_clause_id]
            parent_info = {
                "clause_number": p.clause_number,
                "title": p.title,
                "text_snippet": p.text_content[:200],
            }

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

        final_s = cand.get("final_score", cand["hybrid_score"])
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
                similarity_score=round(cand["dense_score"], 4),
                lexical_score=cand["lexical_score"],
                dense_score=cand["dense_score"],
                rerank_score=cand.get("rerank_score"),
                final_score=round(final_s, 4),
                retrieval_mode=retrieval_mode,
                match_factors=cand["match_factors"],
                parent_clause=parent_info,
                verification_status=c.verification_status,
                source_authority=source_authority,
                requirements=req_schemas,
                citation=citation_obj,
            )
        )

    return search_responses
