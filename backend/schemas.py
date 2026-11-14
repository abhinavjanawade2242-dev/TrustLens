"""Pydantic schemas for PhishGuard AI / TrustLens API Contract.
Enforces strict schema validation according to docs/06a-api-contract.md and shared/sample-threat.json.
Author: Abhinav (Member 2 - Backend & System Orchestrator Lead)
"""

from enum import Enum
from typing import Any, Dict, List, Optional, Union
from datetime import datetime, timezone
from pydantic import BaseModel, Field, ConfigDict


class ThreatLevel(str, Enum):
    SAFE = "SAFE"
    SUSPICIOUS = "SUSPICIOUS"
    CRITICAL = "CRITICAL"


class UrgencyLevel(str, Enum):
    NONE = "NONE"
    LOW = "LOW"
    MODERATE = "MODERATE"
    HIGH = "HIGH"
    EXTREME = "EXTREME"
    CRITICAL = "CRITICAL"
    UNKNOWN = "UNKNOWN"


class SeverityLevel(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class HttpsStatus(BaseModel):
    model_config = ConfigDict(extra="ignore")
    present: bool = True
    note: Optional[str] = None


class UrlAnalysis(BaseModel):
    model_config = ConfigDict(extra="ignore")
    submitted_url: str
    actual_domain: str
    is_spoofed: bool
    lookalike_brand: Optional[str] = None
    character_substitution: Optional[str] = None
    https_status: Optional[HttpsStatus] = None
    heuristic_flags: List[str] = Field(default_factory=list)


class AiSocialEngineering(BaseModel):
    model_config = ConfigDict(extra="ignore")
    urgency_level: UrgencyLevel = UrgencyLevel.UNKNOWN
    tactics_detected: List[str] = Field(default_factory=list)
    highlighted_quotes: List[Union[str, Dict[str, Any]]] = Field(default_factory=list)
    manipulation_pattern: Optional[str] = None
    evidence_level: Optional[str] = "Live Backend Signal"


class WhyDangerousItem(BaseModel):
    model_config = ConfigDict(extra="ignore")
    title: str
    description: str
    severity: SeverityLevel = SeverityLevel.MEDIUM


class ThreatAnalysisResponse(BaseModel):
    """The canonical Single Source of Truth schema matching shared/sample-threat.json."""
    model_config = ConfigDict(extra="ignore")

    scan_id: str
    threat_level: ThreatLevel
    risk_score: int = Field(ge=0, le=100)
    summary_verdict: str
    plain_english_explanation: str
    target_impersonated: Optional[str] = None
    submitted_content: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    url_analysis: Optional[UrlAnalysis] = None
    ai_social_engineering: Optional[AiSocialEngineering] = None
    why_dangerous: List[WhyDangerousItem] = Field(default_factory=list)
    recommended_actions: List[str] = Field(default_factory=list)


class AnalyzeRequest(BaseModel):
    """Unified JSON request schema supporting both standard contract and UI payloads."""
    model_config = ConfigDict(extra="ignore")

    text: Optional[str] = None
    url: Optional[str] = None
    content: Optional[str] = None
    type: Optional[str] = None  # 'text' | 'url' | 'image'
    submitted_at: Optional[str] = None


class HealthResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")

    ok: bool = True
    service: str = "PhishGuard AI Engine"
    status: str = "online"
    version: str = "1.0.0"
