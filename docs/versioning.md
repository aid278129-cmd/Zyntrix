# Standard Versioning & Amendment Handling

**Milestone**: M1 (Ingestion & Knowledge Base)  
**Author**: Team Zyntrix (SIH 26107)

---

## 1. Context & Evaluator Directives

In response to evaluator feedback (*"addressing key challenges such as ambiguous specifications, outdated standards, and complex documents"*), standard versioning is designed into the core database schema and retrieval filters:

```
[Standard Catalog]
       ├── IS 17526:2018 (Edition 1) ──(Status: SUPERSEDED)
       └── IS 17526:2021 (Edition 2) ──(Status: ACTIVE / CURRENT)
```

---

## 2. Version States & Retrieval Rules

1. **`ACTIVE` / `VERIFIED`**:
   - The authoritative current edition.
   - Automatically selected by `verified_only=True` during compliance retrieval.
2. **`SUPERSEDED`**:
   - Historical revisions and retired editions.
   - Preserved in PostgreSQL for historical audit traceability (e.g. assessing a product certified under an earlier edition).
   - Never silently returned as the active standard requirement.
3. **`WITHDRAWN`**:
   - Cancelled or replaced Indian Standards.
4. **`AMENDED`**:
   - Tracks gazetted amendment slips (`Amendment No. 1`, `Amendment No. 2`) with effective dates.
