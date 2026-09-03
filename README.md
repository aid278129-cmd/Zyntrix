# Zyntrix: BIS Compliance Compiler

**Team**: Zyntrix  
**SIH Problem Statement**: 26107  
**Problem Statement Title**: *“AI-powered Intelligent Assistant for Indian Standards and BIS Services for Industries and Consumers”*  
**Category**: Software | **Theme**: Smart Automation  
**Current State**: **Production-Grade Architecture (Layers 1 → 7 Verified & Tested)**

---

## 1. Executive Summary

**Zyntrix** is an evidence-first, deterministic regulatory intelligence compiler that converts complex Indian Standards (IS), Quality Control Orders (QCOs), Scheme of Inspection and Testing (STI), Bill of Materials (BOM), laboratory test reports, and factory datasheets into auditable, legally defensible compliance determinations.

### Cardinal Regulatory Invariants
```
1. CLAUSE RETRIEVED ≠ REQUIREMENT SATISFIED
2. PRODUCT FACT ≠ COMPLIANCE EVIDENCE
3. USER CLAIM ≠ COMPLIANCE EVIDENCE
4. NO VERIFIED EVIDENCE → NO SATISFIED
5. NO DETERMINISTIC PASS → NO SATISFIED
6. CONFLICT → EXPERT REVIEW
7. LLM COMPLIANCE AUTHORITY = 0.0%
```

### Core Engineering Invariants
- **Zero Hallucination Compliance**: The LLM is restricted to explanation, query translation, and entity extraction. It possesses **0.0% compliance decision authority**. All compliance determinations are made exclusively by deterministic mathematical rule engines.
- **Strict Evidence Gating**: A claim or product specification alone never satisfies a regulatory standard. A status of `SATISFIED` strictly requires:
  $$\text{Verified Requirement} \wedge \text{Verified Evidence} \wedge \text{Requirement-Evidence Link} \wedge \text{Deterministic Pass} \wedge \neg\text{Conflict} = \mathbf{SATISFIED}$$
- **Honest Compliance Counts**: Regulatory compliance cannot be reduced to an arbitrary percentage score. We report honest count distributions: `Satisfied`, `Potentially Satisfied`, `Missing Evidence`, `More Information Required`, `Potential Gap`, `Conflicting Evidence`, and `Expert Review Required`.
- **Zero-Guessing Clarification Loop**: When critical specifications are missing or ambiguous, Zyntrix halts automated assumptions, creates clarification items, and engages the user before downstream decisions are rendered.

---

## 2. Multi-Layer Production Architecture

Zyntrix implements an 8-layer architecture aligned with the Smart India Hackathon specification:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  LAYER 1: GUIDED MULTI-MODAL INPUT & DOCUMENT PREPARATION                   │
│  - PDF, Image/OCR, Voice STT, BOM, Manual Specifications                    │
│  - Document Readiness Checklists & Dynamic Downloadable Templates           │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│  LAYER 2: DETERMINISTIC PRODUCT DNA EXTRACTION & NORMALIZATION               │
│  - Structured Technical Fact Extraction, Unit Normalization, Provenance     │
│  - Missing & Conflicting Fact Detection with Clarification Queue            │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│  LAYER 3: AI ORCHESTRATOR & CITATION GUARD                                  │
│  - Single LLM Discipline (Intent Parsing, Formatting, Context Explanation)  │
│  - Anti-Hallucination Citation Guard & Fallback Safeguards                  │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│  LAYER 4: SEGMENTED BIS KNOWLEDGE BASE                                      │
│  - Standard Knowledge Packages (Scope, QCOs, STI, Requirements, Tests)      │
│  - Dual Lexical BM25 + Vector Retrieval & Gazette Source Validation         │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│  LAYER 5: DETERMINISTIC APPLICABILITY ENGINE                                │
│  - Declarative Rule Matching & Statutory QCO Verification                   │
│  - 7 Canonical States (APPLICABLE, POTENTIALLY_APPLICABLE, GAPS, etc.)      │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│  LAYER 6: CLAUSE-LEVEL RAG (STANDARD-ISOLATED)                              │
│  - Standard Isolation Lock (Zero Cross-Standard Leakage)                    │
│  - Hybrid Retrieval + Exact Reranking + Parent-Child Clause Hierarchies     │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│  LAYER 7: COMPLIANCE GAP ANALYSIS ENGINE                                    │
│  - Mathematical Formula Evaluator, Unit Normalization, Range/Limit Checks   │
│  - 8 Canonical Statuses & 4 Recommended Actions                             │
│  - Deterministic Gap Register (CRITICAL, HIGH, MEDIUM, LOW)                 │
│  - 5-Bucket Testing Roadmap (Lab, Document, Spec, Photo, Expert Review)     │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Layer-by-Layer Technical Breakdown

