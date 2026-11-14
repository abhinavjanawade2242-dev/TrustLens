import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


allowed_origins = [
    origin.strip()
    for origin in os.getenv(
        "TRUSTLENS_ALLOWED_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173",
    ).split(",")
    if origin.strip()
]

app = FastAPI(title="PhishGuard AI Engine", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "OPTIONS"],
    allow_headers=["*"],
)


@app.get("/api/health")
async def health_check():
    return {
        "ok": True,
        "service": "PhishGuard AI Engine",
        "status": "online",
        "version": app.version,
    }
