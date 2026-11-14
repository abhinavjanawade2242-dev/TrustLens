# Stage 3: Scope Specification — PhishGuard AI (TrustLens)

**File:** `docs/03-scope.md`  
**Problem Statement:** Problem 5 — Digital Scam & Phishing Detection System  
**Hackathon Target:** 8–12 Hour Sprint (100% Free / Open-Source Stack)  
**Methodology:** ReportSaathi 11-Stage Vibecoding Workflow  

---

## 1. The Single Core Flow

To prevent scope creep during an 8–12 hour hackathon, PhishGuard delivers one complete, polished user journey:

```text
[Input Submission] ──> [Deterministic Heuristic Scan] ──> [AI Psychological Intent Scan] ──> [Visual Threat Verdict & Action Checklist]
(Text / URL / Image)    (Brand spoofing, IP host, TLDs)    (Panic cues, urgency, harvesting)   (Color+Text badge, quotes, safe steps)
```

1. **User Input:** Everyday user pastes suspicious message text, enters a link, or uploads a screenshot/QR code.
2. **Local Heuristic Pass (<50ms):** Extract domain via `tldextract`; run Levenshtein distance check against top 50 brands; inspect URL structure (raw IPs, excessive subdomains, risky TLDs).
3. **AI Social Engineering Pass (<1.5s):** Gemini 1.5 Flash evaluates tone, psychological manipulation, panic triggers, and extracts verbatim suspicious quotes.
4. **Threat Card Delivery:** Display unified risk score (0–100), color + text badge (SAFE / SUSPICIOUS / CRITICAL), plain-English danger summary, highlighted red-flag quotes, and safe next actions.

---

## 2. Feature Prioritization: MVP vs. Later vs. Never

| Feature | Sub-Features & Technical Execution | Priority | Justification & Guardrails |
| :--- | :--- | :---: | :--- |
| **Multi-Modal Ingestion** | Text paste area, URL input bar, QR code decoding via `pyzbar`, screenshot text reading via Gemini vision | **MVP** | Catches cross-channel smishing, email lures, and QR quishing attacks directly. |
| **Deterministic Heuristics** | Levenshtein brand lookalike matcher (top 50 brands), raw IP host detector, multiple subdomain parser, high-abuse TLD flagger | **MVP** | Zero LLM dependency; guarantees instant (<50ms) catch of zero-day spoofing without hallucinations. |
| **AI Intent & Manipulation** | Psychological urgency analysis, authority impersonation detector, credential extortion scanner via Gemini 1.5 Flash | **MVP** | Catches grammatically flawless LLM-generated lures that traditional grammar/spelling filters miss. |
| **Explainable Threat Card** | Color + text severity badges, 0–100 risk gauge, highlighted quotes in message body, non-technical plain explanation | **MVP** | Directly solves user warning fatigue and confusion identified in Stage 2 research. |
| **Safe Next Steps** | Actionable bullet checklist (e.g. "Do not enter OTP", "Open official portal manually"), 1-click WhatsApp warning link | **MVP** | Closes the loop from detection to safe user behavior with zero added API cost. |
| **Demo Scam Loaders** | Pre-populated buttons for CEO wire fraud, PayPal typosquat, package smishing, and clean corporate newsletter | **MVP** | Crucial for live hackathon judging to demonstrate both true positives and zero false alarms. |
| **Telegram Scam Alert Bot** | Forward suspicious SMS/forwarded messages to a Telegram bot; receive immediate threat card | **Later** | High utility for elderly users; uses free Telegram Bot API, but deferred until web app is frozen. |
| **Crowdsourced Scam Feed** | Community upvoting and reporting of newly circulating regional fraud campaigns | **Later** | Valuable network effect, but requires database setup (Supabase) not needed for the core detection loop. |
| **Browser Extension** | Real-time DOM link highlighting and zero-day click blocking | **Later** | Out of scope for 8–12h hackathon; web dashboard proves the core detection engine first. |
| **Voice / Vishing Ingestion** | Speech-to-text audio scam call analysis (e.g. fake police/customs extortion calls) | **Later** | Adds audio processing latency and complexity; reserve for Phase 2. |
| **Credential Auto-Fill** | Interacting with or auto-filling forms on target websites | **Never** | Severe liability risk; violates user privacy and browser security sandboxing. |
| **Automated Retaliatory Probing**| DDoSing, automated reporting bots, or submitting fake credentials to scam servers | **Never** | Illegal activities policy violation; PhishGuard is strictly a defensive advisory tool. |
| **Storing User Credentials** | Caching, logging, or persisting unmasked passwords, OTPs, or bank account numbers | **Never** | Critical privacy violation under DPDPA / GDPR; analysis runs in-memory only. |

---

## 3. Team Ownership per MVP Feature

* **Ravi (Frontend Lead):** Owns Input Tabs, Scanner Animation, Threat Warning Card, Quote Highlighter, and WhatsApp Share Link (`frontend/`).
* **Abhinav (Backend Orchestrator):** Owns Request Router, Pydantic Schema, CORS Configuration, and Heuristic/AI Scoring Synthesis (`backend/main.py`).
* **Manohar (Safety Heuristics):** Owns Brand Dictionary, Levenshtein Typosquatting Matcher, and URL Anomaly Rules (`backend/safety/`).
* **Adithya (AI & Media Lead):** Owns Gemini Intent System Prompt, JSON Output Formatter, and QR Code Decoder (`backend/ai/`, `backend/integrations/`).

---

## 4. Stage 3 Exit Criteria (Done-When Check)
- [x] Exactly **one single core user journey** is chosen and documented.
- [x] Every candidate feature is categorized into **MVP**, **Later**, or **Never** with concrete justification.
- [x] All features that violate privacy, promote offensive hacking, or cause scope creep are placed in **Never**.
- [x] MVP features are distributed cleanly across all 4 team roles with zero overlapping file ownership.
- [x] One user can complete the entire core flow from submission to explanation using **only** MVP features.
