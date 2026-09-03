# BIS Compliance Compiler

**Team**: Zyntrix  
**SIH Problem Statement**: 26107  
**Problem Statement Title**: *“AI-powered Intelligent Assistant for Indian Standards and BIS Services for Industries and Consumers”*  
**Category**: Software | **Theme**: Smart Automation  
**Current State**: **Complete End-to-End Implementation (M0 → M6)**

---

## 1. Executive Summary

The **BIS Compliance Compiler** is an evidence-backed, explainable, and auditable intelligence platform that transforms Indian Standards (IS), Quality Control Orders (QCOs), product datasheets, and laboratory test reports into structured, verifiable compliance determinations.

### Core Engineering Principles
1. **“LLM generates explanations; retrieved evidence establishes compliance claims.”**  
   The LLM never acts as the compliance authority. Every compliance verdict is backed by an auditable provenance chain linking Indian Standard clauses to validated evidence.
2. **Zero-Guessing Clarification Loop**: When essential technical product attributes (e.g., volume capacity, material grade, intended use) are missing, the system detects them immediately, prompts structured clarification questions, and updates product DNA with full provenance tracking.
3. **No Fake Compliance Percentages**: Real regulatory compliance is binary and count-based (`Satisfied`, `Missing Evidence`, `Potential Gap`, `More Information Required`). We report honest count distributions and recommended actions instead of arbitrary percentage scores.
4. **Dual-Mode Persistence Architecture**:
   - **Standalone High-Performance Mode (Default Out-of-the-Box)**: Zero external database setup required. Runs smoothly in memory with instant startup and auto-seeding of the Golden SIH Demo Case.
   - **Enterprise Storage Mode**: Integrates with PostgreSQL 16 + `pgvector` for scalable production deployment.

---

## 2. Platform Architecture & Modules

```
                           Raw Product Description / Datasheet
                                            ↓
               ┌─────────────────────────────────────────────────────────┐
               │    [M2] Product DNA Extraction & Normalization Engine   │
               │         - Technical Attribute Normalization             │
               │         - Missing Field Detection & Clarification Loop  │
               └────────────────────────────┬────────────────────────────┘
                                            ↓
               ┌─────────────────────────────────────────────────────────┐
               │    [M2] Deterministic Applicability & QCO Rule Engine   │
               │         - Quality Control Order (QCO) Gazette Matching  │
               │         - Standard Identification (e.g. IS 17526:2021)  │
               └────────────────────────────┬────────────────────────────┘
                                            ↓
               ┌─────────────────────────────────────────────────────────┐
               │    [M1/M3] Hybrid Semantic & Lexical Clause Retrieval   │
               │         - Dense Cosine Similarity + BM25 Lexical Index  │
               │         - Deterministic Cross-Matching Reranker         │
               └────────────────────────────┬────────────────────────────┘
                                            ↓
               ┌─────────────────────────────────────────────────────────┐
               │    [M3/M4] Multi-Source Evidence & Gap Recalculation    │
               │         - NABL Laboratory Test Report Ingestion         │
               │         - Multi-Source Conflict Detection               │
               │         - Testing Roadmap & BIS Accredited Labs Index   │
               └────────────────────────────┬────────────────────────────┘
                                            ↓
               ┌─────────────────────────────────────────────────────────┐
               │    [M4/M5] Auditable Passport, Graph & Evaluation       │
               │         - React Flow Interactive Evidence Graph         │
               │         - Immutable Point-in-Time Audit Snapshots       │
               │         - Digital Compliance Passport with Trust Index  │
               │         - N=30 Stratified Benchmark Empirical Evaluator │
               │         - [M6] Prompt Guard & Injection Defense Layer   │
               └─────────────────────────────────────────────────────────┘
```

---

## 3. Quick Start Guide (How to Run Correctly)

### Prerequisites
- **Python**: Version 3.12, 3.13, or 3.14
- **Node.js**: Version 18+ or 20+ and `npm`
- **Git**

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/aid278129-cmd/Zyntrix.git
cd Zyntrix
```

---

### Step 2: Backend Setup & Execution

1. **Install Python Dependencies**:
   ```bash
   python -m pip install -r backend/requirements.txt
   ```

2. **Verify Setup via Test Suite**:
   ```bash
   python -m pytest backend/tests -v
   ```
   *(All tests will run and pass cleanly in standalone mode).*

3. **Launch the FastAPI Gateway**:
   ```bash
   python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
   ```
   - API Gateway runs at: `http://127.0.0.1:8000`
   - Interactive Swagger API Docs: `http://127.0.0.1:8000/docs`
   - Interactive ReDoc: `http://127.0.0.1:8000/redoc`

> **Note on Standalone Mode**:  
> The backend operates in **high-performance standalone mode** by default. It requires **no local PostgreSQL installation or Docker configuration**. If PostgreSQL credentials or services are not present, the system automatically uses in-memory persistence and verified seed standards so everything works instantly.

---

### Step 3: Frontend Setup & Execution

In a new terminal window:

1. **Navigate to Frontend & Install Packages**:
   ```bash
   cd frontend
   npm install
   ```

