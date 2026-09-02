# Evaluation & Accuracy Framework

**Milestone**: M0 (Engineering Foundation)  
**Author**: Team Zyntrix (SIH 26107)

---

## 1. Context & Evaluator Directives

In response to SIH evaluator feedback (*"validating the claimed accuracy, reducing dependence on LLM reasoning, and demonstrating the system with real BIS compliance cases"*), accuracy validation is designed as a core architectural discipline, not an afterthought.

### Policy on Metrics:
**Zero Fabricated Metrics**: No accuracy numbers are claimed or published until verified against actual test cases and ground-truth benchmark datasets.

---

## 2. Evaluation Metrics Framework

| Evaluation Dimension | Target Metric | M0 Status | Target Milestone |
|---|---|---|---|
| **Product DNA Extraction** | Attribute Extraction Accuracy (%) | *Not measured* | M1 (Benchmark dataset) |
| **Standard Identification** | Precision / Recall on IS Number Matching | *Not measured* | M1 (BIS Standard Suite) |
| **Clause-Level Retrieval** | Recall@K, Mean Reciprocal Rank (MRR) | *Not measured* | M1 (Vector search tests) |
| **Applicability Decision** | Accuracy vs Ground Truth QCO Matrix | *Not measured* | M1 (Deterministic rules) |
| **Citation Validity** | Unsupported Claim Rate (%) | *Not measured* | M1 (Citation Guard NLI) |
| **System Latency** | P95 Pipeline Latency (ms) | *Not measured* | M1 (Load testing) |

---

## 3. Ground Truth Test Dataset Structure

The repository structure reserves directories for real test cases:
```
data/
 ├── standards/    # Real BIS Indian Standards PDFs & extracted ground truth
 ├── test_cases/   # Real manufacturer specifications (e.g. Drinkware, Footwear, Electronics)
 └── fixtures/     # Deterministic evaluation test sets
```

---

## 4. Implementation Status

### [IMPLEMENTED IN M0]
- Test suite architecture (`tests/unit`, `tests/integration`, `tests/evaluation`).
- Core Pydantic validation and schema test suites passing.
- Architectural framework defining metric definitions without fabricated numbers.

### [PLANNED FOR M1 / M2]
- Execution of automated benchmark runner against 10 real BIS compliance test cases (M1).
- Unsupported claim detection benchmarking (M1).
