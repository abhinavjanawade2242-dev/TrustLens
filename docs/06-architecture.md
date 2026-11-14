# Stage 5: System Architecture — PhishGuard AI

**File:** `docs/06-architecture.md`  
**Problem Statement:** Problem 5 — Digital Scam & Phishing Detection System  
**Parent Specs:** `docs/03-scope.md`, `docs/05-prd.md`  

---

## 1. System Overview & Free-Tier Stack

PhishGuard AI follows a modular, decoupled architecture consisting of a lightweight React frontend, a high-performance FastAPI orchestration backend, an offline Python heuristic security layer, and an asynchronous Google Gemini 1.5 Flash integration.

```text
[ React / Vite Frontend ] (Port 5173 - Owned by Ravi)
         │  HTTP POST /api/analyze (JSON or Multipart Form)
         ▼
[ FastAPI Orchestrator ] (Port 8000 - Owned by Abhinav)
   ├── Input Normalizer & Media Router
   │      │
   │      ├── [ Image / QR Code ] ──> media_extractor.py (Owned by Adithya)
   │      │                            ├── pyzbar (Local QR Decode)
   │      │                            └── Gemini Vision (Screenshot OCR)
   │      ▼
   ├── Layer 1: Deterministic Safety Engine ──> heuristics.py (Owned by Manohar)
   │      ├── tldextract (Domain Deconstruction)
   │      ├── Levenshtein Distance (Top 50 Brand Dictionary)
   │      └── Regex Filters (IP host, subdomains, @ symbols, TLD risk)
   │      │
   │      ▼
   ├── Layer 2: Social Engineering AI Engine ──> gemini_client.py (Owned by Adithya)
   │      ├── Gemini 1.5 Flash (Google AI Studio Free Tier)
   │      └── system_prompt.md (Urgency, Impersonation & Quote Extraction)
   │      │
   │      ▼
   └── Composite Risk Synthesizer (Score Aggregation & Override Rules)
         │  HTTP 200 OK (Strict sample-threat.json schema)
         ▼
[ Explainable Threat Card & Action Plan ]
```

---

## 2. Component Specifications

### 1. Frontend Client (`frontend/`)
* **Technology:** React 18, Vite, Tailwind CSS, Lucide Icons.
* **Hosting:** Localhost during sprint; deployable to Vercel/Netlify free tiers.
* **State Management:** Reactive tab state, loading skeleton triggers, and local mock toggle (`mockData.js`).

### 2. Backend Gateway (`backend/main.py`)
* **Technology:** FastAPI, Uvicorn, Pydantic v2.
* **Responsibilities:** Request validation, CORS handling (`CORSMiddleware`), parallel execution of heuristic and AI modules, score weighting, and error shielding.

### 3. Deterministic Safety Engine (`backend/safety/heuristics.py`)
* **Technology:** Pure Python, `tldextract`, `python-Levenshtein`.
* **Latency:** <50ms.
* **Execution:** Offline, in-memory, deterministic calculations. Zero LLM involvement.

### 4. Media Ingestion & AI Engine (`backend/integrations/` & `backend/ai/`)
* **Technology:** `pyzbar`, OpenCV-Python, `google-genai` SDK (`gemini-1.5-flash`).
* **Latency:** ~1.2s to 1.8s.
* **Execution:** Async multimodal API call with automated fallback on timeout or rate limit.

---

## 3. End-to-End Request Lifecycle

1. **Submission:** User enters text/URL or uploads an image on the frontend client.
2. **Payload Dispatch:** Frontend sends `POST /api/analyze` to `http://localhost:8000`.
3. **Media Routing:** If an image is provided, `media_extractor.py` extracts embedded URLs via `pyzbar`. If no QR code exists, text is extracted via Gemini Vision OCR.
4. **Heuristic Evaluation:** `heuristics.py` parses domains, checks brand similarity via Levenshtein distance, checks structural flags, and produces `base_risk_score`.
5. **AI Evaluation:** In parallel, `gemini_client.py` evaluates psychological urgency, authority intimidation, and extracts suspicious quotes.
6. **Synthesis:** Backend combines outputs:
   * If `is_spoofed == True`, lock `threat_level = "CRITICAL"` and `risk_score >= 85`.
   * Otherwise, composite score is weighted: 40% heuristic + 60% AI intent.
7. **Response Delivery:** Server returns JSON adhering strictly to `shared/sample-threat.json` in <2.5s.
