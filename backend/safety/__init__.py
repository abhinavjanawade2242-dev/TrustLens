"""PhishGuard AI Deterministic Safety & Heuristics Package.
Owner: Member 3 (Manohar - Deterministic Safety & Heuristics Lead)
"""

from backend.safety.heuristics import evaluate_url, evaluate_text_cues
from backend.safety.brands import TOP_BRANDS
from backend.safety.rules import (
    check_raw_ip,
    check_risky_tld,
    check_excessive_subdomains,
    check_at_symbol_redirect,
)

__all__ = [
    "evaluate_url",
    "evaluate_text_cues",
    "TOP_BRANDS",
    "check_raw_ip",
    "check_risky_tld",
    "check_excessive_subdomains",
    "check_at_symbol_redirect",
]
