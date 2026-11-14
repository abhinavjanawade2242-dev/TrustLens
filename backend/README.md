# TrustLens Backend

## Setup

From the repository root, create a virtual environment and install the backend
dependencies:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r backend\requirements-dev.txt
```

## Run

```powershell
python -m uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
```

The backend provides:
- `GET /api/health`: Health status and service verification.
- `POST /api/analyze`: Unified threat analysis accepting JSON or multipart form images.
- `POST /api/analyze/text` & `POST /api/analyze/url`: Specialized aliases for frontend compatibility.

CORS permits all development origins by default (including Vite on port 5173).

## Test

From the repository root:

```powershell
python -m pytest
```
