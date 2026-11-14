# Stage 6: Test Plan & Quality Assurance — PhishGuard AI

**File:** `docs/07-test-plan.md`  
**Problem Statement:** Problem 5 — Digital Scam & Phishing Detection System  
**Parent Specs:** `docs/05-prd.md`, `docs/06a-api-contract.md`, `docs/06b-safety-rules.md`  

---

## 1. Overview & Testing Philosophy

Tests are written and fixture-grounded BEFORE integration to prevent demo failures. We test across 3 levels:
1. **Contract Invariance Tests (`tests/test_contract.py`):** Ensures `/api/analyze` never breaks Ravi's UI.
2. **Deterministic Heuristic Unit Tests (`tests/test_heuristics.py`):** Validates typosquatting and anomaly detection on edge-case domains.
3. **End-to-End Fixture Runs:** Validates the full pipeline against realistic test cases.

---

## 2. Master Test Cases (Given / When / Then)

| Test ID | Category | Scenario / Fixture | Expected Result |
| :--- | :--- | :--- | :--- |
| **T-01** | Heuristics | Input: lookalike brand URL | `is_spoofed: True`, `risk_score >= 85`, `threat_level: "CRITICAL"`. |
| **T-02** | Heuristics | Input: raw IP address host | `heuristic_flags` includes raw IP alert; `risk_score >= 75`. |
| **T-03** | Heuristics | Input: verified benign search URL | `is_spoofed: False`, `heuristic_flags: []`, `base_risk_score: 0`. Zero false alarm. |
| **T-04** | AI Intent | Text: high-urgency message with artificial deadline | `urgency_level: "EXTREME"`, detected tactics include artificial deadline. |
| **T-05** | Media | Image with QR code leading to test link | QR link decoded correctly and processed by heuristic engine. |
| **T-06** | Fallback | Backend simulates AI engine network timeout | Server catches exception, returns HTTP 200 with heuristic score and fallback notice. |
| **T-07** | Contract | POST `/api/analyze` with sample input | Output strictly matches `shared/sample-threat.json` keys and types. |
| **T-08** | Usability | Mobile browser render at 360px viewport | All text >= 16px, touch targets >= 48px, zero horizontal overflow. |

---

## 3. Automated Contract Test Pattern

The backend automated test suite verifies that response payloads validate against the agreed Pydantic response models:
* Response includes `threat_level` matching enum: `SAFE`, `SUSPICIOUS`, or `CRITICAL`.
* Risk score is an integer between 0 and 100.
* Explanations and recommended action lists are non-empty strings.
