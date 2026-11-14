"""
Unit tests for backend/integrations/media_extractor.py.
Tests QR code extraction, media normalization, and error handling without external dependencies.
"""

import io
from pathlib import Path

import cv2
import numpy as np
import pytest
from PIL import Image

from backend.integrations.media_extractor import (
    InvalidImageError,
    MediaExtractionResult,
    MediaExtractor,
    QRCodeResult,
)


def _create_qr_image(payload: str, size: int = 250, border: int = 25) -> Image.Image:
    """Helper to generate a clean synthetic QR code using OpenCV QRCodeEncoder."""
    encoder = cv2.QRCodeEncoder_create()
    raw_qr = encoder.encode(payload)
    resized = cv2.resize(raw_qr, (size, size), interpolation=cv2.INTER_NEAREST)
    bordered = cv2.copyMakeBorder(
        resized, border, border, border, border, cv2.BORDER_CONSTANT, value=255
    )
    return Image.fromarray(bordered)


class TestMediaExtractor:
    @pytest.fixture
    def extractor(self):
        return MediaExtractor()

    def test_extract_qr_from_pil_image(self, extractor):
        test_url = "https://phishguard-verification.fake-sec.com/login"
        pil_qr = _create_qr_image(test_url)

        result = extractor.extract(pil_qr)

        assert isinstance(result, MediaExtractionResult)
        assert result.has_qr is True
        assert len(result.qr_codes) >= 1
        assert result.primary_qr_payload == test_url
        assert test_url in result.extracted_text_hints
        assert result.dimensions[0] > 0 and result.dimensions[1] > 0
        assert result.normalized_image is not None

    def test_extract_qr_from_bytes(self, extractor):
        test_payload = "WIFI:S:StaffGuest;T:WPA;P:FakePassword123;;"
        pil_qr = _create_qr_image(test_payload)
        buffer = io.BytesIO()
        pil_qr.save(buffer, format="PNG")
        raw_bytes = buffer.getvalue()

        result = extractor.extract(raw_bytes)

        assert result.has_qr is True
        assert result.primary_qr_payload == test_payload
        assert result.image_format == "PNG"

    def test_extract_qr_from_filepath(self, extractor, tmp_path):
        test_url = "https://payroll-portal-update.malicious.xyz/auth"
        pil_qr = _create_qr_image(test_url)
        file_path = tmp_path / "test_quishing_email_attachment.png"
        pil_qr.save(file_path, format="PNG")

        result = extractor.extract(str(file_path))

        assert result.has_qr is True
        assert result.primary_qr_payload == test_url

    def test_image_without_qr_code(self, extractor):
        # Plain solid image without any QR codes
        plain = Image.new("RGB", (200, 200), color=(100, 150, 200))

        result = extractor.extract(plain)

        assert result.has_qr is False
        assert len(result.qr_codes) == 0
        assert result.primary_qr_payload is None
        assert result.extracted_text_hints == []
        assert result.dimensions == (200, 200)

    def test_bounding_box_computation(self, extractor):
        test_url = "https://it-support-ticket.spoofed.org"
        pil_qr = _create_qr_image(test_url, size=200, border=30)

        result = extractor.extract(pil_qr)

        assert result.has_qr is True
        qr = result.qr_codes[0]
        assert qr.bounding_box is not None
        assert "x" in qr.bounding_box
        assert "y" in qr.bounding_box
        assert qr.bounding_box["width"] > 0
        assert qr.bounding_box["height"] > 0

    def test_serialization(self, extractor):
        test_url = "https://bank-urgent-alert.info"
        pil_qr = _create_qr_image(test_url)

        result = extractor.extract(pil_qr)
        res_dict = result.to_dict()

        assert res_dict["has_qr"] is True
        assert res_dict["qr_count"] >= 1
        assert res_dict["qr_codes"][0]["payload"] == test_url
        assert "dimensions" in res_dict

    def test_empty_bytes_raises_error(self, extractor):
        with pytest.raises(InvalidImageError, match="empty"):
            extractor.extract(b"")

    def test_corrupt_bytes_raises_error(self, extractor):
        with pytest.raises(InvalidImageError):
            extractor.extract(b"not_a_valid_image_header_bytes")

    def test_nonexistent_file_raises_error(self, extractor):
        with pytest.raises(FileNotFoundError):
            extractor.extract("C:/non_existent_directory/fake_image.png")

    def test_unsupported_input_type_raises_error(self, extractor):
        with pytest.raises(InvalidImageError, match="Unsupported source type"):
            extractor.extract(12345)  # type: ignore
