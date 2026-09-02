# BIS Knowledge Base & Knowledge Domains

**Milestone**: M0 (Engineering Foundation)  
**Author**: Team Zyntrix (SIH 26107)

---

## 1. Domain Separation

To avoid undifferentiated vector retrieval, the knowledge base is partitioned across distinct domains:
1. **Indian Standards (IS)**: Formal specifications and test methods.
2. **Quality Control Orders (QCO)**: Mandatory certification timelines and gazette notifications.
3. **Certification Schemes**: Scheme I (ISI Mark), Scheme II (CRS), Scheme IV, etc.
4. **Testing Laboratories**: NABL/BIS accredited laboratories and testing scopes.

---

## 2. Implementation Status

### [IMPLEMENTED IN M0]
- Database schema modeling `Standard`, `Clause`, `Requirement`, `StandardTest`, `Laboratory`.
- Vector store contract interface (`VectorStoreContract`).
- Health check queries verifying pgvector extension in PostgreSQL.

### [PLANNED FOR M1 / M2]
- Clause-level PDF parsing and embedding pipeline (M1).
- Hybrid retrieval (Sparse BM25 + Dense pgvector cosine similarity) (M1).
- Version tracking and amendment handling (M1).
- Synchronization with e-BIS/Manakonline (M2).
