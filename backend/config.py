"""Configuration settings and environment parameters for PhishGuard AI / TrustLens Backend.
Owner: Abhinav (Member 2 - Backend & System Orchestrator Lead)
"""

import os
from pathlib import Path
from typing import List
from dotenv import load_dotenv

# Base Directory paths
BACKEND_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BACKEND_DIR.parent

# Automatically load environment variables from backend/.env or root .env
load_dotenv(BACKEND_DIR / ".env")
load_dotenv(PROJECT_ROOT / ".env")

# Server runtime settings
HOST: str = os.getenv("HOST", "127.0.0.1")
PORT: int = int(os.getenv("PORT", "8000"))
DEBUG: bool = os.getenv("DEBUG", "false").lower() in ("true", "1", "t")

# CORS Origin Headers
_default_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

_env_origins = os.getenv("TRUSTLENS_ALLOWED_ORIGINS", "*")
if _env_origins == "*":
    ALLOWED_ORIGINS: List[str] = ["*"]
else:
    ALLOWED_ORIGINS = [
        origin.strip()
        for origin in _env_origins.split(",")
        if origin.strip()
    ] or _default_origins

# AI Integration settings
GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
