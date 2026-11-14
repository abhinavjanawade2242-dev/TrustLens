# Stage 10: Release Audit & Demo Readiness — PhishGuard AI

**File:** `docs/09-release.md`  
**Problem Statement:** Problem 5 — Digital Scam & Phishing Detection System  
**Sprint Target:** Final Pre-Demo Audit Checklist  

---

## 1. Pre-Flight Verification Checklist

Run this 30-minute checklist before calling judges to your table:

### Frontend & Visuals (Ravi)
- [x] App loads cleanly on `http://localhost:5173` without frontend console errors or warnings when the backend is running.
- [x] Responsive design verified at 360px width with no horizontal page overflow; mobile navigation and workspace navigation work.
- [x] Suspicious quotes highlight and can be selected to inspect their rationale.
- [x] The safety-share link produces a pre-filled warning that identifies the result as a preset demo or heuristic.
- [x] All four preset demonstration scenarios run and show their fixed sample results.

### Backend & Server Performance (Abhinav)
- [x] Server starts cleanly with `uvicorn backend.main:app --reload` on port 8000.
- [x] `GET /api/health` returns `{"ok": true}` in under 10ms (Benchmarked: ~4.85ms).
- [x] CORS is configured so the browser never blocks requests from the frontend (`allow_origins=["*"]`).
- [x] Server logs do NOT print passwords, private message contents, or API keys.
- [x] Graceful degradation verified: offline heuristic fallback responds in <75ms on missing API key/timeout.

### Security Heuristics (Manohar)
- [ ] `pytest tests/test_heuristics.py` passes with 100% success.
- [ ] Zero false alarms on verified benign domain queries.
- [ ] 100% catch rate on lookalike and typosquatted domains.

### AI Multimodal & Fallback (Adithya)
- [ ] `GEMINI_API_KEY` is set in backend environment.
- [ ] QR code decoding verified using sample QR code fixtures.
- [ ] Network disconnect test: When internet is disconnected, server gracefully returns heuristic response without 500 error.

---

## 2. The 3-Minute Live Judge Pitch Script

* **Minute 1: The Problem & Demonstration (0:00 - 1:00)**
  *"TrustLens is a cybersecurity-awareness prototype. Its preset scenarios are scripted demonstrations, not live threat intelligence or proof that a message is malicious."*
* **Minute 2: Available Analysis (1:00 - 2:00)**
  *"When the analysis backend is unavailable, custom text and URL inputs use local keyword and URL-structure heuristics. The interface labels these results as simulated; no AI model, live reputation lookup, image OCR, or QR inspection is running in this configuration."*
* **Minute 3: Safer Next Steps (2:00 - 3:00)**
  *"The prototype demonstrates quote highlighting, a user-controlled checklist, and browser-local history. Treat every score as educational guidance, verify requests through an independent official channel, and do not infer safety from a low score."*

## 3. Frontend Functionality Audit (2026-11-14)

The React/Vite app was exercised in the browser at `http://127.0.0.1:5173/`.

| Area | Result |
| :--- | :--- |
| Dashboard and Analyze Workspace navigation | Pass on desktop and at 360px mobile width. |
| Text / URL inputs | Pass: empty and short text are rejected; malformed hostnames are rejected; valid URL preview works. Requests use the documented `{text}` and `{url}` JSON shapes and received HTTP 200 from the current backend. With Gemini disabled, its `Offline Heuristic Signal` response is labeled as a backend heuristic fallback, not AI. |
| Image input | Pass for file type/size checks and honest fallback state. A valid PNG returned HTTP 200 without Gemini; the UI labeled the result incomplete and showed no risk score or safe verdict. If the backend is unavailable, image contents are not analyzed locally. |
| Preset demonstrations | Pass: all four scenarios rendered their preset results and carried an explicit simulated-data notice. The first demo showed score 94; the fixed demo fixtures are not analysis of submitted content. |
| Scan animation and cancellation | Pass: progress changes during the simulated animation, the demo animation says no AI model is running, and cancel stops the scan without adding a history entry. |
| Result rendering and quote highlighting | Pass: risk score and result panels render; four demo quote controls and three custom-text quote controls were interactive. |
| Action checklist and sharing | Partial: checklist toggles update completion progress and the share URL identifies the result source. The export handler created the plan text and attached a `.txt` download link, but the browser harness did not emit a download event, so saving the file remains unverified. |
| Threat History | Pass: source labels, search, severity filtering, opening a saved result, and canceling the clear-history confirmation worked. Unassessed image results remain labeled “NOT ANALYZED” and do not display a risk score. |
| Mobile layout | Pass at 360px: no horizontal page overflow, mobile navigation works, and its navigation targets are at least 48px high. |

### Remaining Release Blockers

- GitHub `main` advanced to commit `7ee9cee` during the audit. After syncing, the current FastAPI analysis routes were run locally and returned HTTP 200 for text, URL, and image requests.
- `GEMINI_API_KEY` was deliberately disabled during live endpoint checks to avoid external AI calls. Responses reported `Offline Heuristic Signal`; no Gemini/AI results were presented or verified.
- Image AI/OCR and QR-result handling were not validated with a QR fixture in the browser. When AI is unavailable, image responses are explicitly marked incomplete with no overall score.
- The backend, contract, and media test suite passed (`python -m pytest -q`: 32 passed). The dedicated heuristic-catch-rate checklist items and network-disconnect scenario remain unchecked.
- Export text and its `.txt` link were generated, but the browser harness did not emit a download event; actual file saving remains unverified.
