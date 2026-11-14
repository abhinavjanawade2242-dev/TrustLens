"""
Integrations and Ingestion Module for PhishGuard AI / TrustLens.
"""

from .media_extractor import (
    MediaExtractor,
    MediaExtractionResult,
    QRCodeResult,
)

__all__ = [
    "MediaExtractor",
    "MediaExtractionResult",
    "QRCodeResult",
]
