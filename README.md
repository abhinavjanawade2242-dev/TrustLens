# TrustLens — See Through the Scam 🛡️👁️

> **"Don't Trust the Message. Verify It."**  
> AI-powered phishing, scam, malicious URL, and suspicious message detection platform.

---

## 🌐 Overview
**TrustLens** is a commercial-grade cybersecurity web application built for everyday internet users, students, security analysts, and enterprise teams. It dismantles deceptive social engineering lures, typosquatted brand domains, fake urgent invoices, and adversary-in-the-middle OTP stealers with forensic precision.

---

## 🚀 Key Features

### 1. Multi-Vector Security Analysis Workspace
- **Suspicious Text & Email Forensics:** Ingest emails, SMS messages, WhatsApp chats, or urgent notices. Real-time character counter and heuristic validation.
- **Malicious URL & Domain Intelligence:** Passive destination normalization, typosquatting analysis, lookalike brand detection, homoglyph evaluation, and SSL/TLS state verification (with explicit warnings that HTTPS alone does *not* imply trustworthiness).
- **Image & Screenshot Ingestion:** Drag-and-drop file upload with preview, file size/type validation, and transparent notifications regarding backend multimodal OCR requirements.

### 2. Live Scanning Experience
- High-tech circular radar scanner with rotating sweep, concentric radar pulses, and progressive stage indicators:
  1. *Inspecting submitted content*
  2. *Checking suspicious patterns*
  3. *Evaluating social engineering signals*
  4. *Preparing threat intelligence report*
- User-controlled cancellation and truthful mode labels (differentiating live backend telemetry from local heuristic evaluation).

### 3. Comprehensive Threat Intelligence Dashboard
- **Risk Score (0 to 100)** with animated circular SVG gauge.
- **Tri-State Threat Level Badges:**
  - 🟢 **SAFE (0 - 34):** Standard baseline patterns, low coercion.
  - 🟡 **SUSPICIOUS (35 - 69):** Anomalous keywords, low-reputation domains, mild pressure.
  - 🔴 **CRITICAL (70 - 100):** High-confidence fraud, urgency coercion, active brand spoofing, or OTP harvesting.
- **Never communicates risk by color alone:** High-contrast text badges, icons, and numerical brackets are always displayed.

### 4. Signature Feature: "Why is this dangerous?"
Detailed risk decomposition breaking down:
- Artificial deadlines & psychological panic pressure
- Channel isolation directives (*"Do NOT contact support..."*)
- Credential & two-factor OTP harvesting attempts
- Deceptive apex domains and typosquatting
- Clear distinction between detected text evidence and behavioral heuristics.

### 5. Suspicious Quote Forensic Highlighter
- Displays the original text with interactive forensic markers.
- Clicking or hovering on flagged phrases displays the exact deceptive rationale.
- Supports multiple simultaneous phrase highlights with zero overlapping syntax bugs.

### 6. Interactive Incident Mitigation Action Checklist
- Dynamic containment playbook generated based on threat severity.
- Check off actions as they are resolved with live completion progress bar.
- Separates pending recommended actions from completed tasks.
- 1-click **Export Plan** to save a text-based action checklist.

### 7. Threat History & Local Storage Audit Trail
- Persists scan history across sessions in `localStorage`.
- Search, filter by threat level (Critical / Suspicious / Safe), and 1-click re-inspection.
- Clear history with confirmation modal.
- Explicit privacy notice explaining browser-local storage vs cloud databases.

### 8. Interactive Demo Scenarios
- **Demo 1: Urgent Invoice Lure** (CRITICAL — 94/100): 2-hour deadline, legal coercion, channel isolation.
- **Demo 2: Brand Lookalike & OTP Stealer** (CRITICAL — 91/100): `paypa1` typosquatting, 2FA harvesting.
- **Demo 3: Safe Tech Newsletter** (SAFE — 8/100): Routine informational developer dispatch.

---

