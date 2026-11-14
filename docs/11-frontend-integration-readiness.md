# TrustLens Frontend Integration Readiness

- **Audience:** Backend developer
- **Reviewed against:** `main` at `310bd5b`
- **Frontend workspace:** `frontend/` (the workspace documented in `README.md`)
**Status:** Ready for backend integration; no required analysis endpoint is awaiting implementation or merge.

## Connected endpoints

| Method and route | Frontend usage | Request | Current status |
|---|---|---|---|
| `GET /api/health` | `checkBackendHealth()` in `frontend/src/services/api.js` | No body | Implemented in `backend/main.py`; health response validated by tests. A successful health response confirms server availability only, not AI availability. |
| `POST /api/analyze` | `analyzeThreat()` for text, URL, and image | Text JSON `{ "text": "..." }`; URL JSON `{ "url": "https://..." }`; image `multipart/form-data` with file field `file` | Implemented in `backend/main.py`; all three request shapes returned HTTP 200 and passed `ThreatAnalysisResponse` validation in local smoke tests with Gemini disabled. |

`POST /api/analyze/text` and `POST /api/analyze/url` are implemented backend aliases and covered by tests. The current frontend does not call these aliases; it uses the unified `/api/analyze` endpoint for all input types.

There are no frontend-required endpoint implementations awaiting merge in the reviewed `main` branch. The current routes are present in `backend/main.py`, and the integration stage is marked complete in `docs/08-tasks.md`.

## Request and response contract

- The frontend sends JSON `text` or `url` properties for text and URL analysis, respectively. The backend `AnalyzeRequest` accepts both and dispatches them through the unified handler.
- Image upload uses `multipart/form-data` with field name `file`; the browser sets the multipart content type and boundary. The backend accepts `file` (and the compatibility alias `image`).
- Successful analysis returns the `ThreatAnalysisResponse` shape from `backend/schemas.py`: `scan_id`, `threat_level`, `risk_score`, `summary_verdict`, `plain_english_explanation`, and the optional/collection fields. `risk_score` is an integer from 0 to 100; threat levels are `SAFE`, `SUSPICIOUS`, or `CRITICAL`.
- The frontend validates required response fields and score range. A malformed successful response or invalid JSON is surfaced as an analysis error rather than being presented as local analysis.
- A backend 4xx response other than 404 is surfaced to the user. Network failure, 404 (for compatibility with an older backend), and 5xx retain the existing labeled local-heuristic fallback behavior. User cancellation is propagated.
- With no configured Gemini key, the backend still responds using deterministic heuristics and marks `ai_social_engineering.evidence_level` as `Offline Heuristic Signal`. The frontend identifies this as a backend heuristic fallback. Image output in this mode is shown as partial/unassessed, without a risk score or safe verdict.

## Integration dependencies and handoff notes

1. **Frontend base URL:** `VITE_API_URL` in the frontend environment (example: `frontend/.env.example`). It defaults in code to `http://localhost:8000`. Set it to the deployed backend origin when the UI and API are not on the same host.
2. **CORS:** The backend must allow the deployed frontend origin through `TRUSTLENS_ALLOWED_ORIGINS`. The current backend defaults to `*`; production deployments should configure the exact allowed origins.
3. **Backend runtime:** Install `backend/requirements.txt` and run the FastAPI app on the configured host/port. `python-multipart` is required for image uploads.
4. **AI analysis:** Gemini text/image analysis requires `GEMINI_API_KEY`; the backend uses `GEMINI_MODEL` when configured. The API remains callable without a key, but that is heuristic fallback, not AI evaluation.
5. **Media processing:** Image handling depends on Pillow and OpenCV packages in `backend/requirements.txt`. QR extraction is implemented with OpenCV's `QRCodeDetector`; the extractor notes that this avoids pyzbar's Windows DLL dependency. The backend then routes image bytes to the Gemini client for AI media analysis when configured.
6. **Workspace source of truth:** `frontend/` is the documented application workspace. The repository also contains a root `src/` copy and root npm manifest; key frontend entry, API, and dashboard files were identical at review time. Keep corresponding changes synchronized or clarify/remove the duplicate workspace in a separately approved cleanup; no redesign is needed for API integration.

## Verification and remaining unverified behavior

- `npm --prefix frontend run build`: passed.
- `python -m pytest -q`: 45 passed, with one upstream Starlette deprecation warning.
- Local smoke test with `GEMINI_API_KEY` blank: health, text, URL, image upload, and both alias routes returned HTTP 200; each successful analysis response validated against `ThreatAnalysisResponse`.
- Gemini-enabled analysis, image OCR/QR outcomes using representative fixtures, deployment-specific CORS, and network-disconnect behavior were not verified in this review. These are configuration/behavior verification items, not missing API endpoints.

## Documentation drift to resolve with backend ownership

- The README's backend integration examples describe alias paths and `{type, content}` payloads, while the active frontend uses the unified `/api/analyze` route with `{text}` or `{url}`; the backend accepts both formats.
- `docs/06-architecture.md` and `docs/06c-integrations.md` describe pyzbar as the QR extraction path, while the current implementation uses OpenCV's QR detector.
- Keep `docs/06a-api-contract.md` and the Pydantic schemas as the contract source of truth when updating those descriptions.
