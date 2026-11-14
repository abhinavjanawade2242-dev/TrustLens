"""
Media and Multimodal Ingestion Module for PhishGuard AI / TrustLens.

Extracts QR codes (quishing detection) and normalizes image/screenshot media
for ingestion by the AI analysis pipeline.
"""

from __future__ import annotations

import io
import os
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, List, Optional, Tuple, Union

import cv2
import numpy as np
from PIL import Image, ImageOps


class MediaExtractionError(Exception):
    """Base exception for media extraction errors."""
    pass


class InvalidImageError(MediaExtractionError):
    """Raised when the provided image is corrupt, empty, or unreadable."""
    pass


class UnsupportedMediaFormatError(MediaExtractionError):
    """Raised when an unsupported media format is supplied."""
    pass


@dataclass
class QRCodeResult:
    """Represents a decoded QR code found in media."""
    payload: str
    points: Optional[List[List[float]]] = None
    bounding_box: Optional[dict[str, float]] = None

    def to_dict(self) -> dict[str, Any]:
        return {
            "payload": self.payload,
            "points": self.points,
            "bounding_box": self.bounding_box,
        }


@dataclass
class MediaExtractionResult:
    """Contains all normalized media and extracted metadata for downstream AI pipelines."""
    has_qr: bool
    qr_codes: List[QRCodeResult] = field(default_factory=list)
    image_format: str = "PNG"
    dimensions: Tuple[int, int] = (0, 0)  # (width, height)
    normalized_image: Optional[Image.Image] = None
    raw_bytes: bytes = b""
    extracted_text_hints: List[str] = field(default_factory=list)

    @property
    def primary_qr_payload(self) -> Optional[str]:
        """Convenience property to access the first decoded QR code payload, if any."""
        return self.qr_codes[0].payload if self.qr_codes else None

    def to_dict(self) -> dict[str, Any]:
        return {
            "has_qr": self.has_qr,
            "qr_count": len(self.qr_codes),
            "qr_codes": [qr.to_dict() for qr in self.qr_codes],
            "image_format": self.image_format,
            "dimensions": {"width": self.dimensions[0], "height": self.dimensions[1]},
            "extracted_text_hints": self.extracted_text_hints,
        }