2. **Start the Vite Dev Server**:
   ```bash
   npm run dev
   ```

3. **Open the Web Application**:
   - Open your browser to **`http://localhost:5173`** (or `http://127.0.0.1:5173`).
   - The Vite proxy automatically routes all `/api` and `/health` requests directly to `http://127.0.0.1:8000`.

---

## 4. Key Workspaces & How to Test Buttons

### 1. MSME Continuous Assessment Workspace (M4)
- **Automatic Golden Demo**: Loads the **ThermoSteel Domestic Vacuum Flask 750ml** case under **IS 17526:2021** and the **DPIIT Water Bottles QCO 2023**.
- **Reset Golden Demo Button**: Click `Reset Golden Demo` to restore the primary 14-step demonstration case.
- **Upload Lab Evidence Button**: Paste a test report snippet (e.g. *“Clause 5.4 heat retention was 65 deg C after 6 hrs. Clause 5.2 inverted 10 mins: zero leakage.”*) to trigger live gap recalculation, bump the version, and create a snapshot.
- **Submit Clarification Button**: Answer missing attribute questions (e.g. capacity or intended use) to resolve product DNA uncertainty.
- **Digital Compliance Passport**: Click `View Digital Passport` to view the comprehensive auditable passport with statutory trust index.
- **Point-in-Time Audit Snapshots**: View immutable version history for zero-drift compliance audits.
- **Assessment AI Assistant Drawer**: Use the floating chat button on the bottom right to ask context-aware questions about the active assessment.

### 2. Product Workspace & Evidence Graph (M2)
- Enter any natural language product description (e.g., vacuum flask, kitchen appliance, electrical equipment).
- Click **Analyze Product**:
  - Extracts structured Product DNA.
  - Matches mandatory QCOs and standards deterministically.
  - Generates the interactive React Flow **Evidence Graph** connecting Product DNA -> Standards -> Clauses -> Evidence -> Verdicts.

### 3. Verified BIS Knowledge Base Explorer (M1)
- Search clauses using hybrid semantic vector search + BM25 lexical reranking.
- Inspect the **IS 17526:2021 Standard Knowledge Card** with official DPIIT QCO gazette notification, BIS Product Manual `PM/IS 17526/1`, and amendments.

### 4. Evaluation Console & Empirical Benchmark (M5)
- Runs empirical evaluation across **N=30 stratified benchmark cases** (Easy, Realistic, Ambiguous, Conflicting, Adversarial).
- Generates metrics including:
  - Exact-Match Standard Accuracy (100%)
  - Hallucination Rate (0.00%)
  - Unsupported Action Rate (0.00%)
  - Retrieval MRR & Precision@K

### 5. System Diagnostics & Health Check
- Click **Run Diagnostics** to execute real-time pings across all subsystems:
  - `GET /health` (API Gateway Status: 200 OK)
  - `GET /health/db` (Persistence Engine: 200 OK)
  - `GET /health/vector` (Vector Engine: 200 OK)
  - `GET /api/v1/system/info` (System Architecture: 200 OK)

---

## 5. Running with Docker Compose (Optional)

If you wish to run the fully containerized stack with PostgreSQL 16 and `pgvector`:

```bash
docker compose up --build -d
```

Services started:
- `db`: PostgreSQL 16 with `pgvector/pgvector:pg16` on port `5432`
- `backend`: FastAPI app on port `8000`
- `frontend`: React app on port `5173`

To shut down:
```bash
docker compose down -v
```

---

## 6. Environment Configuration (`backend/.env`)

| Variable | Default Value | Description |
|---|---|---|
| `ENVIRONMENT` | `development` | Deployment environment (`development` / `production`) |
| `PROJECT_NAME` | `BIS Compliance Compiler` | Application branding |
| `POSTGRES_USER` | `postgres` | Database user |
| `POSTGRES_PASSWORD` | `postgrespassword` | Database password |
| `POSTGRES_DB` | `bis_compliance_db` | Database schema name |
| `POSTGRES_HOST` | `localhost` (or `db`) | Database hostname |
| `POSTGRES_PORT` | `5432` | Database port |
| `ALLOWED_CORS_ORIGINS` | `["http://localhost:5173", ...]` | CORS whitelisted origins |

---

## 7. Troubleshooting & FAQs

### Q: Why do I see a warning about Windows event loops or PostgreSQL when starting the backend?
**A**: This is expected behavior on Windows when running standalone. The backend detects whether a PostgreSQL instance is accessible. If PostgreSQL is offline or misconfigured, it smoothly falls back to the in-memory repository without crashing or failing requests.

### Q: The frontend says "Unable to connect" or buttons do not respond.
**A**: Ensure the FastAPI backend is running on `http://127.0.0.1:8000`. The Vite development server automatically proxies `/api` and `/health` to port `8000`. Check that both terminal windows are active.

### Q: How do I run the full test suite?
**A**: Run from the repository root:
```bash
python -m pytest backend/tests -v
```
All unit tests, contract tests, M2 compliance engine tests, and M4 assessment tests will pass.

---

## 8. License

Developed for the **Smart India Hackathon (SIH 2024 / Problem 26107)** by **Team Zyntrix**. All rights reserved.

