# Evaluation & Accuracy Framework

**Milestone**: M1 (Verified Ingestion & Benchmark Harness)  
**Author**: Team Zyntrix (SIH 26107)

---

## 1. Context & Evaluator Directives

In response to SIH evaluator feedback (*"validating the claimed accuracy, reducing dependence on LLM reasoning, and demonstrating the system with real BIS compliance cases"*), accuracy validation is designed as a core architectural discipline.

### Policy on Metrics:
- **Zero Fabricated Metrics**: No generalized claims of accuracy are made without specifying sample size and test boundaries.
- **Transparent Staging**: Clearly distinguish between initial single-case unit proof-of-concepts and multi-category statistical benchmarks.

---

## 2. Evaluation Metrics & Benchmark Status

> [!NOTE]
> **Current Benchmark Scope (M1)**: Initial pipeline verification across **1 verified reference case** (`CASE-DRINKWARE-001` for **IS 17526:2021**). 100% retrieval was achieved on the specific tested clauses in this initial harness. Broader multi-standard evaluation across a larger test corpus is ongoing.

| Evaluation Dimension | Target Metric | M1 Measured Result (N=1 Verified Case) | Benchmark Status | Target Milestone |
|---|---|---|---|---|
| **Product DNA Extraction** | Attribute Extraction Accuracy (%) | *Not measured* | Pipeline schema ready | M2 (Extraction Engine) |
| **Standard Identification** | Precision on IS Number Matching | **100% (1/1 case)** | Verified on IS 17526:2021 fixture | M1 |
| **Clause-Level Retrieval** | Recall@3 on Ground-Truth Clauses | **100% (Tested Clauses 4.2.1, 5.4 in top-3)** | Verified on initial Drinkware case | M1 |
| **Applicability Decision** | Accuracy vs QCO Gazette Matrix | *Not measured* | Rule engine in development | M2 (Deterministic rules) |
| **Citation Validity** | Unsupported Claim Rate (%) | **0% (1/1 case, all citations strictly verified)** | Contract verified | M1 (Citation Guard) |
| **System Ingestion Throughput** | Pages Processed per Second | **~12 pages/sec** | Measured locally with PyMuPDF | M1 |

---

## 3. Ground Truth Test Dataset Structure

```
data/
 ├── bis/standards/
 │    └── IS_17526_2021.pdf       # Authoritative BIS standard fixture
 ├── test_cases/
 │    └── drinkware_case_001.json # Verified ground-truth benchmark (N=1)
 └── evaluation/
```

---

## 4. Implementation Status

### [IMPLEMENTED IN M1]
- Ground-truth benchmark test case (`data/test_cases/drinkware_case_001.json`).
- Automated retrieval evaluation test harness (`backend/tests/test_evaluation_framework.py`).
- Exact matching of material (Clause 4.2.1) and thermal performance (Clause 5.4) requirements against IS 17526:2021.

### [PLANNED FOR M2 / M3]
- Expanding ground-truth suite to 10+ diverse real BIS product categories (e.g. Electrical Kettles `IS 302-2-15`, Footwear `IS 15844`, Cement, Toys) (M2).
- Large-corpus Mean Reciprocal Rank (MRR) and Recall@K benchmarking across 1,000+ clauses (M3).
