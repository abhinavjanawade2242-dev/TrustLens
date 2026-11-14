"""
Gemini Client Module for PhishGuard AI / TrustLens.

Integrates with Google GenAI SDK (google-genai) to perform structured threat
intelligence and social engineering detection with Pydantic v2 validation.
"""

from __future__ import annotations

import json
import os
from enum import Enum
from pathlib import Path
from typing import Any, Dict, List, Optional, Union

from dotenv import load_dotenv
from google import genai
from google.genai import errors, types
from PIL import Image
from pydantic import BaseModel, Field

# Automatically load environment variables from .env
load_dotenv()


class ThreatLevel(str, Enum):
    """Overall threat categorization."""
    SAFE = "SAFE"
    SUSPICIOUS = "SUSPICIOUS"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class SeverityLevel(str, Enum):
    """Severity rating for individual detected tactics."""
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class SocialEngineeringTechnique(str, Enum):
    """Categorization of social engineering tactics."""
    URGENCY = "URGENCY"
    INTIMIDATION = "INTIMIDATION"
    AUTHORITY_IMPERSONATION = "AUTHORITY_IMPERSONATION"
    CREDENTIAL_HARVESTING = "CREDENTIAL_HARVESTING"
    OTP_REQUEST = "OTP_REQUEST"
    QUISHING = "QUISHING"
    DECEPTIVE_LURE = "DECEPTIVE_LURE"
    OTHER = "OTHER"


class SocialEngineeringFinding(BaseModel):
    """Represents a specific social engineering tactic detected in the input."""
    technique: SocialEngineeringTechnique = Field(
        description="The social engineering category detected."
    )
    severity: SeverityLevel = Field(
        description="Severity level of the individual tactic."
    )
    explanation: str = Field(
        description="Detailed explanation of why this tactic was identified."
    )
    evidence_quote: str = Field(
        description="Exact verbatim quotation from the source text demonstrating the tactic."
    )


class QuishingFinding(BaseModel):
    """Detailed indicators regarding QR code phishing (quishing)."""
    is_quishing_suspected: bool = Field(
        default=False,
        description="True if a QR-based attack vector is detected."
    )
    qr_instructions_found: bool = Field(
        default=False,
        description="True if the text lures the victim into scanning an external QR code."
    )
    qr_target_assessment: Optional[str] = Field(
        default=None,
        description="Assessment of any extracted QR URLs or targets."
    )
    decoded_url_suspicious: Optional[bool] = Field(
        default=None,
        description="True if the QR destination appears malicious or deceptive."
    )


class PhishGuardAnalysisResult(BaseModel):
    """Strict structured output schema for PhishGuard AI threat evaluations."""
    is_phishing: bool = Field(
        description="Binary classification indicating if the input is deemed phishing/malicious."
    )
    threat_level: ThreatLevel = Field(
        description="Categorical threat severity assessment."
    )
    confidence_score: float = Field(
        ge=0.0,
        le=1.0,
        description="Model confidence level ranging from 0.0 (unconfident) to 1.0 (certain)."
    )
    summary: str = Field(
        description="Concise executive summary of the threat findings."
    )
    detected_techniques: List[SocialEngineeringFinding] = Field(
        default_factory=list,
        description="List of specific social engineering tactics identified."
    )
    suspicious_quotes: List[str] = Field(
        default_factory=list,
        description="Preserved exact verbatim quotes from the input exhibiting deception."
    )
    quishing_indicators: Optional[QuishingFinding] = Field(
        default=None,
        description="Indicators related to QR code lures or malicious payloads."
    )
    actionable_recommendations: List[str] = Field(
        default_factory=list,
        description="Actionable guidance for the recipient to mitigate risk."
    )


class GeminiError(Exception):
    """Base exception for Gemini client interactions."""
    pass


class GeminiConfigurationError(GeminiError):
    """Raised when the Gemini client is missing required configuration or API key."""
    pass


class GeminiAnalysisError(GeminiError):
    """Raised when analysis fails during generation or schema validation."""
    pass


