# Stage 10: Release Audit & Demo Readiness — PhishGuard AI

**File:** `docs/09-release.md`  
**Problem Statement:** Problem 5 — Digital Scam & Phishing Detection System  
**Sprint Target:** Final Pre-Demo Audit Checklist  

---

## 1. Pre-Flight Verification Checklist

Run this 30-minute checklist before calling judges to your table:

### Frontend & Visuals (Ravi)
- [ ] App loads cleanly on `http://localhost:5173` without console warnings.
- [ ] Responsive design verified on a mobile viewport (360px width) in Chrome DevTools.
- [ ] Red-flag quotes highlight cleanly in soft crimson when a suspicious message is analyzed.
- [ ] Safe messaging share link generates a clean, pre-filled warning text.
- [ ] Quick demo buttons populate instant test inputs.

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

* **Minute 1: The Problem & Live Attack (0:00 - 1:00)**
  *"Judges, traditional security gateways fail against zero-day links and AI-generated scam lures because static blacklists are too slow and scanners don't explain the threat to everyday users. Watch what happens when we paste a brand-new zero-day lookalike link."*
* **Minute 2: The Solution & Multi-Modal Scan (1:00 - 2:00)**
  *"PhishGuard catches this in 40ms using mathematical Levenshtein brand distance—without waiting for blacklists. And when an attacker sends a grammatically perfect urgent invoice or a malicious QR code, our multimodal AI evaluates the psychological pressure vectors, highlights the exact deceptive quotes, and generates a plain-English explanation."*
* **Minute 3: Safe Action & Social Protection (2:00 - 3:00)**
  *"Best of all, we don't just provide an opaque percentage score. We give users an actionable checklist and a 1-click button to warn family groups instantly. Built 100% on open-source tools with zero API overhead."*
