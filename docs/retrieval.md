# Clause Retrieval Engine & Citation Object

**Milestone**: M1 (Ingestion & Knowledge Base)  
**Author**: Team Zyntrix (SIH 26107)

---

## 1. Retrieval Strategy

The clause retrieval engine performs **Metadata-Filtered Semantic Search**:
```
User / System Query (e.g. "food contact stainless steel grade 304")
              │
              ▼
    [Query Embedding (384-d normalized vector)]
              │
              ▼
    [SQL Metadata Filter] ──(WHERE verification_status = 'VERIFIED' AND status = 'ACTIVE')
              │
              ▼
    [Vector Similarity Scoring] ──(Cosine Similarity / pgvector operator)
              │
              ▼
    [Provenance Citation Packaging] ──(Standard, Clause, Page, Exact Supporting Text)
```

---

## 2. Provenance Citation Contract

Every retrieved item is structured into a `ProvenanceCitation` object compatible with M0 Citation Guard:
```json
{
  "document_id": "doc-uuid-12345",
  "standard_number": "IS 17526:2021",
  "standard_title": "Commercial Beverage Coolers and Insulated Flasks — Specification",
  "clause_number": "4.2.1",
  "clause_title": "Stainless Steel Parts",
  "section": "Section 4",
  "page_number": 2,
  "verification_status": "VERIFIED",
  "supporting_text": "All metallic parts in direct contact with liquid or food shall be manufactured from stainless steel conforming to Grade 304 of IS 6911 or superior grade."
}
```

---

## 3. Retrieval API Endpoint

`POST /api/v1/knowledge/search`
```json
{
  "query": "thermal heat retention water temperature after 6 hours",
  "standard_number": "IS 17526:2021",
  "verified_only": true,
  "top_k": 5
}
```
