"""Contract Invariance & Schema Tests for PhishGuard AI / TrustLens.
Ensures the backend API response strictly conforms to docs/06a-api-contract.md
and shared/sample-threat.json without breaking frontend components.

Author: Abhinav (Member 2 - Backend & System Orchestrator Lead)
"""

import json
from pathlib import Path
import pytest
from pydantic import ValidationError

from backend.schemas import (
    ThreatAnalysisResponse,
    ThreatLevel,
    UrgencyLevel,
    HealthResponse,
    AnalyzeRequest,
)
from backend.main import app
from fastapi.testclient import TestClient

client = TestClient(app)


def test_health_endpoint_contract():
    """Verify GET /api/health conforms to contract."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    validated = HealthResponse.model_validate(data)
    assert validated.ok is True
    assert validated.status in ["online", "operational"]
    assert "service" in data
    assert "version" in data


def test_sample_threat_fixture_matches_contract():
    """Verify shared/sample-threat.json satisfies the strict Pydantic model."""
    fixture_path = Path("shared/sample-threat.json")
    assert fixture_path.exists(), "shared/sample-threat.json must exist"

    with open(fixture_path, "r", encoding="utf-8") as f:
        payload = json.load(f)

    threat = ThreatAnalysisResponse.model_validate(payload)
    assert threat.threat_level == ThreatLevel.CRITICAL
    assert 0 <= threat.risk_score <= 100
    assert threat.target_impersonated == "BrandName"
    assert threat.url_analysis is not None
    assert threat.url_analysis.is_spoofed is True
    assert threat.ai_social_engineering is not None
    assert len(threat.recommended_actions) > 0


def test_schema_rejects_out_of_bounds_score():
    """Verify Pydantic enforces 0 <= risk_score <= 100."""
    valid_base = {
        "scan_id": "test_001",
        "threat_level": "SAFE",
        "risk_score": 105,  # Invalid: > 100
        "summary_verdict": "Test",
        "plain_english_explanation": "Test",
    }
    with pytest.raises(ValidationError):
        ThreatAnalysisResponse.model_validate(valid_base)


def test_schema_rejects_invalid_threat_level():
    """Verify threat_level is strictly constrained to SAFE, SUSPICIOUS, CRITICAL."""
    valid_base = {
        "scan_id": "test_002",
        "threat_level": "MODERATE_RISK",  # Invalid enum
        "risk_score": 50,
        "summary_verdict": "Test",
        "plain_english_explanation": "Test",
    }
    with pytest.raises(ValidationError):
        ThreatAnalysisResponse.model_validate(valid_base)


def test_analyze_request_supports_both_contract_and_ui_shapes():
    """Verify AnalyzeRequest parses both {text, url} and {type, content}."""
    # Standard contract format
    req1 = AnalyzeRequest.model_validate({"text": "Suspicious SMS", "url": "https://evil.example"})
    assert req1.text == "Suspicious SMS"
    assert req1.url == "https://evil.example"

    # UI api.js format
    req2 = AnalyzeRequest.model_validate({"type": "url", "content": "https://evil.example"})
    assert req2.type == "url"
    assert req2.content == "https://evil.example"
