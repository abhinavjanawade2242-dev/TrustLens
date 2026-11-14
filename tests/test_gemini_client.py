"""
Unit tests for backend/ai/gemini_client.py.
Mocks the Google GenAI SDK to verify structured JSON parsing, prompt assembly,
error handling, and exact quote preservation without making live API calls.
"""

import json
from unittest.mock import MagicMock, patch

import pytest
from google.genai import errors
from PIL import Image

from backend.ai.gemini_client import (
    GeminiAnalysisError,
    GeminiConfigurationError,
    GeminiPhishGuardClient,
    PhishGuardAnalysisResult,
    SeverityLevel,
    SocialEngineeringTechnique,
    ThreatLevel,
)
from backend.integrations.media_extractor import MediaExtractionResult, QRCodeResult


MOCK_PHISHING_RESPONSE_JSON = json.dumps({
    "is_phishing": True,
    "threat_level": "CRITICAL",
    "confidence_score": 0.96,
    "summary": "Urgent executive impersonation demanding immediate credential verification via fake IT link.",
    "detected_techniques": [
        {
            "technique": "AUTHORITY_IMPERSONATION",
            "severity": "CRITICAL",
            "explanation": "Attacker impersonates the corporate VP of IT Security.",
            "evidence_quote": "This is Mark from IT Security Operations"
        },
        {
            "technique": "URGENCY",
            "severity": "HIGH",
            "explanation": "Threatens immediate account lockout within 30 minutes.",
            "evidence_quote": "Your access will be terminated within 30 minutes"
        },
        {
            "technique": "CREDENTIAL_HARVESTING",
            "severity": "CRITICAL",
            "explanation": "Demands user enter domain credentials and MFA token.",
            "evidence_quote": "confirm your corporate password and 6-digit MFA token"
        }
    ],
    "suspicious_quotes": [
        "This is Mark from IT Security Operations",
        "Your access will be terminated within 30 minutes",
        "confirm your corporate password and 6-digit MFA token"
    ],
    "quishing_indicators": {
        "is_quishing_suspected": False,
        "qr_instructions_found": False,
        "qr_target_assessment": None,
        "decoded_url_suspicious": None
    },
    "actionable_recommendations": [
        "Do not provide credentials or MFA tokens under any circumstances.",
        "Report the email to security-alerts@company.internal.",
        "Contact IT helpdesk through verified directory numbers."
    ]
})

MOCK_QUISHING_RESPONSE_JSON = json.dumps({
    "is_phishing": True,
    "threat_level": "CRITICAL",
    "confidence_score": 0.99,
    "summary": "Quishing attack using embedded QR code to bypass secure email gateways.",
    "detected_techniques": [
        {
            "technique": "QUISHING",
            "severity": "CRITICAL",
            "explanation": "Embedded QR code redirects to an off-network credential capture server.",
            "evidence_quote": "Scan this QR code with your mobile device to verify multi-factor authentication"
        },
        {
            "technique": "OTP_REQUEST",
            "severity": "HIGH",
            "explanation": "Prompts victim to authenticate 2FA off-device.",
            "evidence_quote": "verify multi-factor authentication"
        }
    ],
    "suspicious_quotes": [
        "Scan this QR code with your mobile device to verify multi-factor authentication"
    ],
    "quishing_indicators": {
        "is_quishing_suspected": True,
        "qr_instructions_found": True,
        "qr_target_assessment": "Points to an untrusted external host: http://evil-login.net/auth",
        "decoded_url_suspicious": True
    },
    "actionable_recommendations": [
        "Do not scan QR codes embedded in unsolicited communications.",
        "MFA resets should only be initiated through standard internal IT ticketing."
    ]
})


@pytest.fixture
def mock_genai_client():
    client = MagicMock()
    mock_response = MagicMock()
    mock_response.text = MOCK_PHISHING_RESPONSE_JSON
    client.models.generate_content.return_value = mock_response
    return client


