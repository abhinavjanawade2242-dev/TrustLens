"""PhishGuard AI / TrustLens Backend Gateway & System Orchestrator.

Orchestrates:
1. Media Ingestion (Member 4 - Adithya)
2. Deterministic Heuristics (Member 3 - Manohar)
3. Social Engineering AI Engine (Member 4 - Adithya)
4. Composite Risk Synthesis & Contract Enforcement (Member 2 - Abhinav)

Owner: Abhinav (Member 2 - Backend & System Orchestrator Lead)
"""

from __future__ import annotations

import logging
import os
import re
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from urllib.parse import urlparse

from fastapi import FastAPI, File, Form, HTTPException, Request, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.schemas import (
    AiSocialEngineering,
    AnalyzeRequest,
    HealthResponse,
    HttpsStatus,
    SeverityLevel,
    ThreatAnalysisResponse,
    ThreatLevel,
    UrgencyLevel,
    UrlAnalysis,
    WhyDangerousItem,
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("phishguard.orchestrator")

# Initialize FastAPI App
app = FastAPI(
    title="PhishGuard AI Engine",
    version="1.0.0",
    description="Central Orchestration Engine for Digital Scam & Phishing Detection",
)

# Configure CORS Middleware allowing local frontend and wildcard
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Top 50 Targeted Brands for Typosquatting Matcher
TOP_BRANDS = [
    "paypal", "google", "microsoft", "apple", "amazon", "netflix", "facebook",
    "instagram", "whatsapp", "chase", "bankofamerica", "wellsfargo", "citibank",
    "dropbox", "linkedin", "twitter", "fedex", "ups", "usps", "dhl",
    "irs", "gov", "binance", "coinbase", "metamask", "steam", "adobe",
    "yahoo", "outlook", "ebay", "target", "walmart", "bestbuy", "att",
    "verizon", "tmobile", "sprint", "hcl", "tcs", "infosys", "icici",
    "hdfc", "sbi", "axis", "kotak", "paytm", "phonepe", "gpay", "slack"
]


# ============================================================================
# Heuristic Fallback & Evaluation Engine (Deterministic Layer 1)
# ============================================================================

def _extract_urls_from_text(text: str) -> List[str]:
    """Extract URLs embedded in text using regex."""
    url_pattern = re.compile(
        r"https?://(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(?::\d+)?(?:/[^\s]*)?",
        re.IGNORECASE,
    )
    return url_pattern.findall(text)


def _compute_offline_heuristics(url_or_text: str) -> Dict[str, Any]:
    """
    Deterministic safety evaluation using domain structure and Levenshtein brand distance.
    Used directly or as guaranteed fallback if external safety modules fail.
    """
    import tldextract
    import Levenshtein

    target_url = url_or_text.strip()
    extracted_urls = _extract_urls_from_text(target_url)
    if extracted_urls:
        target_url = extracted_urls[0]

    # Prepend scheme if missing for proper parsing
    if not target_url.startswith(("http://", "https://")):
        url_to_parse = "https://" + target_url
    else:
        url_to_parse = target_url

    parsed = urlparse(url_to_parse)
    hostname = (parsed.hostname or target_url).lower()

    ext = tldextract.extract(hostname)
    domain_label = ext.domain.lower()
    root_domain = f"{ext.domain}.{ext.suffix}" if ext.suffix else domain_label
    subdomain = ext.subdomain.lower()

    heuristic_flags: List[str] = []
    is_spoofed = False
    lookalike_brand: Optional[str] = None
    character_substitution: Optional[str] = None
    heuristic_score = 0

    # 1. Raw IP address check
    ip_pattern = re.compile(r"^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$")
    if ip_pattern.match(hostname):
        heuristic_flags.append("Host is a raw numerical IP address rather than a domain name.")
        heuristic_score += 45

    # 2. Risky / Abuse-Prone TLD check
    risky_tlds = {"top", "xyz", "buzz", "club", "live", "work", "icu", "cyou", "fit", "monster", "cfd"}
    if ext.suffix in risky_tlds:
        heuristic_flags.append(f"Domain uses high-abuse disposable TLD (.{ext.suffix}).")
        heuristic_score += 30

    # 3. Excessive subdomains check
    subdomain_parts = [p for p in subdomain.split(".") if p]
    if len(subdomain_parts) >= 2:
        heuristic_flags.append("Suspicious excessive subdomains prepended to mask apex domain.")
        heuristic_score += 25

    # 4. Levenshtein Typosquatting check against Top Brands across full domain and hyphenated tokens
    domain_tokens = [domain_label] + [t for t in domain_label.split("-") if t]

    for brand in TOP_BRANDS:
        if is_spoofed:
            break

        # Check subdomains for deceptive brand mimicry
        for sub in subdomain_parts:
            if sub == brand or (len(brand) >= 4 and Levenshtein.distance(sub, brand) <= 1):
                is_spoofed = True
                lookalike_brand = brand
                character_substitution = f"Brand mimicry in subdomain '{sub}'"
                heuristic_flags.append(f"Deceptive brand name '{brand}' embedded in subdomain to disguise apex domain.")
                heuristic_score += 65
                break

        if is_spoofed:
            break

        # Check full domain and tokens
        for token in domain_tokens:
            if not token or len(token) < 3:
                continue

            dist = Levenshtein.distance(token, brand)
            if dist == 0 and len(domain_tokens) > 1 and token != domain_label:
                # e.g. paypal-update.com -> token is paypal
                is_spoofed = True
                lookalike_brand = brand
                character_substitution = f"Brand keyword '{brand}' combined with misleading hyphenated terms"
                heuristic_flags.append(f"Deceptive keyword stuffing: mimics '{brand}' in domain name.")
                heuristic_score += 70
                break
            elif 1 <= dist <= 2 and len(brand) >= 4 and abs(len(token) - len(brand)) <= 2:
                # e.g. paypa1, micros0ft
                is_spoofed = True
                lookalike_brand = brand
                character_substitution = f"Levenshtein edit distance of {dist} between '{token}' and brand '{brand}'"
                heuristic_flags.append(f"Typosquatting detected: '{token}' mimics legitimate brand '{brand}'.")
                heuristic_score += 75
                break

    is_https = url_to_parse.startswith("https://")
    https_status = HttpsStatus(
        present=is_https,
        note="Uses standard SSL encryption." if is_https else "Unencrypted HTTP connection detected.",
    )

    return {
        "submitted_url": target_url,
        "actual_domain": root_domain or hostname,
        "is_spoofed": is_spoofed,
        "lookalike_brand": lookalike_brand,
        "character_substitution": character_substitution,
        "https_status": https_status,
        "heuristic_flags": heuristic_flags,
        "heuristic_score": min(heuristic_score, 100),
    }


def _compute_offline_text_heuristics(text: str) -> Dict[str, Any]:
    """
    Evaluates message text for common psychological scam cues (urgency, threats, credential requests)
    when running offline or during AI fallback.
    """
    lower = text.lower()
    score = 0
    cues_detected: List[str] = []
    quotes: List[str] = []

    urgency_patterns = [
        ("locked", "Account lock / restriction threat"),
        ("suspended", "Account suspension threat"),
        ("seized", "Asset seizure coercion"),
        ("freeze", "Financial freeze threat"),
        ("frozen", "Financial freeze threat"),
        ("immediate", "Artificial time urgency"),
        ("immediately", "Artificial time urgency"),
        ("overdue", "Financial debt pressure"),
        ("urgent", "Explicit urgency indicator"),
        ("within 24 hours", "Artificial deadline constraint"),
        ("final notice", "Escalation intimidation"),
        ("verify your identity", "Credential harvesting solicitation"),
        ("wire transfer", "Irreversible funds transfer demand"),
        ("otp", "One-time passcode harvesting"),
        ("password", "Direct credential solicitation"),
    ]

    for pattern, description in urgency_patterns:
        if pattern in lower:
            score += 20
            cues_detected.append(description)
            # Find matching snippet
            idx = lower.find(pattern)
            start = max(0, idx - 15)
            end = min(len(text), idx + len(pattern) + 25)
            quotes.append(text[start:end].strip())

    return {
        "score": min(score, 90),
        "cues": cues_detected,
        "quotes": quotes[:3],
    }


# ============================================================================
# Core Pipeline Execution
# ============================================================================

def _run_full_pipeline(
    raw_text: Optional[str] = None,
    raw_url: Optional[str] = None,
    image_bytes: Optional[bytes] = None,
) -> ThreatAnalysisResponse:
    """
    Coordinates media extraction, deterministic heuristics, and AI intent evaluation.
    Enforces the composite risk score formula:
      - If heuristics.is_spoofed == True -> FORCE threat_level="CRITICAL", score>=85
      - Else -> composite_score = int(0.4 * heuristic_score + 0.6 * ai_score)
    """
    extracted_text = raw_text or ""
    effective_url = raw_url
    qr_urls: List[str] = []

    # ------------------------------------------------------------------------
    # Step 1: Media Ingestion & QR Forensics (Member 4)
    # ------------------------------------------------------------------------
    if image_bytes:
        try:
            from backend.integrations.media_extractor import MediaExtractor
            extractor = MediaExtractor()
            extraction = extractor.extract(image_bytes)

            if extraction.has_qr:
                for qr in extraction.qr_codes:
                    qr_urls.append(qr.payload)
                if not effective_url and qr_urls:
                    effective_url = qr_urls[0]
        except Exception as e:
            logger.warning(f"Media extraction encountered non-fatal error: {e}")

    # Combine text and extracted info
    combined_content = extracted_text
    if effective_url and effective_url not in combined_content:
        combined_content = f"{combined_content} {effective_url}".strip()

    # ------------------------------------------------------------------------
    # Step 2: Layer 1 Deterministic Heuristics (Member 3 / Local Engine)
    # ------------------------------------------------------------------------
    heuristic_data: Optional[Dict[str, Any]] = None
    text_heuristics = _compute_offline_text_heuristics(combined_content) if combined_content else {"score": 0, "cues": [], "quotes": []}

    if effective_url or _extract_urls_from_text(combined_content):
        eval_target = effective_url or _extract_urls_from_text(combined_content)[0]
        try:
            # Attempt to use Member 3's heuristics module if available
            from backend.safety.heuristics import evaluate_url  # type: ignore
            heuristic_data = evaluate_url(eval_target)
        except Exception:
            heuristic_data = _compute_offline_heuristics(eval_target)

    heuristic_score = heuristic_data.get("heuristic_score", 0) if heuristic_data else 0
    # Blend with text heuristic score if text triggers were found
    if text_heuristics["score"] > 0:
        heuristic_score = max(heuristic_score, text_heuristics["score"])

    is_spoofed = heuristic_data.get("is_spoofed", False) if heuristic_data else False
    target_impersonated = heuristic_data.get("lookalike_brand") if heuristic_data else None

    # ------------------------------------------------------------------------
    # Step 3: Layer 2 AI Social Engineering & Intent (Member 4)
    # ------------------------------------------------------------------------
    ai_score = 0
    urgency_level = UrgencyLevel.UNKNOWN
    tactics_detected: List[str] = []
    highlighted_quotes: List[Any] = []
    plain_english_explanation = ""
    summary_verdict = ""
    ai_available = False

    try:
        from backend.ai.gemini_client import GeminiPhishGuardClient
        client = GeminiPhishGuardClient()

        if image_bytes:
            ai_result = client.analyze_media(media_input=image_bytes, additional_text=combined_content)
        else:
            ai_result = client.analyze_text(text=combined_content or effective_url or "Analysis payload")

        ai_score = ai_result.confidence_score
        summary_verdict = ai_result.summary_verdict
        plain_english_explanation = ai_result.plain_english_explanation
        target_impersonated = target_impersonated or ai_result.primary_brand_target

        # Map AI tactics and quotes
        tactics_detected = [finding.explanation for finding in ai_result.tactics_identified]
        highlighted_quotes = [
            {
                "quote": finding.evidence_quote,
                "category": finding.technique.value,
                "reason": finding.explanation,
            }
            if finding.evidence_quote else finding.explanation
            for finding in ai_result.tactics_identified
        ]
        urgency_level = UrgencyLevel.HIGH if ai_score >= 70 else (
            UrgencyLevel.MODERATE if ai_score >= 35 else UrgencyLevel.NONE
        )
        ai_available = True
    except Exception as e:
        logger.info(f"AI Engine fallback engaged: {e}")
        # Graceful degradation per playbook
        ai_score = heuristic_score
        urgency_level = UrgencyLevel.HIGH if text_heuristics["score"] >= 60 else (
            UrgencyLevel.MODERATE if text_heuristics["score"] >= 30 else UrgencyLevel.UNKNOWN
        )
        tactics_detected = text_heuristics["cues"]
        highlighted_quotes = text_heuristics["quotes"]

        if is_spoofed:
            summary_verdict = f"Deceptive Brand Lookalike Detected ({target_impersonated or 'Brand Spoof'})"
            plain_english_explanation = (
                f"This link points to an unauthorized domain engineered to mimic {target_impersonated or 'a legitimate brand'}. "
                "Attackers use lookalike domains to harvest sensitive passwords and OTPs."
            )
        elif heuristic_score >= 40:
            summary_verdict = "Suspicious Communication & High-Risk Indicators"
            plain_english_explanation = (
                "Structural heuristics and text analysis identified high-urgency keywords and suspicious characteristics. "
                "AI intent scan was completed via offline telemetry fallback."
            )
        else:
            summary_verdict = "Payload Analyzed — No Critical Deception Flagged"
            plain_english_explanation = (
                "No critical domain spoofing, typosquatting, or high-risk infrastructure anomalies were detected. "
                "Always remain vigilant when entering personal or financial details."
            )

    # ------------------------------------------------------------------------
    # Step 4: Composite Risk Synthesizer
    # ------------------------------------------------------------------------
    if is_spoofed:
        final_threat_level = ThreatLevel.CRITICAL
        final_risk_score = max(heuristic_score, 88)
    else:
        if ai_available:
            final_risk_score = int(0.4 * heuristic_score + 0.6 * ai_score)
        else:
            final_risk_score = heuristic_score

        if final_risk_score >= 70:
            final_threat_level = ThreatLevel.CRITICAL
        elif final_risk_score >= 35:
            final_threat_level = ThreatLevel.SUSPICIOUS
        else:
            final_threat_level = ThreatLevel.SAFE

    # Ensure verdict is populated
    if not summary_verdict:
        if final_threat_level == ThreatLevel.CRITICAL:
            summary_verdict = "High-Risk Phishing & Impersonation Detected"
        elif final_threat_level == ThreatLevel.SUSPICIOUS:
            summary_verdict = "Suspicious Digital Communication Flagged"
        else:
            summary_verdict = "Payload Cleared — Low Risk Indicated"

    if not plain_english_explanation:
        plain_english_explanation = (
            "Analysis complete. The submitted payload was evaluated across offline brand heuristics "
            "and psychological coercion patterns."
        )

    # Build WhyDangerous Decomposition
    why_dangerous: List[WhyDangerousItem] = []
    if is_spoofed:
        why_dangerous.append(
            WhyDangerousItem(
                title="Brand Typosquatting Mimicry",
                description=f"Domain mimics legitimate trademark '{target_impersonated or 'Authorized Brand'}' to mislead users.",
                severity=SeverityLevel.CRITICAL,
            )
        )
    if qr_urls:
        why_dangerous.append(
            WhyDangerousItem(
                title="Embedded QR Code (Quishing Vector)",
                description=f"Extracted hidden destination link: {qr_urls[0]}",
                severity=SeverityLevel.HIGH,
            )
        )
    if final_threat_level == ThreatLevel.CRITICAL and not why_dangerous:
        why_dangerous.append(
            WhyDangerousItem(
                title="Severe Credential Theft & Coercion Threat",
                description="Message exhibits high psychological manipulation and urgent demands for sensitive information.",
                severity=SeverityLevel.CRITICAL,
            )
        )

    # Build Recommended Actions
    recommended_actions: List[str] = []
    if final_threat_level == ThreatLevel.CRITICAL:
        recommended_actions = [
            "DO NOT click the link or enter any passwords, UPI PINs, or card details.",
            "Do NOT call phone numbers or reply to email addresses contained in the message.",
            "Navigate to the official provider portal manually in your web browser.",
            "Warn your family or team members about this active scam lure.",
        ]
    elif final_threat_level == ThreatLevel.SUSPICIOUS:
        recommended_actions = [
            "Verify the sender's identity through a separate, trusted communication channel.",
            "Inspect the apex domain carefully before proceeding.",
            "Never share OTPs or two-factor authentication prompts with unverified parties.",
        ]
    else:
        recommended_actions = [
            "Payload exhibits standard benign patterns; normal digital hygiene is recommended.",
            "Continue to verify unknown sender addresses and avoid entering credentials on unencrypted pages.",
        ]

    # Build URL analysis schema if applicable
    url_analysis_obj = None
    if heuristic_data:
        url_analysis_obj = UrlAnalysis(
            submitted_url=heuristic_data.get("submitted_url", ""),
            actual_domain=heuristic_data.get("actual_domain", ""),
            is_spoofed=heuristic_data.get("is_spoofed", False),
            lookalike_brand=heuristic_data.get("lookalike_brand"),
            character_substitution=heuristic_data.get("character_substitution"),
            https_status=heuristic_data.get("https_status"),
            heuristic_flags=heuristic_data.get("heuristic_flags", []),
        )

    # Build AI Social Engineering schema
    ai_social_obj = AiSocialEngineering(
        urgency_level=urgency_level,
        tactics_detected=tactics_detected,
        highlighted_quotes=highlighted_quotes,
        manipulation_pattern="Urgency & Authority Lure" if final_threat_level == ThreatLevel.CRITICAL else None,
        evidence_level="Live Multimodal Telemetry" if ai_available else "Offline Heuristic Signal",
    )

    scan_id = f"scan_{uuid.uuid4().hex[:10]}"

    return ThreatAnalysisResponse(
        scan_id=scan_id,
        threat_level=final_threat_level,
        risk_score=final_risk_score,
        summary_verdict=summary_verdict,
        plain_english_explanation=plain_english_explanation,
        target_impersonated=target_impersonated,
        submitted_content=combined_content or effective_url,
        created_at=datetime.now(timezone.utc).isoformat(),
        url_analysis=url_analysis_obj,
        ai_social_engineering=ai_social_obj,
        why_dangerous=why_dangerous,
        recommended_actions=recommended_actions,
    )


# ============================================================================
# API Routes
# ============================================================================

@app.get("/api/health", response_model=HealthResponse)
async def health_check():
    """Walking skeleton & health check endpoint."""
    return HealthResponse(
        ok=True,
        service="PhishGuard AI Engine",
        status="online",
        version=app.version,
    )


@app.post(
    "/api/analyze",
    response_model=ThreatAnalysisResponse,
    status_code=status.HTTP_200_OK,
)
async def analyze_unified(
    request: Request,
    text: Optional[str] = Form(None),
    url: Optional[str] = Form(None),
    content: Optional[str] = Form(None),
    type: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    image: Optional[UploadFile] = File(None),
):
    """
    Unified endpoint accepting standard JSON or Multipart Form.
    Follows docs/06a-api-contract.md and frontend client api.js.
    """
    content_type = request.headers.get("content-type", "")

    # Handle standard JSON body
    if "application/json" in content_type:
        try:
            body_dict = await request.json()
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail={"error": "INVALID_JSON", "message": "Failed to parse request JSON payload."},
            )

        req_obj = AnalyzeRequest.model_validate(body_dict)
        final_text = req_obj.text or (req_obj.content if req_obj.type != "url" else None)
        final_url = req_obj.url or (req_obj.content if req_obj.type == "url" else None)

        if not final_text and not final_url:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail={"error": "VALIDATION_FAILED", "message": "At least one input (text, url, or image file) must be provided."},
            )

        return _run_full_pipeline(raw_text=final_text, raw_url=final_url)

    # Handle multipart / form-data
    effective_file = file or image
    file_bytes: Optional[bytes] = None
    if effective_file:
        file_bytes = await effective_file.read()

    final_text = text or (content if type != "url" else None)
    final_url = url or (content if type == "url" else None)

    if not final_text and not final_url and not file_bytes:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={"error": "VALIDATION_FAILED", "message": "At least one input (text, url, or image file) must be provided."},
        )

    return _run_full_pipeline(raw_text=final_text, raw_url=final_url, image_bytes=file_bytes)


@app.post("/api/analyze/text", response_model=ThreatAnalysisResponse)
async def analyze_text_alias(request: Request):
    """Specialized text alias endpoint for frontend compatibility."""
    return await analyze_unified(request=request)


@app.post("/api/analyze/url", response_model=ThreatAnalysisResponse)
async def analyze_url_alias(request: Request):
    """Specialized URL alias endpoint for frontend compatibility."""
    return await analyze_unified(request=request)
