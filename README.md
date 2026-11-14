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

### 1. Start the Development Server
```bash
npm run dev
```
The application will be accessible at `http://localhost:5173`.

### 2. Build for Production
```bash
npm run build
```
Production assets are generated in `dist/`.

### 3. Preview Production Build
```bash
npm run preview
```
