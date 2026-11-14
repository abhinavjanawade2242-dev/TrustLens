# Stage 7: Task Breakdown & Team Ownership — PhishGuard AI

**File:** `docs/08-tasks.md`  
**Problem Statement:** Problem 5 — Digital Scam & Phishing Detection System  
**Sprint Duration:** 8–12 Hours  

---

## Task Matrix & Parallel Workflow

| Task # | Task Description | Owner | Estimated Time | Dependencies |
| :---: | :--- | :--- | :---: | :--- |
| **Task 0** | Contract Lock: Sign off on `shared/sample-threat.json` | **ALL** | 30 mins | None |
| **Task 1** | Walking Skeleton: Deploy FastAPI `/api/health` and verify UI link | **Abhinav & Ravi** | 60 mins | Task 0 |
| **Task 2a**| Frontend Screen States: Build tabs, loading radar, and threat card using mock JSON | **Ravi** | 3.5 hours | Task 0 |
| **Task 2b**| Media Ingestion: Implement QR code decoder & Gemini Vision OCR pipeline | **Adithya** | 3 hours | Task 0 |
| **Task 2c**| Deterministic Safety: Implement Levenshtein typosquatting & structural checks | **Manohar** | 3 hours | Task 0 |
| **Task 3** | Backend Core: Configure FastAPI routes, CORS middleware, and Pydantic schemas | **Abhinav** | 2.5 hours | Task 1 |
| **Task 4** | AI Engine: Implement Gemini 1.5 Flash client, system prompt, and JSON parser | **Adithya** | 2.5 hours | Task 0 |
| **Task 5** | Integration Join: Import heuristics & AI modules into `POST /api/analyze`; connect UI | **Abhinav & Ravi** | 1.5 hours | Tasks 2a, 2c, 3, 4 |
| **Task 6** | Pre-Demo Audit: Run test fixtures, test mobile view, polish 3-min pitch | **ALL** | 1.5 hours | Task 5 |

---

## Role Sign-Off Checklist
- [x] **Ravi:** Agrees to work strictly in `frontend/` on mock data until Task 5.
- [x] **Abhinav:** Agrees to keep `/api/health` and `/api/analyze` schema-locked.
- [x] **Manohar:** Agrees to build `heuristics.py` offline with zero LLM dependence.
- [x] **Adithya:** Agrees to enforce strict JSON output from Gemini and build timeout fallbacks.
