"""Gemini AI JSON Output & Prompt Regression Tests.
Owner: Member 4 (Adithya - AI & Multimodal Ingestion Specialist)
"""

import pytest
from backend.ai.gemini_client import (
    GeminiPhishGuardClient,
    PhishGuardAnalysisResult,
    ThreatLevel,
    SeverityLevel,
    SocialEngineeringTechnique,
    SocialEngineeringFinding,
)


def test_gemini_client_prompt_loaded():
    """Verify system prompt loads from system_prompt.md."""
    client = GeminiPhishGuardClient(api_key="test_dummy_key")
    assert "PhishGuard AI" in client.system_prompt
    assert "psychological pressure" in client.system_prompt or "urgency" in client.system_prompt


def test_schema_validates_structured_llm_json():
    """Verify PhishGuardAnalysisResult schema validates typical Gemini structured response."""
    sample_llm_json = {
        "is_phishing": True,
        "threat_level": "CRITICAL",
        "confidence_score": 0.94,
        "summary": "Urgent Financial Threat & Wire Fraud impersonating accounting.",
        "detected_techniques": [
            {
                "technique": "URGENCY",
                "severity": "CRITICAL",
                "explanation": "Artificial 2-hour deadline imposed to prevent verification.",
                "evidence_quote": "Failure to transfer funds within the next 2 hours"
            }
        ],
        "suspicious_quotes": [
            "Failure to transfer funds within the next 2 hours"
        ],
        "quishing_indicators": {
            "is_quishing_suspected": False
        },
        "actionable_recommendations": [
            "Do not transfer funds",
            "Contact department via verified internal directory"
        ]
    }
    result = PhishGuardAnalysisResult.model_validate(sample_llm_json)
    assert result.is_phishing is True
    assert result.threat_level == ThreatLevel.CRITICAL
    assert result.confidence_score == 0.94
    assert result.detected_techniques[0].technique == SocialEngineeringTechnique.URGENCY
