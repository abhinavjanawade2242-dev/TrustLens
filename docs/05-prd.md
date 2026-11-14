# Stage 5: Product Requirements Document (PRD) — PhishGuard AI

**File:** `docs/05-prd.md`  
**Problem Statement:** Problem 5 — Digital Scam & Phishing Detection System  
**Sprint Target:** 8–12 Hour Hackathon (100% Free / Open-Source Stack)  
**Parent Specs:** `docs/01-problem.md`, `docs/02-research.md`, `docs/03-scope.md`, `docs/04-design.md`  

---

## 1. Product Vision & Principles

PhishGuard AI provides instant, transparent, and multi-modal defense against digital scams, brand impersonation, and QR quishing. Built on deterministic offline guardrails and Google AI Studio's free Gemini 1.5 Flash API, the platform delivers zero-cost, explainable cyber defense for non-technical users.

### Core Operating Principles
1. **Deterministic Safety Primacy:** Brand typosquatting, raw IP hosts, and domain structural anomalies are evaluated mathematically by offline code. They are never outsourced to an LLM.
2. **Explainable Output:** Opaque numeric risk percentages are replaced with plain-English narratives, highlighted quotes, and concrete safety actions.
3. **Zero Data Retention:** No user passwords, OTPs, or personally identifiable information are cached, stored, or logged. Analysis is strictly in-memory.

---

## 2. Functional Requirements (FR)

### Ingestion & Pre-Processing
* **FR-1 (Multi-Modal Input):** The system shall accept user inputs via three distinct modes:
  * Raw message/email text (multiline string).
  * Suspicious URL (single-line string with scheme normalization).
  * Image upload (PNG, JPEG, WebP up to 10 MB) containing screenshots or QR codes.
* **FR-2 (Media Extraction):** 
  * If an uploaded image contains a QR code, the system shall decode the embedded link via `pyzbar` in <50ms.
  * If an uploaded image is a message screenshot, the system shall extract text using Gemini 1.5 Flash multimodal vision.

### Detection Engines
* **FR-3 (Deterministic Structural Heuristics):**
  * The system shall extract root domains and subdomains using `tldextract`.
  * The system shall calculate the Levenshtein distance between the extracted root domain and a curated top-50 brand dictionary. Distance <= 2 flags brand spoofing.
  * The system shall flag URLs utilizing IPv4/IPv6 hosts, embedded `@` redirect characters, excessive subdomains (>3 levels), or high-risk disposable TLDs (`.xyz`, `.top`, `.tk`, `.click`, `.live`).
* **FR-4 (AI Social Engineering & Psychological Analysis):**
  * The system shall pass the normalized message text to Gemini 1.5 Flash with strict JSON output formatting.
  * The AI shall evaluate psychological manipulation vectors: artificial urgency/deadlines, authority impersonation, financial/account suspension panic, and direct requests for OTPs/credentials.
  * The AI shall extract exact verbatim suspicious substrings (`highlighted_quotes`) and provide a 2–3 sentence non-technical summary (`plain_english_explanation`).

### Scoring & Delivery
* **FR-5 (Composite Threat Scoring):**
  * The system shall synthesize a final risk score (0 to 100):
    * If `heuristics.is_spoofed == True`: enforce `threat_level = "CRITICAL"` and `risk_score = max(85, composite_score)`.
    * Otherwise: `risk_score = int(0.4 * heuristic_score + 0.6 * ai_score)`.
  * Map score to badges: 0–39 -> SAFE (Emerald), 40–69 -> SUSPICIOUS (Amber), 70–100 -> CRITICAL (Crimson).
* **FR-6 (Actionable Guidance & Safe Share):**
  * The system shall supply 3 tailored, concrete next steps (e.g., "Do not enter credentials", "Verify account via official app").
  * The system shall generate a 1-click WhatsApp share link (`wa.me`) encoding a standardized warning message to protect friends and family.
* **FR-7 (Hackathon Demo Loaders):**
  * The UI shall provide 4 one-click demo buttons: CEO wire fraud (true positive text), PayPal typosquat (true positive URL), QR parking scam (true positive image), and clean corporate newsletter (true negative).

---

## 3. Non-Functional Requirements (NFR)

* **NFR-1 (End-to-End Latency):** Heuristic checks shall execute in <50ms. Full analysis (including Gemini API call) shall complete in <2.5s on standard broadband.
* **NFR-2 (Zero Financial Cost):** The system shall rely exclusively on open-source Python packages and Google AI Studio's free tier. Operating costs shall be exactly $0.00.
* **NFR-3 (Mobile Usability & Accessibility):** The UI shall render cleanly on mobile viewports (>= 360px width) with minimum touch targets of 48 x 48 px and body text >= 16px.

---

## 4. Safety & Compliance Requirements (SR)

* **SR-1 (Override Immunity):** If deterministic heuristics confirm brand spoofing (`is_spoofed == True`), the threat level cannot be softened or overridden by the AI model.
* **SR-2 (In-Memory Processing):** Message text, extracted URLs, and uploaded images shall be processed strictly in memory and garbage-collected post-response. No server persistence.
* **SR-3 (Advisory Disclaimer):** Every response must display the mandatory legal disclaimer: *"PhishGuard provides automated risk analysis and educational guidance. It does not replace official banking verification or professional cybersecurity advice."*