### Layer 1: Guided Multi-Modal Input & Preparation
- **Supported Formats**: PDF datasheets, high-resolution images (OCR), Audio/Voice STT, Excel/CSV BOMs, and raw manual text.
- **Readiness Checklists**: Dynamically generates required vs. optional field checklists based on verified BIS standards before submission.
- **Template Generator**: Generates fillable templates for manufacturers lacking structured test documentation.

### Layer 2: Product DNA Engine
- **Field Structure**: Every fact records `field_name`, `value`, `normalized_unit`, `source`, `provenance_type` (`USER_CLAIM`, `DOCUMENT_FACT`, `USER_CLARIFICATION`), `confidence`, and `verification_state`.
- **Normalization**: Handles imperial to metric conversions (°F to °C, L to mL, inches to mm) without data distortion.
- **Clarification Queue**: Automatically pauses assessment when essential attributes (e.g., vacuum insulation, wattage, material grade) are missing.

### Layer 3: AI Orchestrator & Citation Guard
- **Single LLM Enforcement**: Strictly one LLM is utilized for intent understanding, entity extraction, and conversational synthesis.
- **Citation Guard**: Verifies that every clause mentioned in LLM explanations exists verbatim in the verified BIS knowledge repository; rejects fabricated clauses.

### Layer 4: Segmented BIS Knowledge Base
- **Knowledge Packaging**: Packages Indian Standards into structured sections: Scope, QCO Mandate, STI Sampling, Requirements, Test Methods, and Marking Requirements.
- **Repository**: Features full gazette coverage for domestic vacuum flasks (**IS 17526:2021**), electrical immersion heaters (**IS 302-2-201:2008**), protective helmets (**IS 4151:2015**), and toy safety (**IS 9873:Part 1**).

### Layer 5: Deterministic Applicability Engine
- **Decision Engine**: Matches Product DNA features against declarative JSON applicability rules.
- **Canonical Decision States**:
  1. `APPLICABLE`: Conclusively under standard and mandatory QCO scope.
  2. `POTENTIALLY_APPLICABLE`: Likely applicable; minor attribute needs confirmation.
  3. `MORE_INFORMATION_REQUIRED`: Missing crucial technical dimension or material.
  4. `NOT_APPLICABLE`: Explicitly excluded by standard scope.
  5. `COVERAGE_GAP`: Product category identified but lacks formal standard coverage.
  6. `CONFLICTING_RULES`: Overlapping contradictory regulatory mandates detected.
  7. `EXPERT_REVIEW_REQUIRED`: Novel edge cases requiring legal/technical review.

### Layer 6: Clause-Level RAG
- **Standard Isolation Lock**: Strictly restricts retrieval to clauses belonging exclusively to the target standard.
- **Hybrid Retrieval**: Combines dense semantic vector search with lexical BM25 token matching, boosted by exact clause number reranking.
- **Hierarchical Resolution**: Reconstructs complete parent-child clause context (e.g., Section 4 -> Clause 4.2 -> Clause 4.2.1).

### Layer 7: Compliance Gap Analysis Engine
- **Deterministic Comparator**: Evaluates evidence parameters against standard requirements using explicit mathematical operators (`>=`, `<=`, `==`, `RANGE`).
- **Safety Guards**:
  - **Wrong-Standard Guard**: Rejects test reports citing incorrect standards.
  - **Freshness Guard**: Rejects expired test reports or lapsed certifications.
  - **Conflict Guard**: Detects contradictory test values and routes them to expert review.
- **Gap Register Prioritization**:
  - `CRITICAL`: Life safety, electric shock hazards (IS 302 Cl 8.1, 13.2), toy choking risks (IS 9873 Cl 4.4), chemical toxicity.
  - `HIGH`: Thermal retention failure (IS 17526 Cl 5.4), drop impact rupture (Cl 5.3), material grade deficiency (Cl 4.2.1).
  - `MEDIUM`: Hydrostatic inversion leakage (Cl 5.2), ISI marking layout (Cl 7.1), dimensional deviations.
  - `LOW`: Cosmetic finish, user manual wording, care instructions.
