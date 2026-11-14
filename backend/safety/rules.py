"""Deterministic Structural Heuristic Rules & Regex Filters.
Owner: Member 3 (Manohar - Deterministic Safety & Heuristics Lead)
"""

import re
from typing import List, Tuple

# Raw IP pattern
IP_PATTERN = re.compile(r"^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$")

# Suspicious high-abuse disposable TLDs
RISKY_TLDS = {
    "top", "xyz", "buzz", "club", "live", "work", "icu", "cyou",
    "fit", "monster", "cfd", "cam", "rest", "bar", "zip", "mov"
}

# Suspicious URL keywords
SUSPICIOUS_KEYWORDS = [
    "verify", "login", "secure", "account", "update", "banking",
    "signin", "wallet", "support", "billing", "confirm", "claim", "free"
]


def check_raw_ip(hostname: str) -> Tuple[bool, str]:
    """Check if host is a raw IP address."""
    if IP_PATTERN.match(hostname):
        return True, "Host is a raw numerical IP address rather than a legitimate domain name."
    return False, ""


def check_risky_tld(suffix: str) -> Tuple[bool, str]:
    """Check if public suffix belongs to high-abuse TLDs."""
    if suffix.lower() in RISKY_TLDS:
        return True, f"Domain uses high-abuse disposable TLD (.{suffix})."
    return False, ""


def check_excessive_subdomains(subdomain: str) -> Tuple[bool, str]:
    """Check for deceptive multiple subdomain nesting."""
    parts = [p for p in subdomain.split(".") if p]
    if len(parts) >= 2:
        return True, f"Suspicious excessive subdomains ({len(parts)} levels) prepended to disguise root domain."
    return False, ""


def check_at_symbol_redirect(url: str) -> Tuple[bool, str]:
    """Check for HTTP basic auth '@' symbol redirect trick."""
    if "@" in url:
        return True, "URL contains '@' symbol; browsers navigate to host following the '@' ignoring prefix credentials."
    return False, ""