class TestGeminiPhishGuardClient:

    def test_initialization_with_key_and_defaults(self):
        client = GeminiPhishGuardClient(api_key="TEST_KEY_12345")
        assert client.api_key == "TEST_KEY_12345"
        assert client.model == "gemini-3.5-flash-lite"
        assert len(client.system_prompt) > 100
        assert "PhishGuard AI" in client.system_prompt

    def test_missing_api_key_raises_configuration_error(self, monkeypatch):
        monkeypatch.delenv("GEMINI_API_KEY", raising=False)
        client = GeminiPhishGuardClient(api_key=None)
        with pytest.raises(GeminiConfigurationError, match="GEMINI_API_KEY is not configured"):
            _ = client.client

    def test_custom_model_configuration(self):
        client = GeminiPhishGuardClient(api_key="TEST_KEY", model="gemini-2.0-flash")
        assert client.model == "gemini-2.0-flash"

    def test_analyze_text_success(self, mock_genai_client):
        phishguard = GeminiPhishGuardClient(client=mock_genai_client)

        input_text = (
            "From: IT Support\n"
            "This is Mark from IT Security Operations. "
            "Your access will be terminated within 30 minutes unless you "
            "confirm your corporate password and 6-digit MFA token."
        )

        result = phishguard.analyze_text(input_text)

        assert isinstance(result, PhishGuardAnalysisResult)
        assert result.is_phishing is True
        assert result.threat_level == ThreatLevel.CRITICAL
        assert result.confidence_score == 0.96
        assert len(result.detected_techniques) == 3

        # Verify exact quote preservation
        assert "This is Mark from IT Security Operations" in result.suspicious_quotes
        assert "Your access will be terminated within 30 minutes" in result.suspicious_quotes

        # Verify technique classification
        techniques = [t.technique for t in result.detected_techniques]
        assert SocialEngineeringTechnique.AUTHORITY_IMPERSONATION in techniques
        assert SocialEngineeringTechnique.URGENCY in techniques
        assert SocialEngineeringTechnique.CREDENTIAL_HARVESTING in techniques

        # Verify SDK generate_content was called with schema
        mock_genai_client.models.generate_content.assert_called_once()
        _, kwargs = mock_genai_client.models.generate_content.call_args
        assert kwargs["config"].response_mime_type == "application/json"
        assert kwargs["config"].response_schema == PhishGuardAnalysisResult

    def test_analyze_text_empty_input_raises_value_error(self, mock_genai_client):
        phishguard = GeminiPhishGuardClient(client=mock_genai_client)
        with pytest.raises(ValueError, match="cannot be empty"):
            phishguard.analyze_text("   ")

    def test_analyze_media_quishing_multimodal(self, mock_genai_client):
        # Configure mock for quishing response
        quishing_response = MagicMock()
        quishing_response.text = MOCK_QUISHING_RESPONSE_JSON
        mock_genai_client.models.generate_content.return_value = quishing_response

        phishguard = GeminiPhishGuardClient(client=mock_genai_client)

        # Create a mock MediaExtractionResult
        dummy_extraction = MediaExtractionResult(
            has_qr=True,
            qr_codes=[
                QRCodeResult(
                    payload="http://evil-login.net/auth",
                    bounding_box={"x": 10, "y": 10, "width": 100, "height": 100},
                )
            ],
            image_format="PNG",
            dimensions=(300, 300),
            raw_bytes=b"\x89PNG\r\n\x1a\nfake_image_bytes",
            extracted_text_hints=["http://evil-login.net/auth"],
        )

        result = phishguard.analyze_media(
            media_input=dummy_extraction,
            additional_text="Scan this QR code with your mobile device to verify multi-factor authentication",
        )

        assert result.is_phishing is True
        assert result.threat_level == ThreatLevel.CRITICAL
        assert result.quishing_indicators is not None
        assert result.quishing_indicators.is_quishing_suspected is True
        assert result.quishing_indicators.decoded_url_suspicious is True
        assert "Scan this QR code with your mobile device to verify multi-factor authentication" in result.suspicious_quotes

    def test_markdown_code_fence_cleaning(self, mock_genai_client):
        # Test that raw text wrapped in ```json ... ``` is stripped and parsed cleanly
        fenced_response = MagicMock()
        fenced_response.text = f"```json\n{MOCK_PHISHING_RESPONSE_JSON}\n```"
        mock_genai_client.models.generate_content.return_value = fenced_response

        phishguard = GeminiPhishGuardClient(client=mock_genai_client)
        result = phishguard.analyze_text("Suspicious test email")

        assert result.is_phishing is True
        assert result.threat_level == ThreatLevel.CRITICAL

    def test_gemini_api_error_handling(self, mock_genai_client):
        # Simulate an API error during generate_content
        mock_genai_client.models.generate_content.side_effect = Exception("Service unavailable 503")

        phishguard = GeminiPhishGuardClient(client=mock_genai_client)
        with pytest.raises(GeminiAnalysisError, match="Unexpected error communicating with Gemini API"):
            phishguard.analyze_text("Test email content")

    def test_analyze_multimodal_no_input_raises_value_error(self, mock_genai_client):
        phishguard = GeminiPhishGuardClient(client=mock_genai_client)
        with pytest.raises(ValueError, match="At least text or image must be provided"):
            phishguard.analyze_multimodal(text=None, image=None)
