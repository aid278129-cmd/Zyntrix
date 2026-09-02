# BIS Compliance Compiler

**Team**: Zyntrix  
**SIH Problem Statement**: 26107  
**Problem Statement Title**: *“AI-powered Intelligent Assistant for Indian Standards and BIS Services for Industries and Consumers”*  
**Category**: Software | **Theme**: Smart Automation  
**Current Milestone**: **M0 (Engineering Foundation)**

---

## 1. Executive Summary

The **BIS Compliance Compiler** is an evidence-backed, explainable, and auditable intelligence platform that transforms Indian Standards (IS), Quality Control Orders (QCOs), and product specifications into structured compliance determinations.

### Core Engineering Principle
> **“LLM generates explanations; retrieved evidence establishes compliance claims.”**  
> The LLM is strictly never the final compliance authority. Every compliance decision is tied to an auditable provenance chain from authoritative standard clauses to validated laboratory/manufacturer evidence.

---

## 2. Milestone M0 Implementation Status

| Component | Status | Description |
|---|---|---|
| **FastAPI Backend Gateway** | **IMPLEMENTED (M0)** | Async Python 3.14/FastAPI service with Request-ID tracing, CORS, security validation, and health checks |
| **PostgreSQL & pgvector** | **IMPLEMENTED (M0)** | SQLAlchemy 2.0 ORM base models for 12 domain entities, vector extension health verification |
| **Product DNA Schemas** | **IMPLEMENTED (M0)** | Extensible Pydantic schema with attribute-level provenance and zero-guessing clarification requirements |
| **Citation Guard Contract** | **IMPLEMENTED (M0)** | Verifiable citation schemas and multi-state compliance/applicability enums |
| **React Frontend Shell** | **IMPLEMENTED (M0)** | React 18, Vite, Tailwind CSS with real-time diagnostic connectivity testing |
| **Docker Compose** | **IMPLEMENTED (M0)** | Multi-service definition for PostgreSQL 16 + pgvector (`pgvector/pgvector:pg16`), backend, and frontend |
| **Testing Suite** | **IMPLEMENTED (M0)** | Pytest test suite covering endpoints, schema contracts, security, and logging |
| **Document Ingestion & RAG** | *PLANNED (M1)* | Clause-level PyMuPDF document parser and embedding pipeline |
| **Deterministic Rule Engine** | *PLANNED (M1)* | Rule-based applicability mapping (`APP-xxx`) |
| **Evidence Graph Canvas** | *PLANNED (M1)* | Interactive React Flow visual provenance graph |

---

## 3. Architecture Overview

```
Raw Product Input / Datasheet
              ↓
    Product DNA Extraction (Structured Pydantic Model)
              ↓
  Deterministic Applicability Engine (Rules + QCO Mapping)
              ↓
   Clause-Level Retrieval (PostgreSQL + pgvector)
              ↓
 Citation Guard Trust Layer (Evidence Validation & Cross-Checking)
              ↓
   Compliance Passport & Explainable Provenance Graph
```

---

## 4. Getting Started

### Prerequisites
- Python 3.12+ (or 3.14)
- Node.js 20+ & npm 10+
- Docker & Docker Compose (optional for containerized deployment)

### Local Development Setup

#### Backend
```powershell
# Navigate to repository root
python -m pip install -r backend/requirements.txt

# Run test suite
python -m pytest backend/tests -v

# Start FastAPI development server
python -m uvicorn backend.app.main:app --reload --port 8000
```

#### Frontend
```powershell
# Navigate to frontend directory
cd frontend
npm install
npm run dev
```
Frontend runs on: `http://localhost:5173`  
Backend API runs on: `http://localhost:8000` (Docs: `http://localhost:8000/docs`)

---

## 5. System Health Endpoints

- `GET /health` : Overall service health (API, database, pgvector)
- `GET /health/db` : Direct PostgreSQL connectivity check
- `GET /health/vector` : pgvector extension status
- `GET /api/v1/system/info` : Architectural state and module readiness
