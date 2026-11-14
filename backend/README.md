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

The walking skeleton currently provides `GET /api/health`, which the frontend
uses to report whether the backend is online. Analysis endpoints will be added
in the next backend implementation stages.

By default, CORS permits the Vite development origins
`http://localhost:5173` and `http://127.0.0.1:5173`. Set
`TRUSTLENS_ALLOWED_ORIGINS` to a comma-separated origin list to override them.

## Test

From the repository root:

```powershell
python -m pytest backend\tests
```