## 🛠️ Technology Stack
- **Framework:** React 18 + Vite 5
- **Styling:** Tailwind CSS (deep midnight navy palette, glassmorphism, cyan/blue cyber accents)
- **Icons:** Lucide React
- **Animations:** Custom CSS keyframes, SVG radial gauge transitions, radar sweep
- **Network / API:** Fetch API with AbortController for cancelable requests

---

## 🔌 Backend Integration Contract

TrustLens supports both **Live Backend API** mode and **Interactive Client-Side Heuristic Engine** mode.

### Health Check Endpoint
```http
GET /api/health
```
**Response:**
```json
{
  "status": "healthy"
}
```

### Analysis Endpoints
- `POST /api/analyze/text` (JSON: `{ "type": "text", "content": "..." }`)
- `POST /api/analyze/url` (JSON: `{ "type": "url", "content": "https://..." }`)

### Shared Response Contract
```json
{
  "scan_id": "scan_2026_001",
  "threat_level": "CRITICAL",
  "risk_score": 88,
  "summary_verdict": "Deceptive Brand Lookalike & Verification Request Detected",
  "plain_english_explanation": "This message mimics an online service to cause panic.",
  "target_impersonated": "Online Service Provider",
  "url_analysis": {
    "submitted_url": "example-lookalike-domain.org",
    "actual_domain": "example-lookalike-domain.org",
    "is_spoofed": true,
    "lookalike_brand": "Brand Name",
    "character_substitution": "None",
    "https_status": {
      "present": true,
      "note": "TLS active. Warning: HTTPS encrypts transit but does NOT establish trustworthiness."
    },
    "heuristic_flags": [
      "Brand lookalike detected via character substitution"
    ]
  },
  "ai_social_engineering": {
    "urgency_level": "EXTREME",
    "tactics_detected": [
      "Artificial deadline",
      "Account status notice"
    ],
    "highlighted_quotes": [
      "Your account requires immediate action"
    ],
    "evidence_level": "High (Deterministic Match)",
    "manipulation_pattern": "Channel Isolation + Artificial Deadline"
  },
  "recommended_actions": [
    "Do not click links",
    "Navigate to official website manually"
  ]
}
```

---

## 🏃 Running the Application

### 1. Backend Orchestration Gateway (Port 8000)
```powershell
# From repository root
python -m pip install -r backend/requirements.txt
python -m uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
```
* **Health API**: `http://127.0.0.1:8000/api/health`
* **Analysis API**: `http://127.0.0.1:8000/api/analyze`
* **Interactive OpenAPI Docs**: `http://127.0.0.1:8000/docs`

### 2. Frontend React Client (Port 5173)
```powershell
# From frontend workspace
cd frontend
npm install
npm run dev
```
The application will launch at `http://localhost:5173`.

### 3. Automated Test Suite
```powershell
# Run all unit, heuristics, AI pipeline, and contract invariance tests
python -m pytest
```

---

## 📁 Repository Directory Architecture

