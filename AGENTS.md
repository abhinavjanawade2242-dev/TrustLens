# AGENTS.md — Coding Agent Instructions & Architecture Rules

## 1. Project Overview & Role Ownership

PhishGuard AI (TrustLens) is a digital scam and phishing detection system built with a modular, decoupled architecture.
Every coding agent operating in this repository must strictly adhere to zone boundaries and operational guardrails.

### Role & Directory Matrix
* **Frontend Lead (Member 1 - Ravi):**
  * **Zone:** `frontend/` (`frontend/src/`, `frontend/package.json`, `frontend/vite.config.js`)
  * **Scope:** React 18, Vite dev server, Tailwind CSS themes, Lucide icons, input tabs, threat card UI, mock data toggle.
* **Backend & System Orchestrator Lead (Member 2 - Abhinav):**
  * **Zone:** `backend/` (`backend/main.py`, `backend/schemas.py`, `backend/config.py`, `backend/requirements.txt`)
  * **Scope:** FastAPI application gateway, request routing, CORS configuration, Pydantic v2 contract enforcement, and composite scoring pipeline.
* **Deterministic Safety Lead (Member 3 - Manohar):**
  * **Zone:** `backend/safety/` (`heuristics.py`, `rules.py`, `brands.py`)
  * **Scope:** Pure Python offline heuristics, brand dictionary, Levenshtein typosquatting detection, regex structural filters (<50ms latency, zero LLM dependency).
* **AI & Multimodal Ingestion Specialist (Member 4 - Adithya):**
  * **Zone:** `backend/ai/` and `backend/integrations/` (`gemini_client.py`, `system_prompt.md`, `media_extractor.py`)
  * **Scope:** Google GenAI SDK (`google-genai`), Gemini 1.5 Flash client, prompt engineering, structured JSON output, pyzbar QR decoding, PIL image preprocessing.
* **Shared / Contract Lock Zone (All Members):**
  * **Zone:** `shared/sample-threat.json`, `docs/`, `tests/`
  * **Scope:** Read-only contract invariant JSON. No modifications allowed without explicit consensus across all 4 roles.

---

## 2. Operational Guardrails for Agents

1. **Contract Invariance:**
   * All responses returned by `POST /api/analyze` must strictly conform to `shared/sample-threat.json` and `backend/schemas.py`.
   * Never rename, remove, or nest top-level keys (`scan_id`, `threat_level`, `risk_score`, `summary_verdict`, `plain_english_explanation`, `target_impersonated`, `url_analysis`, `ai_social_engineering`, `recommended_actions`, `why_dangerous`).

2. **Secrets Kept on Server:**
   * All API keys (e.g., `GEMINI_API_KEY`) and tokens must remain exclusively on the backend in `.env`.
   * Never expose private keys or environment variables to the frontend client.

3. **Graceful Degradation:**
   * If Gemini API times out, exceeds quota, or is unreachable, the backend must catch the exception and return a valid HTTP 200 payload based on offline heuristics rather than crashing with an HTTP 500 error.

4. **Composite Risk Synthesizer Formula:**
   * If `heuristics.is_spoofed == True` $\implies$ force `threat_level = "CRITICAL"` and `risk_score >= 85`.
   * Otherwise $\implies$ `composite_score = int(0.4 * heuristic_score + 0.6 * ai_score)`.

5. **Sub-2.5s Latency SLA:**
   * The complete pipeline (media extraction + heuristics + AI intent analysis) must respond in under 2.5 seconds.
   * Deterministic safety heuristics must execute in under 50 milliseconds.

6. **Testing Verification:**
   * Run `python -m pytest` before committing to verify 100% pass across all unit and contract tests.
