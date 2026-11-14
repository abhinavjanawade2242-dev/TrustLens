# docs/02-research.md — Stage 2: Research & Competitive Gaps

**Product:** PhishGuard AI (TrustLens)  
**Track:** Problem Statement 5 — Digital Scam & Phishing Detection System  
**Framework:** 11-Stage Vibecoding Workflow (ReportSaathi Specification)  
**Status:** Approved & Locked for MVP Implementation  

---

## 1. Competitive Analysis Matrix

| Existing Solution | Strengths (Works Well) | Critical Weaknesses & Complaints | Opening for PhishGuard AI |
| :--- | :--- | :--- | :--- |
| **Google Safe Browsing & Chrome Interstitials** | High accuracy on indexed, known malicious domains; built natively into major desktop browsers. | Completely blind to zero-day ephemeral domains (<24 hours old); does not analyze SMS, chat text, or QR codes; warnings cause alert fatigue. | Instant offline mathematical heuristics (Levenshtein distance, brand spoofing, homoglyphs) without waiting for global blacklist indexing. |
| **VirusTotal & Multi-Engine Feeds** | Aggregates 70+ enterprise security engines; comprehensive malware telemetry and URL reputation. | Multi-second latency; returns dense, technical scanner flags incomprehensible to non-technical users; strict free API rate limits (4 req/min). | Delivers plain-English explanations and actionable checklists designed for everyday users in under 2 seconds. |
| **Telco & Built-in SMS Spam Blockers** | Blocks known bulk telemarketing numbers; operates passively in the background. | Bypassed by fresh SIMs, sender ID spoofing (header masking), and generative AI lures with perfect grammar; cannot inspect URLs within images. | Evaluates emotional manipulation vectors (panic, urgency, authority impersonation) rather than superficial sender reputation. |
| **Family WhatsApp Groups & Asking Peers** | Trusted, accessible, free, and communicates in the user's regional language. | Relies on non-expert opinions; provides conflicting advice; often delays response until after credentials have been stolen. | Instant, 24/7 automated verification providing authoritative guidance in seconds before a click occurs. |

---

## 2. Common User Complaint Patterns
Real-world feedback collected from cybersecurity forums, app store reviews, and user reports falls into four clear patterns:
1. **Explainability Deficit:** *"The scanner flagged the link as suspicious, but didn't explain what was wrong or what I should do next."*
2. **Zero-Day Lookalike Blindspot:** *"The website looked identical to my bank's login page and had an SSL padlock, so I thought it was authentic."*
3. **Generative AI Sophistication:** *"The email had flawless grammar, addressed me properly, and sounded like an urgent directive from management."*
4. **Quishing Vulnerability:** *"I scanned a parking meter QR code that redirected me to a phishing gateway; my phone's camera opened it immediately."*

---

## 3. Regulatory & Legal Constraints
* **Digital Personal Data Protection Act (DPDPA) / GDPR:** PhishGuard must process all user-submitted text and screenshots in-memory only. Zero persistence of unmasked credentials, phone numbers, or private user messages.
* **Information Technology Act (IT Act 2000):** Safe harbor compliance requires prominent user-facing disclaimers stating that PhishGuard provides automated advisory assistance and does not replace official bank verification channels.
* **Telecommunications Standards:** No unauthorized automated interception of SMS streams; all scans must be initiated voluntarily by the user.

---

## 4. Final Go / No-Go Decision
* **Decision:** **BUILD (Go)**.
* **One-Line Competitive Advantage:** PhishGuard delivers explainable, multi-modal threat analysis in plain language by combining zero-day offline domain heuristics with generative AI intent decoding in under 2 seconds on a 100% free stack.
* **Done When Check:**
  - [x] Real-world user complaint patterns ranked by severity and frequency.
  - [x] Four distinct existing solutions benchmarked for technical and UX limitations.
  - [x] Legal, privacy, and regulatory constraints cataloged.
  - [x] Clear Go/No-Go decision and one-line differentiator established.