```text
phishguard/
├── .gitignore               # Shared: Ignores node_modules, venv, .env, __pycache__
├── README.md                # Shared: Project overview & setup instructions
├── AGENTS.md                # Shared: Coding agent instructions & architecture rules
│
├── docs/                    # Architecture & Workflow Documentation (Stages 1–11)
│   ├── 01-problem.md        # Stage 1: Problem Definition
│   ├── 02-research.md       # Stage 2: Competitive Analysis & Research
│   ├── 03-scope.md          # Stage 3: Scope & MVP vs. Later vs. Never
│   ├── 04-design.md         # Stage 4: Screen States & Visual Guardrails
│   ├── 05-prd.md            # Stage 5: Functional & Safety Requirements
│   ├── 06-architecture.md   # Stage 5: System Architecture & Data Flow
│   ├── 06a-api-contract.md  # Stage 5: Single Source of Truth API Contract
│   ├── 06b-safety-rules.md  # Stage 5: Deterministic Safety Rules
│   ├── 06c-integrations.md  # Stage 5: Media & Messaging Integrations
│   ├── 07-test-plan.md      # Stage 6: Test Suite & Fixture Definitions
│   ├── 08-tasks.md          # Stage 7: Task Breakdown & Team Ownership
│   ├── 09-release.md        # Stage 10: Pre-Demo Checklist & Pitch Script
│   └── 10-feedback.md       # Stage 11: Retrospective & Roadmap
│
├── shared/                  # CONTRACT LOCK ZONE (Read-Only across all roles)
│   └── sample-threat.json   # Ground truth JSON payload for frontend & backend
│
├── frontend/                # ── MEMBER 1 (RAVI) EXCLUSIVE ZONE ──
│   ├── index.html           # Root HTML entry point
│   ├── package.json         # Frontend dependencies (React, Vite, Tailwind, Lucide)
│   ├── vite.config.js       # Vite server & proxy configuration
│   ├── tailwind.config.js   # Custom threat color themes (Red, Amber, Green)
│   ├── .env                 # Client environment: VITE_API_URL only
│   └── src/
│       ├── main.jsx         # React application mounting
│       ├── App.jsx          # Layout, view tabs, and scan state router
│       ├── mockData.js      # Local mock fallback (mirrors shared/sample-threat.json)
│       ├── api.js           # Central fetch client (toggles mock vs live backend)
│       └── components/
│           ├── InputTabs.jsx        # Text paste, URL bar, and File dropzone
│           ├── ScannerRadar.jsx     # Scanning skeleton & radar pulse animations
│           ├── ThreatCard.jsx       # Risk gauge (0–100), color+text badge, verdict
│           ├── QuoteHighlighter.jsx # Text body with red-flag sentences highlighted
│           ├── ActionChecklist.jsx  # Interactive safety checklist & next steps
│           └── ShareModal.jsx       # 1-click WhatsApp family warning share link
│
├── backend/                 # ── SERVER & GATEWAY ZONE ──
│   ├── requirements.txt     # Python dependencies
│   ├── .env                 # Server environment: GEMINI_API_KEY, PORT, CORS
│   │
│   ├── main.py              # ── MEMBER 2 (ABHINAV) EXCLUSIVE ZONE ──
│   ├── schemas.py           # Pydantic request & response validation schemas
│   ├── config.py            # CORS origin headers & runtime settings
│   │
│   ├── safety/              # ── MEMBER 3 (MANOHAR) EXCLUSIVE ZONE ──
│   │   ├── __init__.py
│   │   ├── heuristics.py    # Deterministic Levenshtein typosquatting & brand matcher
│   │   ├── rules.py         # Regex filters for raw IP hosts, @ redirects, subdomains
│   │   └── brands.py        # Hardcoded dictionary of top 50 impersonated brands
│   │
│   ├── ai/                  # ── MEMBER 4 (ADITHYA) EXCLUSIVE ZONE ──
│   │   ├── __init__.py
│   │   ├── gemini_client.py # Free Gemini 1.5 Flash client (structured JSON only)
│   │   └── system_prompt.md # Master prompt for urgency, panic & intent analysis
│   │
│   └── integrations/        # ── MEMBER 4 (ADITHYA) EXCLUSIVE ZONE ──
│       ├── __init__.py
│       └── media_extractor.py # Local QR decoding (pyzbar) & screenshot OCR parsing
│
└── tests/                   # Shared Test Suites & Fixtures
    ├── test_contract.py     # Abhinav: Contract & schema conformance tests
    ├── test_heuristics.py   # Manohar: Standalone deterministic unit tests
    ├── test_ai_pipeline.py  # Adithya: Gemini JSON output & prompt regression tests
    └── fixtures/            # Shared scam fixtures (CEO fraud, PayPal spoof, clean SMS)
        ├── t01_ceo_fraud.json
        ├── t02_typosquat_paypal.json
        ├── t03_package_smishing.json
        └── t04_clean_email.json

