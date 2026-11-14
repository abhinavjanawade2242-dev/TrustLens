# Stage 5: External Integrations Specification — PhishGuard AI

**File:** `docs/06c-integrations.md`  
**Problem Statement:** Problem 5 — Digital Scam & Phishing Detection System  
**Owner:** Adithya (Member 4: AI & Media Lead) & Ravi (Member 1: Frontend Lead)  

---

## 1. Zero-Cost Integration Architecture

All external integrations must operate at zero financial cost with no paid third-party subscriptions:

| Integration | Technology | Cost | Purpose |
| :--- | :--- | :--- | :--- |
| **QR Code Extractor** | `pyzbar` / OpenCV-Python | Free (Local Open-Source) | Extracts links from QR codes in under 30ms. |
| **Vision OCR** | Gemini 1.5 Flash Multimodal | Free (Google AI Studio Tier) | Extracts text from uploaded SMS or chat screenshots. |
| **Social Engineering AI** | Gemini 1.5 Flash (JSON mode) | Free (Google AI Studio Tier) | Analyzes psychological urgency and manipulation tactics. |
| **1-Click Messaging Share**| Web link standard | Free (Native Web Standard) | Allows users to warn family or groups with one click. |

---

## 2. QR Code (Quishing) Extraction Flow (`media_extractor.py`)

The media extractor processes raw image bytes:
1. Decode image bytes with OpenCV.
2. Scan image for QR symbols using `pyzbar`.
3. If QR is detected, return extracted target destination.
4. If QR is not detected, pass image to Gemini multimodal model for text extraction.

---

## 3. Social Protection Share Link (`frontend/`)

Ravi implements a 1-click share button on the Threat Card. It generates a pre-filled safety notification string:

`Security Notice via PhishGuard AI: Threat level detected for analyzed message. Please do not open unexpected links or share credentials.`