class MediaExtractor:
    """
    Multimodal media extractor leveraging OpenCV's QRCodeDetector as the primary
    engine, avoiding pyzbar Windows DLL dependencies.
    """

    SUPPORTED_FORMATS = {"PNG", "JPEG", "JPG", "WEBP", "BMP", "TIFF", "GIF"}

    def __init__(self, use_aruco_fallback: bool = True):
        """
        Initialize the MediaExtractor with OpenCV QR detectors.
        
        Args:
            use_aruco_fallback: Whether to attempt QRCodeDetectorAruco if
                                the standard QRCodeDetector fails to detect codes.
        """
        self.standard_detector = cv2.QRCodeDetector()
        self.use_aruco_fallback = use_aruco_fallback
        self.aruco_detector = None
        if use_aruco_fallback and hasattr(cv2, "QRCodeDetectorAruco"):
            try:
                self.aruco_detector = cv2.QRCodeDetectorAruco()
            except Exception:
                self.aruco_detector = None

    def extract(self, source: Union[str, Path, bytes, Image.Image]) -> MediaExtractionResult:
        """
        Extract QR codes and normalize the media source for AI pipeline consumption.

        Args:
            source: Local file path, raw bytes, or PIL Image instance.

        Returns:
            MediaExtractionResult containing decoded QR codes and normalized media.

        Raises:
            InvalidImageError: If the image cannot be read or is invalid.
            FileNotFoundError: If a provided file path does not exist.
        """
        cv_img, pil_img, raw_bytes, detected_format = self._load_and_normalize(source)
        width, height = pil_img.size

        # Detect QR codes using OpenCV
        qr_results = self.extract_qr_codes(cv_img)

        # Collect text hints from QR payloads
        text_hints = [qr.payload for qr in qr_results if qr.payload]

        return MediaExtractionResult(
            has_qr=len(qr_results) > 0,
            qr_codes=qr_results,
            image_format=detected_format,
            dimensions=(width, height),
            normalized_image=pil_img,
            raw_bytes=raw_bytes,
            extracted_text_hints=text_hints,
        )

    def extract_qr_codes(self, cv_image: np.ndarray) -> List[QRCodeResult]:
        """
        Extract all QR codes present in a CV2 (BGR or Grayscale) image.
        Uses a multi-tier fallback pipeline (original, grayscale, contrast/threshold,
        padding) to maximize detection recall on screenshots and distorted photos.

        Args:
            cv_image: OpenCV image array.

        Returns:
            List of QRCodeResult objects.
        """
        if cv_image is None or cv_image.size == 0:
            return []

        # Tier 1: Standard detector on original image
        results = self._detect_with_detector(self.standard_detector, cv_image)
        if results:
            return results

        # Tier 2: Aruco-based detector if enabled
        if self.aruco_detector is not None:
            results = self._detect_with_detector(self.aruco_detector, cv_image)
            if results:
                return results

        # Tier 3: Preprocessed images (Grayscale, Thresholding, Scaling)
        preprocessed_variants = self._generate_preprocessed_variants(cv_image)
        for variant in preprocessed_variants:
            results = self._detect_with_detector(self.standard_detector, variant)
            if results:
                return results
            if self.aruco_detector is not None:
                results = self._detect_with_detector(self.aruco_detector, variant)
                if results:
                    return results

        return []

    def _detect_with_detector(
        self, detector: Any, image: np.ndarray
    ) -> List[QRCodeResult]:
        """Run detectAndDecodeMulti with fallback to detectAndDecode."""
        qr_results: List[QRCodeResult] = []

        try:
            # First attempt multi-detection
            retval, decoded_info, points, _ = detector.detectAndDecodeMulti(image)
            if retval and decoded_info:
                for idx, text in enumerate(decoded_info):
                    cleaned_text = text.strip() if isinstance(text, str) else ""
                    if cleaned_text:
                        pts_list = None
                        bbox = None
                        if points is not None and len(points) > idx:
                            pts_list = points[idx].tolist()
                            bbox = self._compute_bounding_box(points[idx])
                        qr_results.append(
                            QRCodeResult(
                                payload=cleaned_text,
                                points=pts_list,
                                bounding_box=bbox,
                            )
                        )
                if qr_results:
                    return qr_results
        except Exception:
            pass

        try:
            # Fallback to single detection
            single_text, points, _ = detector.detectAndDecode(image)
            cleaned_single = single_text.strip() if isinstance(single_text, str) else ""
            if cleaned_single:
                pts_list = None
                bbox = None
                if points is not None and len(points) > 0:
                    pts_list = points[0].tolist() if points.ndim == 3 else points.tolist()
                    bbox = self._compute_bounding_box(points[0] if points.ndim == 3 else points)
                qr_results.append(
                    QRCodeResult(
                        payload=cleaned_single,
                        points=pts_list,
                        bounding_box=bbox,
                    )
                )
        except Exception:
            pass

        return qr_results

    def _generate_preprocessed_variants(self, cv_image: np.ndarray) -> List[np.ndarray]:
        """Generate enhanced image variants for difficult-to-decode QR codes."""
        variants: List[np.ndarray] = []

        # Convert to Grayscale if color
        if len(cv_image.shape) == 3 and cv_image.shape[2] == 3:
            gray = cv2.cvtColor(cv_image, cv2.COLOR_BGR2GRAY)
        else:
            gray = cv_image.copy()
        variants.append(gray)

        # 1. Otsu Thresholding
        try:
            _, otsu = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY | cv2.THRESH_OTSU)
            variants.append(otsu)
        except Exception:
            pass

        # 2. Quiet zone padding (adding white border around image)
        try:
            padded = cv2.copyMakeBorder(
                cv_image, 30, 30, 30, 30, cv2.BORDER_CONSTANT, value=[255, 255, 255]
            )
            variants.append(padded)
        except Exception:
            pass

        # 3. Upscale if small image
        h, w = cv_image.shape[:2]
        if max(h, w) < 400:
            try:
                scale_factor = 400.0 / max(h, w)
                resized = cv2.resize(
                    cv_image,
                    (int(w * scale_factor), int(h * scale_factor)),
                    interpolation=cv2.INTER_CUBIC,
                )
                variants.append(resized)
            except Exception:
                pass

        return variants

    def _compute_bounding_box(self, pts: np.ndarray) -> dict[str, float]:
        """Compute standard x, y, width, height from polygon coordinates."""
        try:
            x_coords = pts[:, 0]
            y_coords = pts[:, 1]
            min_x = float(np.min(x_coords))
            max_x = float(np.max(x_coords))
            min_y = float(np.min(y_coords))
            max_y = float(np.max(y_coords))
            return {
                "x": min_x,
                "y": min_y,
                "width": max_x - min_x,
                "height": max_y - min_y,
            }
        except Exception:
            return {"x": 0.0, "y": 0.0, "width": 0.0, "height": 0.0}

    def _load_and_normalize(
        self, source: Union[str, Path, bytes, Image.Image]
    ) -> Tuple[np.ndarray, Image.Image, bytes, str]:
        """
        Load input and return:
        (cv2_bgr_image, pil_rgb_image, raw_png_bytes, format_string)
        """
        if isinstance(source, (str, Path)):
            path = Path(source)
            if not path.is_file():
                raise FileNotFoundError(f"Image file not found at: {path}")
            try:
                with open(path, "rb") as f:
                    raw_data = f.read()
            except Exception as e:
                raise InvalidImageError(f"Failed to read image file {path}: {e}") from e
            return self._load_from_bytes(raw_data)

        elif isinstance(source, bytes):
            return self._load_from_bytes(source)

        elif isinstance(source, Image.Image):
            return self._load_from_pil(source)

        else:
            raise InvalidImageError(
                f"Unsupported source type: {type(source)}. Expected str, Path, bytes, or PIL Image."
            )

    def _load_from_bytes(self, data: bytes) -> Tuple[np.ndarray, Image.Image, bytes, str]:
        """Load from raw byte buffer."""
        if not data:
            raise InvalidImageError("Provided image byte buffer is empty.")

        try:
            pil_img = Image.open(io.BytesIO(data))
            pil_img.load()  # Verify integrity
        except Exception as e:
            raise InvalidImageError(f"Corrupt or invalid image bytes: {e}") from e

        # Handle EXIF orientation
        try:
            pil_img = ImageOps.exif_transpose(pil_img)
        except Exception:
            pass

        img_format = pil_img.format or "PNG"
        if img_format.upper() not in self.SUPPORTED_FORMATS:
            # Attempt to convert anyway if PIL opened it
            img_format = "PNG"

        # Convert to RGB PIL Image
        if pil_img.mode != "RGB":
            pil_rgb = pil_img.convert("RGB")
        else:
            pil_rgb = pil_img

        # Convert to OpenCV BGR
        np_arr = np.array(pil_rgb)
        cv_bgr = cv2.cvtColor(np_arr, cv2.COLOR_RGB2BGR)

        # Normalize raw_bytes to PNG if needed or preserve
        if not data.startswith(b"\x89PNG") and not data.startswith(b"\xff\xd8"):
            buf = io.BytesIO()
            pil_rgb.save(buf, format="PNG")
            normalized_bytes = buf.getvalue()
        else:
            normalized_bytes = data

        return cv_bgr, pil_rgb, normalized_bytes, img_format.upper()

    def _load_from_pil(self, pil_img: Image.Image) -> Tuple[np.ndarray, Image.Image, bytes, str]:
        """Load from an existing PIL Image."""
        if pil_img is None:
            raise InvalidImageError("PIL Image instance is None.")

        try:
            pil_img.load()
        except Exception as e:
            raise InvalidImageError(f"Invalid PIL Image: {e}") from e

        # Handle EXIF orientation
        try:
            pil_img = ImageOps.exif_transpose(pil_img)
        except Exception:
            pass

        img_format = (pil_img.format or "PNG").upper()

        if pil_img.mode != "RGB":
            pil_rgb = pil_img.convert("RGB")
        else:
            pil_rgb = pil_img.copy()

        # Convert to OpenCV BGR
        np_arr = np.array(pil_rgb)
        cv_bgr = cv2.cvtColor(np_arr, cv2.COLOR_RGB2BGR)

        # Generate bytes buffer
        buf = io.BytesIO()
        pil_rgb.save(buf, format="PNG")
        raw_bytes = buf.getvalue()

        return cv_bgr, pil_rgb, raw_bytes, img_format