- **Testing Roadmap Categorization**:
  1. `LAB_TEST_REQUIRED`: Physical testing required at an accredited laboratory.
  2. `DOCUMENT_REQUIRED`: Official certificates or migration test proofs required.
  3. `MANUFACTURER_SPECIFICATION_REQUIRED`: Technical declarations needed from engineering.
  4. `PHOTO_MARKING_EVIDENCE_REQUIRED`: Artwork inspection of product packaging and ISI mark layout.
  5. `EXPERT_REVIEW_REQUIRED`: Contradictory evidence requiring manual expert adjudication.

---

## 4. Quick Start Guide

### Prerequisites
- **Python**: 3.10, 3.11, 3.12, 3.13, or 3.14
- **Node.js**: 18+ or 20+ with `npm`
- **Git**

---

### Step 1: Clone Repository
```bash
git clone https://github.com/aid278129-cmd/Zyntrix.git
cd Zyntrix
```

---

### Step 2: Backend Setup
1. **Install Python Dependencies**:
   ```bash
   python -m pip install -r requirements.txt
   ```

2. **Run Backend Test Suite**:
   ```bash
   python -m pytest backend/tests -q
   ```
   *(All 251 tests will pass cleanly).*

3. **Start FastAPI Gateway**:
   ```bash
   python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
   ```
   - Interactive Swagger API: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
   - Interactive ReDoc: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

---

### Step 3: Frontend Setup
1. **Navigate to Frontend Directory**:
   ```bash
   cd frontend
   npm install
   ```

2. **Verify Frontend Build**:
   ```bash
   npm run build
   ```

3. **Launch Vite Development Server**:
   ```bash
   npm run dev
   ```
   - Open browser to: [http://localhost:5173](http://localhost:5173)
   - The Vite dev proxy routes all `/api` and `/health` requests to `http://127.0.0.1:8000`.

---

## 5. Testing & Verification

Zyntrix includes comprehensive test suites across all architectural layers:

```bash
# Run complete test suite (251 tests)
python -m pytest backend/tests/ -q

# Run Layer 1 Production Tests (Input Processing & STT)
python -m pytest backend/tests/test_layer1_production.py -q

# Run Layer 2 Production Tests (Product DNA & Normalization)
python -m pytest backend/tests/test_layer2_production.py -q

# Run Layer 3 Production Tests (AI Orchestrator & Citation Guard)
python -m pytest backend/tests/test_layer3_production.py -q

# Run Layer 4 Production Tests (Segmented BIS Knowledge Base)
python -m pytest backend/tests/test_layer4_production.py -q

# Run Layer 5 Production Tests (Deterministic Applicability)
python -m pytest backend/tests/test_layer5_production.py -q

# Run Layer 6 Production Tests (Clause-Level RAG)
python -m pytest backend/tests/test_layer6_production.py -q

# Run Layer 7 Production Tests (Compliance Gap Analysis Engine)
python -m pytest backend/tests/test_layer7_production.py -q
```

### Test Results
```
============================= 251 passed in 1.65s =============================
```

---

## 6. Key API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/gap-analysis/evaluate` | Executes Layer 7 deterministic gap analysis and roadmap generation |
| `GET` | `/api/gap-analysis/invariants` | Retrieves cardinal regulatory invariants and priority definitions |
| `POST` | `/api/rag/search` | Performs standard-isolated Clause-Level RAG retrieval |
| `POST` | `/api/rag/explain-clause` | Synthesizes grounded natural-language explanations with citation guard |
| `POST` | `/api/applicability/evaluate` | Evaluates standards applicability from Product DNA |
| `POST` | `/api/products/extract-dna` | Extracts structured technical facts from multi-modal inputs |
| `GET` | `/api/knowledge/standards` | Retrieves verified Indian Standards and QCO metadata |
| `GET` | `/health` | Real-time system health and diagnostic ping |

---

## 7. License & Hackathon Attribution

Developed for the **Smart India Hackathon (SIH 2024 / Problem 26107)** by **Team Zyntrix**.  
*All regulatory logic, knowledge representations, and source code are strictly engineered for transparency, auditable reproducibility, and zero hallucination.*
