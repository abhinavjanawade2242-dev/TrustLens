"""Standalone Deterministic Unit Tests for Safety Heuristics Engine.
Owner: Member 3 (Manohar - Deterministic Safety & Heuristics Lead)
"""

import pytest
from backend.safety.heuristics import evaluate_url, evaluate_text_cues
from backend.safety.rules import (
    check_raw_ip,
    check_risky_tld,
    check_excessive_subdomains,
    check_at_symbol_redirect,
)
from backend.safety.brands import TOP_BRANDS


def test_typosquatting_paypal_lookalike():
    """T-01: Validates lookalike brand detection on typosquatted domains."""
    res = evaluate_url("https://paypa1-security-center.com/login")
    assert res["is_spoofed"] is True
    assert res["lookalike_brand"] == "paypal"
    assert res["heuristic_score"] >= 65
    assert any("Typosquatting" in f or "Deceptive" in f for f in res["heuristic_flags"])


def test_raw_ip_host_flagged():
    """T-02: Validates detection of raw numerical IP address host."""
    res = evaluate_url("http://192.168.1.100/admin/login")
    assert any("raw numerical IP" in f for f in res["heuristic_flags"])
    assert res["heuristic_score"] >= 45


def test_benign_domain_zero_false_positive():
    """T-03: Benign top brand domain yields is_spoofed=False and 0 false alarm flags."""
    res = evaluate_url("https://www.google.com/search?q=cybersecurity")
    assert res["is_spoofed"] is False
    assert res["lookalike_brand"] is None
    assert res["heuristic_score"] == 0
    assert len(res["heuristic_flags"]) == 0


def test_risky_disposable_tld():
    """Validates detection of abuse-prone TLDs (.xyz, .top)."""
    res = evaluate_url("https://customer-service-notice.xyz")
    assert any("high-abuse disposable TLD" in f for f in res["heuristic_flags"])
    assert res["heuristic_score"] >= 30


def test_excessive_subdomains_flagged():
    """Validates warning on multi-level subdomain masking."""
    res = evaluate_url("https://secure.banking.portal.login.untrusted-host.com")
    assert any("excessive subdomains" in f for f in res["heuristic_flags"])
    assert res["heuristic_score"] >= 25


def test_at_symbol_basic_auth_redirect():
    """Validates detection of '@' credential spoofing."""
    res = evaluate_url("https://legit-brand.com@evil-destination.com")
    assert any("@" in f for f in res["heuristic_flags"])


def test_text_urgency_heuristics():
    """Validates offline psychological cue extraction from message body."""
    text = "FINAL NOTICE: Your bank account is locked. Verify your identity immediately or funds are frozen."
    res = evaluate_text_cues(text)
    assert res["score"] >= 50
    assert len(res["cues"]) >= 2
    assert len(res["quotes"]) >= 1
