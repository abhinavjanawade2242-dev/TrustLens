
import os

from fastapi import (
    FastAPI,
    HTTPException,
    UploadFile,
    File,
    Form,
)
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from backend.ai.gemini_client import (
    GeminiPhishGuardClient,
    GeminiError,
    PhishGuardAnalysisResult,
)

from backend.integrations.media_extractor import (
    MediaExtractor,
    MediaExtractionError,
)


# CORS configuration
allowed_origins = [
    origin.strip()
    for origin in os.getenv(
        "TRUSTLENS_ALLOWED_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173",
    ).split(",")
    if origin.strip()
]


# FastAPI application
app = FastAPI(
    title="PhishGuard AI Engine",
    version="1.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


# Request model for text analysis
class AnalyzeRequest(BaseModel):
    text: str = Field(
        min_length=1,
        description="Text to analyze for phishing",
    )


# Health check endpoint
@app.get("/api/health")
async def health_check():
    return {
        "ok": True,
        "service": "PhishGuard AI Engine",
        "status": "online",
        "version": app.version,
    }


# Text phishing analysis endpoint
@app.post(
    "/api/analyze",
    response_model=PhishGuardAnalysisResult,
)
async def analyze_text(request: AnalyzeRequest):
    try:
        client = GeminiPhishGuardClient()
        return client.analyze_text(request.text)

    except GeminiError as exc:
        raise HTTPException(
            status_code=502,
            detail=str(exc),
        ) from exc

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc


# Image and QR-code phishing analysis endpoint
@app.post(
    "/api/analyze/image",
    response_model=PhishGuardAnalysisResult,
)
async def analyze_image(
    file: UploadFile = File(...),
    text: str = Form(default=""),
):
    try:
        # Read uploaded image
        image_bytes = await file.read()

        if not image_bytes:
            raise HTTPException(
                status_code=400,
                detail="Uploaded image is empty.",
            )

        # Extract image information and QR codes
        extractor = MediaExtractor()
        extraction = extractor.extract(image_bytes)

        # Analyze image and extracted QR information using Gemini
        client = GeminiPhishGuardClient()

        result = client.analyze_media(
            media_input=extraction,
            additional_text=text,
        )

        return result

    except HTTPException:
        raise

    except MediaExtractionError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc

    except GeminiError as exc:
        raise HTTPException(
            status_code=502,
            detail=str(exc),
        ) from exc

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc

    finally:
        await file.close()
