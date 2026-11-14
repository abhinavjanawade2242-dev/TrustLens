"""Contract Invariance, Route Verification & Risk Synthesizer Tests for PhishGuard AI / TrustLens.

Verifies:
1. GET /api/health schema and status
2. POST /api/analyze (JSON & multipart)
3. POST /api/analyze/text and POST /api/analyze/url aliases
4. Composite risk synthesizer rule:
   - IF heuristics.is_spoofed == True -> FORCE threat_level="CRITICAL", score >= 85
5. Error handling: HTTP 422 on empty inputs
6. Strict schema validation against ThreatAnalysisResponse and shared/sample-threat.json

Author: Abhinav (Member 2 - Backend & System Orchestrator Lead)
"""

import io
import json
from pathlib import Path
import pytest
from pydantic import ValidationError
from fastapi.testclient import TestClient

from backend.schemas import (
    AnalyzeRequest,
    HealthResponse,
    ThreatAnalysisResponse,
    ThreatLevel,
    UrgencyLevel,
)
from backend.main import app

client = TestClient(app)


def test_health_endpoint_contract():
    """Verify GET /api/health conforms strictly to contract."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    validated = HealthResponse.model_validate(data)
    assert validated.ok is True
    assert validated.status in ["online", "operational"]
    assert validated.service == "PhishGuard AI Engine"
    assert validated.version == "1.0.0"


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


def test_analyze_endpoint_json_contract():
    """Verify POST /api/analyze with standard JSON returns valid ThreatAnalysisResponse."""
    payload = {
        "text": "Your account has been restricted. Verify your identity immediately.",
        "url": "https://service-notice.example",
    }
    response = client.post("/api/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    validated = ThreatAnalysisResponse.model_validate(data)
    assert validated.scan_id.startswith("scan_")
    assert validated.threat_level in [ThreatLevel.SAFE, ThreatLevel.SUSPICIOUS, ThreatLevel.CRITICAL]
    assert 0 <= validated.risk_score <= 100
    assert len(validated.recommended_actions) > 0


def test_analyze_endpoint_frontend_ui_format():
    """Verify POST /api/analyze accepts frontend api.js format {type, content}."""
    payload = {
        "type": "text",
        "content": "Urgent wire payment request for overdue invoice #8892.",
    }
    response = client.post("/api/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    validated = ThreatAnalysisResponse.model_validate(data)
    assert validated.scan_id is not None
    assert validated.risk_score >= 0


def test_typosquatting_forces_critical_threat_level():
    """
    Playbook directive:
    IF heuristics.is_spoofed == True -> FORCE threat_level="CRITICAL", score >= 85
    """
    payload = {
        "type": "url",
        "content": "https://paypa1-security-center.com/login",
    }
    response = client.post("/api/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    validated = ThreatAnalysisResponse.model_validate(data)
    assert validated.threat_level == ThreatLevel.CRITICAL
    assert validated.risk_score >= 85
    assert validated.url_analysis is not None
    assert validated.url_analysis.is_spoofed is True
    assert validated.target_impersonated == "paypal"


def test_analyze_url_alias_route():
    """Verify POST /api/analyze/url alias used by frontend works seamlessly."""
    payload = {
        "type": "url",
        "content": "https://netflix-verify-billing.xyz",
    }
    response = client.post("/api/analyze/url", json=payload)
    assert response.status_code == 200
    data = response.json()
    validated = ThreatAnalysisResponse.model_validate(data)
    assert validated.threat_level == ThreatLevel.CRITICAL
    assert validated.risk_score >= 85
    assert validated.url_analysis.is_spoofed is True


def test_analyze_text_alias_route():
    """Verify POST /api/analyze/text alias used by frontend works seamlessly."""
    payload = {
        "type": "text",
        "content": "Your bank account has been locked. Verify immediately or funds will be seized.",
    }
    response = client.post("/api/analyze/text", json=payload)
    assert response.status_code == 200
    data = response.json()
    validated = ThreatAnalysisResponse.model_validate(data)
    assert validated.risk_score > 0
    assert len(validated.plain_english_explanation) > 0


def test_analyze_multipart_upload():
    """Verify POST /api/analyze supports multipart image upload."""
    # Create minimal 1x1 dummy PNG in-memory
    dummy_png = (
        b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15c4"
        b"\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82"
    )
    files = {"image": ("test.png", dummy_png, "image/png")}
    data = {"type": "image", "content": "Screenshot payment lure"}
    response = client.post("/api/analyze", files=files, data=data)
    assert response.status_code == 200
    res_data = response.json()
    validated = ThreatAnalysisResponse.model_validate(res_data)
    assert validated.scan_id is not None


def test_empty_input_returns_422():
    """Verify 422 Unprocessable Entity when all inputs are empty."""
    response = client.post("/api/analyze", json={})
    assert response.status_code == 422
    err_data = response.json()
    assert "detail" in err_data


@pytest.mark.parametrize(
    "fixture_name, expected_threat_level",
    [
        ("t01_ceo_fraud.json", ThreatLevel.CRITICAL),
        ("t02_typosquat_paypal.json", ThreatLevel.CRITICAL),
        ("t03_package_smishing.json", ThreatLevel.SUSPICIOUS),
        ("t04_clean_email.json", ThreatLevel.SAFE),
    ],
)
def test_shared_scam_fixtures_validate_contract(fixture_name, expected_threat_level):
    """Verify all shared scam fixtures strictly conform to ThreatAnalysisResponse."""
    fixture_path = Path("tests/fixtures") / fixture_name
    assert fixture_path.exists(), f"Fixture {fixture_name} must exist"

    with open(fixture_path, "r", encoding="utf-8") as f:
        payload = json.load(f)

    threat = ThreatAnalysisResponse.model_validate(payload)
    assert threat.threat_level == expected_threat_level
    assert 0 <= threat.risk_score <= 100
    assert len(threat.summary_verdict) > 0
    assert len(threat.plain_english_explanation) > 0
    assert len(threat.recommended_actions) > 0

