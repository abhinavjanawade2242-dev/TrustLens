# Stage 5: Deterministic Safety Rules — PhishGuard AI

**File:** `docs/06b-safety-rules.md`  
**Problem Statement:** Problem 5 — Digital Scam & Phishing Detection System  
**Owner:** Manohar (Member 3: Deterministic Safety Lead)  

---

## 1. Core Rule: Deterministic Primacy
In accordance with the ReportSaathi architectural pattern, **critical security red flags must be determined by deterministic code, never by artificial intelligence**. Language models can hallucinate brand validity, overlook subtle homoglyphs, or be misled by prompt injections.

---

## 2. Master Safety Rules

### Rule SR-1: Brand Spoofing & Lookalike Lockdown
* **Mechanism:**
  * Extract root domain via `tldextract`.
  * Compare against the curated `TOP_TARGET_BRANDS` dictionary.
  * Compute Levenshtein string distance.
* **Enforcement:**
  * If Levenshtein distance is 1 or 2, set `is_spoofed = True`.
  * The system MUST enforce a minimum `base_risk_score = 85` and set `threat_level = "CRITICAL"`.
  * **Immunity:** The AI engine cannot override or lower this verdict.

### Rule SR-2: Raw IP Host Penalty
* **Mechanism:** Check if the host portion of the URL matches IPv4 or IPv6 pattern.
* **Enforcement:** Legitimate consumer services never send raw IP links. Add +75 to `base_risk_score`.

### Rule SR-3: Subdomain Masquerading Detection
* **Mechanism:** Count subdomain components prepended to the registered domain.
* **Enforcement:** If subdomain count >= 3, flag as disguised root domain and add +50 to `base_risk_score`.

### Rule SR-4: Disposable & High-Abuse TLD Flagging
* **Mechanism:** Inspect top-level domain against known high-abuse extensions (`.xyz`, `.top`, `.tk`, `.ml`, `.click`, `.live`, `.loan`).
* **Enforcement:** Add +30 to `base_risk_score`.

### Rule SR-5: Embedded `@` Sign Redirect Detection
* **Mechanism:** Detect `@` characters in URL authority component.
* **Enforcement:** Browsers treat text before `@` as user credentials and route to the subsequent host. Immediately flag as deceptive redirect; enforce `risk_score = 90` and `threat_level = "CRITICAL"`.

---

## 3. Brand Dictionary (`TOP_TARGET_BRANDS`)
Manohar's module shall maintain at least these 25 primary targets:
`paypal`, `amazon`, `apple`, `microsoft`, `google`, `netflix`, `chase`, `wellsfargo`, `bankofamerica`, `binance`, `coinbase`, `whatsapp`, `telegram`, `fedex`, `dhl`, `usps`, `facebook`, `instagram`, `sbi`, `hdfc`, `icici`, `paytm`, `phonepe`, `flipkart`, `axisbank`.
