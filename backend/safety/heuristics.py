"""Deterministic Safety Engine — Typosquatting & Heuristics Evaluator.

Executes offline in-memory domain analysis (<50ms) using tldextract and Levenshtein distance.
Zero external LLM dependency.

Owner: Member 3 (Manohar - Deterministic Safety & Heuristics Lead)
"""

from __future__ import annotations

import re
from typing import Any, Dict, List, Optional
from urllib.parse import urlparse

import Levenshtein
import tldextract

from backend.safety.brands import TOP_BRANDS
from backend.safety.rules import (
    check_raw_ip,
    check_risky_tld,
    check_excessive_subdomains,
    check_at_symbol_redirect,
)
from backend.schemas import HttpsStatus


def evaluate_url(target_url: str) -> Dict[str, Any]:
    """
    Evaluates a URL using deterministic structural heuristics and Levenshtein distance.

    Returns:
        dict containing:
            - submitted_url: str
            - actual_domain: str
            - is_spoofed: bool
            - lookalike_brand: Optional[str]
            - character_substitution: Optional[str]
            - https_status: HttpsStatus
            - heuristic_flags: List[str]
            - heuristic_score: int (0 to 100)
    """
    cleaned_url = target_url.strip()
    if not cleaned_url.startswith(("http://", "https://")):
        url_to_parse = "https://" + cleaned_url
    else:
        url_to_parse = cleaned_url

    parsed = urlparse(url_to_parse)
    hostname = (parsed.hostname or cleaned_url).lower()

    ext = tldextract.extract(hostname)
    domain_label = ext.domain.lower()
    root_domain = f"{ext.domain}.{ext.suffix}" if ext.suffix else domain_label
    subdomain = ext.subdomain.lower()

    heuristic_flags: List[str] = []
    is_spoofed = False
    lookalike_brand: Optional[str] = None
    character_substitution: Optional[str] = None
    heuristic_score = 0

    # 1. Structural Checks
    has_raw_ip, raw_ip_msg = check_raw_ip(hostname)
    if has_raw_ip:
        heuristic_flags.append(raw_ip_msg)
        heuristic_score += 45

    has_risky_tld, risky_tld_msg = check_risky_tld(ext.suffix)
    if has_risky_tld:
        heuristic_flags.append(risky_tld_msg)
        heuristic_score += 30

    has_excess_sub, excess_sub_msg = check_excessive_subdomains(subdomain)
    if has_excess_sub:
        heuristic_flags.append(excess_sub_msg)
        heuristic_score += 25

    has_at_symbol, at_symbol_msg = check_at_symbol_redirect(cleaned_url)
    if has_at_symbol:
        heuristic_flags.append(at_symbol_msg)
        heuristic_score += 40

    # 2. Typosquatting & Brand Impersonation Checks
    subdomain_parts = [p for p in subdomain.split(".") if p]
    domain_tokens = [domain_label] + [t for t in domain_label.split("-") if t]

    for brand in TOP_BRANDS:
        if is_spoofed:
            break

        # Check subdomains for brand names
        for sub in subdomain_parts:
            if sub == brand or (len(brand) >= 4 and Levenshtein.distance(sub, brand) <= 1):
                is_spoofed = True
                lookalike_brand = brand
                character_substitution = f"Brand mimicry in subdomain '{sub}'"
                heuristic_flags.append(f"Deceptive brand name '{brand}' embedded in subdomain to disguise apex domain.")
                heuristic_score += 65
                break

        if is_spoofed:
            break

        # Check domain tokens
        for token in domain_tokens:
            if not token or len(token) < 3:
                continue

            dist = Levenshtein.distance(token, brand)
            if dist == 0 and len(domain_tokens) > 1 and token != domain_label:
                is_spoofed = True
                lookalike_brand = brand
                character_substitution = f"Brand keyword '{brand}' combined with misleading hyphenated terms"
                heuristic_flags.append(f"Deceptive keyword stuffing: mimics '{brand}' in domain name.")
                heuristic_score += 70
                break
            elif 1 <= dist <= 2 and len(brand) >= 4 and abs(len(token) - len(brand)) <= 2:
                is_spoofed = True
                lookalike_brand = brand
                character_substitution = f"Levenshtein edit distance of {dist} between '{token}' and brand '{brand}'"
                heuristic_flags.append(f"Typosquatting detected: '{token}' mimics legitimate brand '{brand}'.")
                heuristic_score += 75
                break

    is_https = url_to_parse.startswith("https://")
    https_status = HttpsStatus(
        present=is_https,
        note="Uses standard SSL encryption." if is_https else "Unencrypted HTTP connection detected.",
    )

    return {
        "submitted_url": cleaned_url,
        "actual_domain": root_domain or hostname,
        "is_spoofed": is_spoofed,
        "lookalike_brand": lookalike_brand,
        "character_substitution": character_substitution,
        "https_status": https_status,
        "heuristic_flags": heuristic_flags,
        "heuristic_score": min(heuristic_score, 100),
    }


def evaluate_text_cues(text: str) -> Dict[str, Any]:
    """Evaluates message text for common psychological scam cues offline."""
    lower = text.lower()
    score = 0
    cues_detected: List[str] = []
    quotes: List[str] = []

    urgency_patterns = [
        ("locked", "Account lock / restriction threat"),
        ("suspended", "Account suspension threat"),
        ("seized", "Asset seizure coercion"),
        ("freeze", "Financial freeze threat"),
        ("frozen", "Financial freeze threat"),
        ("immediate", "Artificial time urgency"),
        ("immediately", "Artificial time urgency"),
        ("overdue", "Financial debt pressure"),
        ("urgent", "Explicit urgency indicator"),
        ("within 24 hours", "Artificial deadline constraint"),
        ("final notice", "Escalation intimidation"),
        ("verify your identity", "Credential harvesting solicitation"),
        ("wire transfer", "Irreversible funds transfer demand"),
        ("otp", "One-time passcode harvesting"),
        ("password", "Direct credential solicitation"),
    ]

    for pattern, description in urgency_patterns:
        if pattern in lower:
            score += 20
            cues_detected.append(description)
            idx = lower.find(pattern)
            start = max(0, idx - 15)
            end = min(len(text), idx + len(pattern) + 25)
            quotes.append(text[start:end].strip())

    return {
        "score": min(score, 90),
        "cues": cues_detected,
        "quotes": quotes[:3],
    }
