# Stage 5: API Contract Specification — PhishGuard AI

**File:** `docs/06a-api-contract.md`  
**Problem Statement:** Problem 5 — Digital Scam & Phishing Detection System  
**Single Source of Truth:** `shared/sample-threat.json`  

---

## 1. Endpoints Overview

| Method | Endpoint | Description | Request Format | Response Format |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Walking skeleton & server status | None | JSON |
| `POST` | `/api/analyze` | Unified threat analysis endpoint | JSON or `multipart/form-data` | JSON (`sample-threat.json`) |

---

## 2. Request Specifications

### `GET /api/health`
* **Response (200 OK):**
```json
{
  "ok": true,
  "service": "PhishGuard AI Engine",
  "status": "online",
  "version": "1.0.0"
}
```

### `POST /api/analyze`
Accepts either standard JSON or Multipart Form (for file uploads).

* **JSON Request Body:**
```json
{
  "text": "Your account has been restricted. Verify your identity immediately.",
  "url": "https://service-notice.example"
}
```

* **Multipart Form Fields:**
  * `text` (optional string): Suspicious message body.
  * `url` (optional string): Suspicious link.
  * `file` (optional binary): Uploaded image (PNG, JPEG, WebP) under 10 MB.

---

## 3. Response Specification (`shared/sample-threat.json`)

The backend response MUST strictly match this schema:

```json
{
  "scan_id": "scan_2026_001",
  "threat_level": "CRITICAL",
  "risk_score": 88,
  "summary_verdict": "Deceptive Brand Spoof & Credential Harvesting Detected",
  "plain_english_explanation": "This message is impersonating an established brand to induce panic. The link directs to an unverified domain designed to capture your login credentials.",
  "target_impersonated": "BrandName",
  "url_analysis": {
    "submitted_url": "https://service-notice.example",
    "actual_domain": "lookalike-domain.example",
    "is_spoofed": true,
    "heuristic_flags": [
      "Typosquatting detected: domain mimics legitimate brand",
      "Misleading subdomain prepended to disguise root domain"
    ]
  },
  "ai_social_engineering": {
    "urgency_level": "EXTREME",
    "tactics_detected": [
      "Artificial deadline ('within 24 hours')",
      "Fear of account suspension or financial loss",
      "Direct request for sensitive login credentials"
    ],
    "highlighted_quotes": [
      "Your account has been restricted",
      "Verify your identity immediately or funds will be frozen"
    ]
  },
  "recommended_actions": [
    "DO NOT click the link or enter your credentials.",
    "Do NOT reply to the sender or call any phone number provided in the text.",
    "Navigate to the official portal manually in your browser to verify your account status."
  ]
}
```

---

## 4. Error Responses

* **422 Unprocessable Entity:** Returned if all inputs (`text`, `url`, `file`) are empty.
```json
{
  "error": "VALIDATION_FAILED",
  "message": "At least one input (text, url, or image file) must be provided."
}
```
* **503 / Fallback Response:** If Gemini API fails or times out, the backend catches the error and returns a valid `200 OK` using deterministic heuristic data:
```json
{
  "scan_id": "scan_fallback_001",
  "threat_level": "SUSPICIOUS",
  "risk_score": 60,
  "summary_verdict": "Heuristic Threat Warning (AI Engine Offline)",
  "plain_english_explanation": "AI deep-inspection was temporarily unavailable. Risk score is computed solely from structural URL heuristics.",
  "target_impersonated": null,
  "url_analysis": {
    "submitted_url": "https://suspicious-sample.example",
    "actual_domain": "suspicious-sample.example",
    "is_spoofed": false,
    "heuristic_flags": ["Suspicious disposable extension"]
  },
  "ai_social_engineering": {
    "urgency_level": "UNKNOWN",
    "tactics_detected": ["AI inspection offline"],
    "highlighted_quotes": []
  },
  "recommended_actions": [
    "Exercise caution before clicking links from unknown senders."
  ]
}
```
