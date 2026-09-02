# Knowledge Trust, Source Provenance & Governance Model

**Milestone**: M1.5 (Knowledge Trust & Governance Hardening)  
**Author**: Team Zyntrix (SIH Problem Statement 26107)

---

## 1. Core Architectural Axioms

1. **INGESTION ≠ VERIFICATION**: A successfully extracted PDF does not become authoritative compliance knowledge.
2. **INDEXED ≠ VERIFIED**: `ingestion_status = "INDEXED"` means the document was parsed and vectorized into the database. `verification_status = "VERIFIED"` means its regulatory authenticity and text faithfulness were confirmed via controlled verification.
3. **ZERO FABRICATION**: No BIS standard numbers, clauses, test methods, amendments, QCOs, or laboratory accreditations are ever invented.
4. **MACHINE VALIDATION vs HUMAN VERIFICATION**: Automated ingestion validates structural parseability and cryptographic checksums; human/expert review verifies legal applicability and textual authenticity.
5. **FAIL-SAFE RETRIEVAL**: Compliance claim retrieval enforces `verified_only = True` by default in the backend.

---

## 2. Source Hierarchy & Trust Classification

All knowledge ingested into the system is traced to an explicit record in the **Source Registry** (`sources` table):

| Priority | Source Type | Authority Level | Description | Permitted Role in System |
|---|---|---|---|---|
| **1 (Highest)** | `BIS_OFFICIAL` | `AUTHORITATIVE` | Official BIS gazette publication, Manakonline repository, BIS sales portal. | May establish verified compliance criteria. |
| **2** | `GOVERNMENT_OFFICIAL` | `AUTHORITATIVE` | Ministry of Consumer Affairs, DPIIT, MeitY gazette notifications. | May establish QCO enforcement dates and regulatory mandates. |
| **3** | `SUPPORTING` | `SUPPORTING` | NABL test report formats, accredited laboratory testing manuals. | May support test method procedures; cannot override standard text. |
| **4** | `SECONDARY` | `SECONDARY` | Industry whitepapers, commentary, trade association summaries. | Discovery and educational guidance only; **CANNOT** establish compliance. |
| **5 (Lowest)** | `USER_PROVIDED` | `UNVERIFIED` | Locally generated sample fixtures, user-uploaded PDFs, external notes. | Initial pipeline validation only; **MUST BE FLAGGED REQUIRES_REVIEW**. |

---

## 3. Two-Dimensional Knowledge Lifecycle

Knowledge entities progress through two completely decoupled status axes:

### A. Ingestion State (`ingestion_status`)
Tracks mechanical pipeline execution:
- `DISCOVERED`: File identified or uploaded.
- `DOWNLOADED`: Saved to local secured storage with calculated SHA-256 hash.
- `EXTRACTED`: PyMuPDF layout-aware text parsed with OCR fallback if necessary.
- `SEGMENTED`: Hierarchical clause boundaries and parent-child links identified.
- `INDEXED`: Text requirements extracted and 384-dimensional dense embeddings stored.
- `FAILED`: Ingestion halted due to corrupt file, encrypted PDF, or missing text.

### B. Trust State (`verification_status`)
Tracks legal and regulatory auditability:
- `UNVERIFIED`: Ingested mechanically, but source authority has not been authenticated. Default for newly discovered or user-supplied documents.
- `PROCESSING`: Under active verification workflow.
- `REQUIRES_REVIEW`: Ambiguous clause segmentation, non-authoritative fixture, or amendment with unspecified affected clauses.
- `VERIFIED`: Confirmed against authoritative BIS or official government source.
- `SUPERSEDED`: Historical edition/revision preserved for audit traceability, but excluded from current compliance baselines.

---

## 4. Controlled Verification Audit Trail (`VerificationRecord`)

Every verification action generates an immutable audit record:

```json
{
  "entity_type": "document",
  "entity_id": "doc-uuid-12345",
  "verification_status": "REQUIRES_REVIEW",
  "verified_by": "SYSTEM_PIPELINE",
  "verification_method": "MACHINE_VALIDATION",
  "source_authority": "USER_PROVIDED",
  "document_hash": "3d9f1a28bc894e77ef94c01289bcaef1983274cb912384aefc910398457291aa",
  "notes": "Machine validation: PDF readable, 4 pages extracted, 20 clauses segmented. Not verified against authentic BIS publication."
}
```

### Verification Methods:
- `MACHINE_VALIDATION`: Performed automatically by ingestion pipeline (checksum, PDF readability, page counts, clause counts).
- `SOURCE_VERIFICATION`: Cross-referenced against authenticated publisher source URL and gazette release.
- `HUMAN_REVIEW`: Certified by regulatory compliance officer or domain engineer.

---

## 5. Regulatory Instrument (QCO) Decoupling

A standard's existence does **not** make it legally mandatory. The system decouples:
- **`Standard`**: Technical engineering specification (scope, clauses, test methods).
- **`RegulatoryInstrument`**: Quality Control Orders (QCO) and Compulsory Registration Scheme (CRS) notifications issued by central ministries.

Mandatory status requires a verified `RegulatoryInstrument` with:
- Gazette notification number (e.g. `S.O. 4521(E)`)
- Gazette notification date
- Implementation effective date
- Explicit product scope definition

If a QCO relationship cannot be verified against an official gazette, it is marked `REQUIRES_REVIEW`.

---

## 6. Standard Versioning & Amendment Architecture

```
Logical Standard (IS 17526)
       │
       ├── Edition 1 (2018) ──(Status: SUPERSEDED, superseded_by: IS 17526:2021)
       │
       └── Edition 2 (2021) ──(Status: ACTIVE, supersedes: IS 17526:2018)
               │
               ├── Amendment No. 1 (2022) ──(Affected Clauses: 4.2.1, 5.4)
               └── QCO S.O. 4521(E) ───────(Mandatory from: 2024-04-01)
```

- Amendments are tracked as independent entities (`amendments` table) linked to the parent standard.
- Amendment text is **never blindly merged** into the base standard; affected clauses and effective dates are explicitly recorded.
- Superseded standards remain accessible for historical audit (e.g., verifying a product manufactured under an earlier edition) but are excluded from active compliance baselines.

---

## 7. Verified-Only Retrieval Enforcement

The retrieval engine (`clause_retriever.py`) enforces strict backend safety:
```python
if verified_only and not include_unverified:
    stmt = stmt.where(
        Clause.verification_status == "VERIFIED",
        Standard.verification_status == "VERIFIED",
        Standard.status == "ACTIVE",
    )
```
- Unverified knowledge can **never** be retrieved during active compliance evaluation.
- `include_unverified = True` is restricted to internal developer inspection and data auditing modes.
- Every retrieval result exposes `verification_status` and `source_authority` directly in the payload.

---

## 8. Current IS 17526:2021 Fixture Provenance Status

- **File**: `data/bis/standards/IS_17526_2021.pdf`
- **Origin**: Programmatically generated by `backend/scripts/generate_standard_fixture.py` using representative text from public drinkware standards.
- **Source Authority**: `USER_PROVIDED` (Authority Level: `UNVERIFIED`).
- **Trust State**: **`REQUIRES_REVIEW`** (Updated in M1.5).
- **Audit Note**: Structurally accurate for pipeline evaluation; requires authentic BIS source verification before use in live regulatory compliance decisions.
