# BIS Knowledge Base Architecture & Standards Model

**Milestone**: M1 (Verified BIS Knowledge Base)  
**Author**: Team Zyntrix (SIH 26107)

---

## 1. Domain Separation & Trust Model

The BIS Compliance Compiler maintains strict trust boundaries across distinct knowledge domains:
1. **Indian Standards (IS)**: Official specifications and methods of test (e.g. `IS 17526:2021`).
2. **Quality Control Orders (QCO)**: Mandatory certification timelines and gazette notifications.
3. **Certification Schemes**: Scheme I (ISI Mark), Scheme II (CRS), Scheme IV, etc.
4. **Testing Laboratories**: NABL/BIS accredited laboratories and testing capabilities.

### Trust States:
- `VERIFIED`: Document and clauses extracted from authentic, authoritative BIS source.
- `UNVERIFIED`: Secondary or user-provided reference requiring verification.
- `PROCESSING`: Ingestion pipeline currently extracting/segmenting.
- `SUPERSEDED`: Historical edition/revision preserved for audit, but not used as current active compliance baseline.
- `REQUIRES_REVIEW`: Uncertain clause segmentation or ambiguous requirement interpretation.

---

## 2. Ingested Demonstration Material

### Demonstration Category:
**Drinkware & Food Contact Containers** (Mandatory Quality Control Order)

### Ingested Standard:
- **Standard Number**: `IS 17526:2021`
- **Title**: *Commercial Beverage Coolers and Insulated Flasks — Specification*
- **Source File**: `data/bis/standards/IS_17526_2021.pdf`
- **SHA-256 Hash**: Tracked in document registry.
- **Pages**: 4
- **Key Clauses Ingested**:
  - `Clause 1.1`: Scope & applicability to insulated flasks and beverage containers.
  - `Clause 4.2.1`: Stainless Steel parts (Grade 304 of IS 6911, Max 0.05% Pb).
  - `Clause 4.2.2`: Polymeric components & food-grade migration limits (IS 9845, BPA-free).
  - `Clause 5.2`: Leakage test (10-minute inversion at ambient temperature).
  - `Clause 5.3`: Drop/impact resistance test (1.0m height onto concrete).
  - `Clause 5.4`: Thermal heat retention performance (>= 60°C after 6 hours).
  - `Clause 5.5`: Cold retention performance (<= 10°C after 6 hours).
  - `Clause 7.1`: Marking and product labelling specifications.
  - `Clause 7.2`: BIS ISI Certification Mark provisions under Scheme I.

---

## 3. Implementation Status

### [IMPLEMENTED IN M1]
- `Document` registry with SHA-256 checksums and duplicate prevention.
- PyMuPDF layout-aware text and page extractor with Tesseract OCR fallback.
- Hierarchical clause segmenter with parent-child linkage (`get_parent_clause_number`).
- Requirement classification (`MATERIAL`, `PERFORMANCE`, `SAFETY`, `MARKING`).
- `EmbeddingProvider` abstraction with deterministic local and pgvector embeddings.
- Semantic clause search API (`POST /api/v1/knowledge/search`).
- Internal Knowledge Base Explorer UI.

### [PLANNED FOR M2 / M3]
- Ingestion of additional product categories (e.g. Domestic Electrical Appliances `IS 302-2-15`, Footwear).
- Automated sync with e-BIS/Manakonline portal (M3).
- Hybrid BM25 + dense vector re-ranking (M2).