class GeminiPhishGuardClient:
    """
    Client for performing AI social engineering and quishing analysis via Gemini API
    using the modern google-genai SDK.
    """

    DEFAULT_MODEL = "gemini-2.5-flash"

    def __init__(
        self,
        api_key: Optional[str] = None,
        model: Optional[str] = None,
        system_prompt_path: Optional[Union[str, Path]] = None,
        client: Optional[genai.Client] = None,
    ):
        """
        Initialize the GeminiPhishGuardClient.

        Args:
            api_key: Optional Gemini API key. Defaults to GEMINI_API_KEY environment variable.
            model: Optional model name. Defaults to GEMINI_MODEL or 'gemini-2.5-flash'.
            system_prompt_path: Optional path to custom system prompt markdown file.
            client: Optional pre-configured genai.Client (useful for dependency injection and testing).
        """
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        self.model = model or os.getenv("GEMINI_MODEL", self.DEFAULT_MODEL)
        self._custom_client = client
        self.system_prompt = self._load_system_prompt(system_prompt_path)

    @property
    def client(self) -> genai.Client:
        """Lazily initialize or return the google-genai Client."""
        if self._custom_client is not None:
            return self._custom_client

        if not self.api_key:
            raise GeminiConfigurationError(
                "GEMINI_API_KEY is not configured. Please set the GEMINI_API_KEY "
                "environment variable or pass api_key to GeminiPhishGuardClient."
            )

        try:
            self._custom_client = genai.Client(api_key=self.api_key)
            return self._custom_client
        except Exception as e:
            raise GeminiConfigurationError(f"Failed to initialize Gemini Client: {e}") from e

    def analyze_text(
        self,
        text: str,
        context: Optional[Dict[str, Any]] = None,
    ) -> PhishGuardAnalysisResult:
        """
        Analyze a text payload (email, SMS, message) for social engineering tactics.

        Args:
            text: Source text to inspect.
            context: Optional contextual dictionary (sender, headers, metadata).

        Returns:
            PhishGuardAnalysisResult structured evaluation.
        """
        if not text or not text.strip():
            raise ValueError("Input text cannot be empty or whitespace.")

        prompt_parts: List[Any] = []

        if context:
            context_str = json.dumps(context, indent=2)
            prompt_parts.append(f"Contextual Metadata:\n```json\n{context_str}\n```\n")

        prompt_parts.append(
            f"Analyze the following suspicious communication and preserve exact verbatim quotes:\n\n{text}"
        )

        return self._generate_structured_analysis(prompt_parts)

    def analyze_media(
        self,
        media_input: Any,
        additional_text: Optional[str] = None,
    ) -> PhishGuardAnalysisResult:
        """
        Analyze an image or MediaExtractionResult for visual lures, quishing, and embedded text.

        Args:
            media_input: Either a MediaExtractionResult or an input accepted by MediaExtractor
                         (file path, bytes, or PIL Image).
            additional_text: Optional accompanying message text (e.g. email subject/body).

        Returns:
            PhishGuardAnalysisResult structured evaluation.
        """
        from backend.integrations.media_extractor import MediaExtractionResult, MediaExtractor

        if isinstance(media_input, MediaExtractionResult):
            extraction = media_input
        else:
            extractor = MediaExtractor()
            extraction = extractor.extract(media_input)

        prompt_parts: List[Any] = []

        # Add image as multimodal part
        if extraction.raw_bytes:
            data = extraction.raw_bytes
            if data.startswith(b"\x89PNG"):
                mime_type = "image/png"
            elif data.startswith(b"\xff\xd8"):
                mime_type = "image/jpeg"
            elif data.startswith(b"RIFF") and b"WEBP" in data[:16]:
                mime_type = "image/webp"
            else:
                mime_type = "image/png"

            prompt_parts.append(
                types.Part.from_bytes(data=data, mime_type=mime_type)
            )
        elif extraction.normalized_image is not None:
            prompt_parts.append(extraction.normalized_image)

        # Include extracted QR code forensics if detected
        if extraction.has_qr:
            qr_info = [
                f"- QR Code #{i+1}: Payload = '{qr.payload}'"
                for i, qr in enumerate(extraction.qr_codes)
            ]
            qr_summary = (
                "Forensic Media Extraction detected embedded QR Code(s):\n"
                + "\n".join(qr_info)
                + "\nEvaluate if this QR payload represents a Quishing (QR Phishing) threat.\n"
            )
            prompt_parts.append(qr_summary)

        if additional_text and additional_text.strip():
            prompt_parts.append(f"Accompanying Message Content:\n{additional_text}")

        prompt_parts.append(
            "Analyze the image and all provided metadata for visual lures, authority spoofing, "
            "credential harvesting, or quishing tactics. Preserve exact quotations from visible text."
        )

        return self._generate_structured_analysis(prompt_parts)

    def analyze_multimodal(
        self,
        text: Optional[str] = None,
        image: Optional[Any] = None,
        qr_payloads: Optional[List[str]] = None,
    ) -> PhishGuardAnalysisResult:
        """
        Universal entrypoint accepting text, image, and optional pre-extracted QR payloads.
        """
        if not text and image is None:
            raise ValueError("At least text or image must be provided for analysis.")

        if image is not None:
            return self.analyze_media(media_input=image, additional_text=text)

        return self.analyze_text(text=text or "")

    def _generate_structured_analysis(
        self, contents: List[Any]
    ) -> PhishGuardAnalysisResult:
        """
        Execute generate_content against the Gemini API enforcing Pydantic structured output.
        """
        config = types.GenerateContentConfig(
            system_instruction=self.system_prompt,
            response_mime_type="application/json",
            response_schema=PhishGuardAnalysisResult,
            temperature=0.1,
        )

        try:
            response = self.client.models.generate_content(
                model=self.model,
                contents=contents,
                config=config,
            )
        except errors.APIError as e:
            raise GeminiAnalysisError(f"Gemini API error ({e.code}): {e.message}") from e
        except Exception as e:
            raise GeminiAnalysisError(f"Unexpected error communicating with Gemini API: {e}") from e

        # Parse and validate response
        response_text = getattr(response, "text", None)
        if not response_text:
            raise GeminiAnalysisError("Gemini API returned an empty response.")

        try:
            return PhishGuardAnalysisResult.model_validate_json(response_text)
        except Exception as e:
            # Fallback to cleaning potential code fences if any
            cleaned = self._clean_json_markdown(response_text)
            try:
                return PhishGuardAnalysisResult.model_validate_json(cleaned)
            except Exception as inner_e:
                raise GeminiAnalysisError(
                    f"Failed to validate Gemini JSON output against PhishGuard schema: {inner_e}. "
                    f"Raw response: {response_text[:300]}"
                ) from inner_e

    def _clean_json_markdown(self, text: str) -> str:
        """Strip markdown code fence blocks if returned by LLM."""
        trimmed = text.strip()
        if trimmed.startswith("```json"):
            trimmed = trimmed[7:]
        elif trimmed.startswith("```"):
            trimmed = trimmed[3:]
        if trimmed.endswith("```"):
            trimmed = trimmed[:-3]
        return trimmed.strip()

    def _load_system_prompt(self, custom_path: Optional[Union[str, Path]]) -> str:
        """Load system prompt from file or fallback to packaged default prompt."""
        if custom_path:
            p = Path(custom_path)
            if p.is_file():
                return p.read_text(encoding="utf-8")

        # Check default system_prompt.md alongside this file
        default_path = Path(__file__).parent / "system_prompt.md"
        if default_path.is_file():
            return default_path.read_text(encoding="utf-8")

        # Built-in fallback prompt
        return (
            "You are PhishGuard AI, an elite cybersecurity analyst. "
            "Detect phishing, social engineering (urgency, intimidation, authority impersonation, "
            "credential harvesting, OTP requests), and quishing. "
            "Preserve exact suspicious quotes and output strictly valid JSON matching the schema."
        )
