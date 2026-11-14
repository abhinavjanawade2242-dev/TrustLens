/**
 * TrustLens API Service Layer
 * 
 * Supports the documented backend API and an explicitly labeled local heuristic fallback.
 * Follows the strict TrustLens Shared Response Contract.
 */

import { normalizeUrl } from '../utils/riskHelpers';

const DEFAULT_API_URL = 'http://localhost:8000';
const rawUrl = (import.meta.env.VITE_API_URL || DEFAULT_API_URL).trim();
export const API_BASE_URL = rawUrl.replace(/\/+$/, '');

/**
 * Checks backend health at /api/health
 */
export async function checkBackendHealth() {
  const controller = new AbortController();
  // 12-second timeout to accommodate cloud platform (e.g. Render) cold-starts
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  try {
    const res = await fetch(`${API_BASE_URL}/api/health`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      let data = {};
      try {
        data = await res.json();
      } catch {
        data = { status: 'ok' };
      }
      return {
        online: true,
        status: data.status || 'healthy',
        timestamp: new Date().toISOString(),
        url: API_BASE_URL,
      };
    } else {
      return {
        online: false,
        statusCode: res.status,
        url: API_BASE_URL,
        error: `HTTP ${res.status}: Backend returned an error`,
      };
    }
  } catch (err) {
    clearTimeout(timeoutId);
    return {
      online: false,
      url: API_BASE_URL,
      error: err.name === 'AbortError' ? 'Connection timed out' : 'Backend offline or unreachable',
    };
  }
}

/**
 * Executes analysis either through live backend or client-side engine.
 * 
 * @param {Object} params
 * @param {string} params.type - 'text' | 'url' | 'image'
 * @param {string} params.content - Text or URL content
 * @param {File} [params.file] - File object for image analysis
 * @param {boolean} [params.forceMock] - Whether to use mock engine directly
 * @param {AbortSignal} [params.signal] - For cancellation
 */
export async function analyzeThreat({ type, content, file, forceMock = false, signal }) {
  // If not forcing mock, try live backend first
  if (!forceMock) {
    const endpoint = '/api/analyze';
    let body;
    let headers = {};

    if (type === 'image' && file) {
      const formData = new FormData();
      formData.append('file', file);
      body = formData;
    } else {
      headers['Content-Type'] = 'application/json';
      headers['Accept'] = 'application/json';
      body = JSON.stringify(
        type === 'url'
          ? { url: content?.trim() }
          : { text: content?.trim() },
      );
    }

    let response;
    try {
      response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers,
        body,
        signal,
      });
    } catch (err) {
      if (err.name === 'AbortError') {
        throw err; // propagate user cancellation
      }
      console.warn('[TrustLens] Backend unreachable; using local heuristic analysis:', err.message);
    }

    if (response?.ok) {
      const liveData = await response.json();
      const data = sanitizeResponse(liveData, content, type);
      const evidenceLevel = data.ai_social_engineering?.evidence_level || '';
      const isHeuristicFallback = /offline.*heuristic|heuristic.*offline|fallback/i.test(evidenceLevel);

      if (type === 'image' && isHeuristicFallback) {
        data.analysis_status = 'partial';
        data.threat_level = 'UNASSESSED';
        data.risk_score = null;
        data.summary_verdict = 'Image analysis is incomplete';
        data.plain_english_explanation = 'The backend returned offline heuristic results, not AI image analysis. It may have checked an extracted QR destination, but OCR and visual analysis did not run. Do not treat this image as safe.';
        data.recommended_actions = [
          'Do not treat this image as safe; its visual content was not analyzed.',
          'Verify any extracted QR destination independently before opening it.',
          'Retry when the configured AI image-analysis service is available.'
        ];
      }

      return {
        source: isHeuristicFallback ? 'backend-heuristic' : 'backend',
        data,
      };
    }

    if (response && response.status !== 404 && response.status < 500) {
      const details = await response.text();
      throw new Error(
        `Backend rejected the analysis request (HTTP ${response.status})${details ? `: ${details}` : ''}`,
      );
    }

    if (response) {
      console.warn(`[TrustLens] Backend responded with status ${response.status}; falling back to local heuristic analysis.`);
    }
  }

  // Fallback / Mock Engine
  const simulatedData = runClientSideHeuristicEngine(type, content, file);
  return {
    source: 'mock',
    data: simulatedData,
  };
}

/**
 * Validates required contract fields and sanitizes optional backend data.
 */
function sanitizeResponse(raw, originalContent, type) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new Error('Backend returned an invalid threat-analysis response object.');
  }

  const requiredStringFields = [
    'scan_id',
    'threat_level',
    'summary_verdict',
    'plain_english_explanation',
  ];
  for (const field of requiredStringFields) {
    if (typeof raw[field] !== 'string') {
      throw new Error(`Backend response contract violation: "${field}" must be a string.`);
    }
  }
  if (!['SAFE', 'SUSPICIOUS', 'CRITICAL'].includes(raw.threat_level)) {
    throw new Error('Backend response contract violation: "threat_level" is invalid.');
  }
  if (!Number.isInteger(raw.risk_score) || raw.risk_score < 0 || raw.risk_score > 100) {
    throw new Error('Backend response contract violation: "risk_score" must be an integer from 0 to 100.');
  }

  return {
    scan_id: raw.scan_id || `scan_${Date.now()}`,
    threat_level: raw.threat_level,
    risk_score: raw.risk_score,
    summary_verdict: raw.summary_verdict || 'Threat Evaluation Completed',
    plain_english_explanation: raw.plain_english_explanation || 'Analysis completed; the backend did not provide an explanation.',
    target_impersonated: raw.target_impersonated || (raw.is_spoofed ? 'Unverified Identity' : 'None detected'),
    submitted_content: originalContent || raw.submitted_content || '',
    created_at: raw.created_at || new Date().toISOString(),
    url_analysis: raw.url_analysis ? {
      submitted_url: raw.url_analysis.submitted_url || originalContent,
      actual_domain: raw.url_analysis.actual_domain || 'Unknown domain',
      is_spoofed: Boolean(raw.url_analysis.is_spoofed),
      lookalike_brand: raw.url_analysis.lookalike_brand || null,
      character_substitution: raw.url_analysis.character_substitution || null,
      https_status: raw.url_analysis.https_status || { present: false, note: 'Not provided by backend' },
      heuristic_flags: Array.isArray(raw.url_analysis.heuristic_flags) ? raw.url_analysis.heuristic_flags : []
    } : null,
    ai_social_engineering: raw.ai_social_engineering ? {
      urgency_level: raw.ai_social_engineering.urgency_level || 'UNKNOWN',
      tactics_detected: Array.isArray(raw.ai_social_engineering.tactics_detected) ? raw.ai_social_engineering.tactics_detected : [],
      highlighted_quotes: Array.isArray(raw.ai_social_engineering.highlighted_quotes) ? raw.ai_social_engineering.highlighted_quotes : [],
      manipulation_pattern: raw.ai_social_engineering.manipulation_pattern || null,
      evidence_level: raw.ai_social_engineering.evidence_level || 'Live Backend Signal'
    } : null,
    why_dangerous: Array.isArray(raw.why_dangerous) ? raw.why_dangerous : generateDefaultWhyDangerous(raw.threat_level, raw),
    recommended_actions: Array.isArray(raw.recommended_actions) && raw.recommended_actions.length > 0 
      ? raw.recommended_actions 
      : generateDefaultActions(raw.threat_level),
  };
}

/**
 * Local heuristic fallback for custom text and URL inputs.
 * It does not evaluate image contents or run an AI model.
 */
function runClientSideHeuristicEngine(type, content = '', file = null) {
  const text = (content || '').trim();

  // Handle Image Upload when backend is unavailable
  if (type === 'image') {
    return {
      scan_id: `scan_img_${Date.now().toString(36)}`,
      analysis_status: 'unavailable',
      threat_level: 'UNASSESSED',
      risk_score: null,
      summary_verdict: 'Image content not analyzed',
      plain_english_explanation: 'Image OCR and QR-code inspection require the analysis backend, which is not available. Only the selected file type and size were checked; its contents were not analyzed.',
      target_impersonated: null,
      submitted_content: file ? `File: ${file.name} (${(file.size / 1024).toFixed(1)} KB)` : 'Image asset',
      created_at: new Date().toISOString(),
      url_analysis: null,
      recommended_actions: [
        'The image contents have not been analyzed. Do not treat this upload as safe.',
        'Do not open links or scan QR codes from the image until they are verified.',
        'Try again when the image-analysis backend is available.'
      ]
    };
  }

  // URL Analysis Heuristics
  if (type === 'url' || /^(https?:\/\/|[a-zA-Z0-9-]+\.[a-zA-Z]{2,})/i.test(text)) {
    const norm = normalizeUrl(text);
    const domain = norm.hostname.toLowerCase();
    
    // Check known brands / lookalikes
    const suspiciousKeywords = ['paypal', 'apple', 'support', 'login', 'account', 'security', 'verify', 'update', 'banking', 'secure', 'wallet', 'service'];
    const matchedKeywords = suspiciousKeywords.filter(k => domain.includes(k));
    
    const hasTyposquat = /[0-9]/.test(domain) && (domain.includes('pay') || domain.includes('goog') || domain.includes('micr') || domain.includes('appl'));
    const isSuspiciousTLD = /\.(xyz|top|cc|ru|tk|work|click|fit|live|cfd)$/i.test(domain);
    const isMultiSubdomain = (domain.match(/\./g) || []).length >= 3;

    let score = 10;
    let flags = [];
    let isSpoofed = false;
    let target = 'None detected';

    if (hasTyposquat || (matchedKeywords.length >= 2 && !domain.endsWith('.paypal.com') && !domain.endsWith('.apple.com') && !domain.endsWith('.microsoft.com'))) {
      score = 89;
      isSpoofed = true;
      target = matchedKeywords[0] ? `${matchedKeywords[0].toUpperCase()} Impersonation` : 'Financial / Tech Brand';
      flags.push('Deceptive keyword combinations detected in domain name');
      if (hasTyposquat) flags.push('Character substitution / homoglyph detected (digits mixed with brand name)');
    } else if (isSuspiciousTLD || isMultiSubdomain || matchedKeywords.length === 1) {
      score = 62;
      flags.push('Suspicious top-level domain or nested subdomains');
      flags.push('Domain uses security-themed keywords outside legitimate apex domain');
    } else {
      score = 12;
      flags.push('Standard domain syntax and structure');
      flags.push('No obvious character homoglyphs detected');
    }

    const threatLevel = score >= 70 ? 'CRITICAL' : score >= 40 ? 'SUSPICIOUS' : 'SAFE';

    return {
      scan_id: `scan_url_${Date.now().toString(36)}`,
      threat_level: threatLevel,
      risk_score: score,
      summary_verdict: threatLevel === 'CRITICAL' 
        ? 'High-Risk Deceptive Domain Detected' 
        : threatLevel === 'SUSPICIOUS' 
          ? 'Potentially Risky Domain Pattern' 
          : 'Standard Domain — No Critical Flags Found',
      plain_english_explanation: threatLevel === 'CRITICAL'
        ? `The destination domain (${domain}) exhibits structural characteristics of brand spoofing or credential phishing.`
        : threatLevel === 'SUSPICIOUS'
          ? `The domain structure contains anomalous keywords or low-reputation domain patterns.`
          : `The domain structure appears consistent with routine web endpoints. Remember that TLS alone does not guarantee intent.`,
      target_impersonated: target,
      submitted_content: text,
      created_at: new Date().toISOString(),
      url_analysis: {
        submitted_url: text,
        actual_domain: domain || text,
        is_spoofed: isSpoofed,
        lookalike_brand: isSpoofed ? target : null,
        character_substitution: hasTyposquat ? 'Suspected leetspeak or numeral substitution in hostname' : 'None detected',
        https_status: {
          present: norm.protocol === 'https:',
          note: norm.protocol === 'https:' 
            ? 'TLS certificate is active. Note: HTTPS encrypts transit but does NOT establish trustworthiness.' 
            : 'Unencrypted HTTP protocol detected. Data in transit is vulnerable.'
        },
        heuristic_flags: flags
      },
      ai_social_engineering: {
        urgency_level: threatLevel === 'CRITICAL' ? 'HIGH' : 'LOW',
        tactics_detected: isSpoofed ? ['Brand Name Spoofing', 'Credential Lure'] : ['Direct Web Navigation'],
        highlighted_quotes: [],
        evidence_level: 'Local Heuristic Analysis',
        manipulation_pattern: isSpoofed ? 'Deceptive Domain Pretexting' : 'None detected'
      },
      why_dangerous: threatLevel === 'CRITICAL' ? [
        {
          title: "Domain Impersonation / Typosquatting",
          category: "Domain Spoofing",
          detected_evidence: domain,
          explanation: "Attackers register similar-looking domains to siphon credentials from victims who make minor typing mistakes."
        },
        {
          title: "Suspicious Keyword Stacking",
          category: "Heuristic Match",
          detected_evidence: matchedKeywords.join(', '),
          explanation: "Legitimate enterprise services rarely string together multiple security-trigger keywords in their primary URL."
        }
      ] : [],
      recommended_actions: threatLevel === 'CRITICAL' ? [
        "Do not enter passwords or personal data on this domain",
        "Verify the official domain of the service through a trusted search engine",
        "Report the deceptive domain to Google Safe Browsing and registrar abuse"
      ] : [
        "Always check that the address matches the exact organization you intend to visit",
        "Do not reuse sensitive credentials across sites"
      ]
    };
  }

  // Free-form Text Analysis
  const lower = text.toLowerCase();
  
  // Heuristic patterns
  const urgencyTriggers = ['urgent', 'immediately', 'immediate', '2 hours', '24 hours', '15 minutes', 'final notice', 'overdue', 'suspended', 'freeze', 'cancelled', 'arrest', 'lawsuit', 'legal action'];
  const credentialTriggers = ['otp', 'password', '2fa', 'verification code', 'verify your identity', 'confirm details', 'login below', 'click here to restore'];
  const financialTriggers = ['wire transfer', 'invoice', 'bitcoin', 'crypto', 'remittance', 'settlement', 'gift card', '$', 'bank account', 'funds'];

  const matchedUrgency = urgencyTriggers.filter(t => lower.includes(t));
  const matchedCredentials = credentialTriggers.filter(t => lower.includes(t));
  const matchedFinancial = financialTriggers.filter(t => lower.includes(t));

  const totalTriggers = matchedUrgency.length + matchedCredentials.length + matchedFinancial.length;

  let score = 15;
  let tactics = [];
  let quotes = [];
  let dangerCards = [];

  if (matchedUrgency.length > 0) {
    score += matchedUrgency.length * 18;
    tactics.push('Artificial Urgency / Panic Pressure');
    matchedUrgency.slice(0, 2).forEach(kw => {
      quotes.push({
        quote: kw,
        category: 'Urgency Pressure',
        reason: 'Psychological tactic designed to prevent methodical verification.'
      });
      dangerCards.push({
        title: 'High-Pressure Urgency Signals',
        category: 'Psychological Coercion',
        detected_evidence: `"${kw}" detected in text`,
        explanation: 'Scammers induce panic so you bypass standard checks.'
      });
    });
  }

  if (matchedCredentials.length > 0) {
    score += matchedCredentials.length * 25;
    tactics.push('Credential / OTP Harvesting Intent');
    matchedCredentials.slice(0, 2).forEach(kw => {
      quotes.push({
        quote: kw,
        category: 'Sensitive Data Request',
        reason: 'Direct solicitations for security credentials or one-time passcodes are major fraud flags.'
      });
      dangerCards.push({
        title: 'Sensitive Credential Solicitation',
        category: 'Credential Harvesting',
        detected_evidence: `Request for "${kw}"`,
        explanation: 'Legitimate organizations never ask you to reveal OTPs or passwords over unsolicited messages.'
      });
    });
  }

  if (matchedFinancial.length > 0) {
    score += matchedFinancial.length * 15;
    tactics.push('Unverified Payment or Transfer Demand');
    matchedFinancial.slice(0, 2).forEach(kw => {
      quotes.push({
        quote: kw,
        category: 'Financial Coercion',
        reason: 'Unsolicited wire or crypto demands frequently represent advance fee or BEC scams.'
      });
    });
  }

  score = Math.min(98, Math.max(8, score));
  const threatLevel = score >= 70 ? 'CRITICAL' : score >= 40 ? 'SUSPICIOUS' : 'SAFE';

  return {
    scan_id: `scan_txt_${Date.now().toString(36)}`,
    threat_level: threatLevel,
    risk_score: score,
    summary_verdict: threatLevel === 'CRITICAL' 
      ? 'Social Engineering & Urgent Exploitation Signals Detected'
      : threatLevel === 'SUSPICIOUS'
        ? 'Suspicious Communication Patterns Identified'
        : 'Standard Communication — Low Threat Signals',
    plain_english_explanation: threatLevel === 'CRITICAL'
      ? `This text exhibits strong markers of social engineering, including urgent calls to action and sensitive data requests.`
      : threatLevel === 'SUSPICIOUS'
        ? `Several pressure-inducing phrases were detected. Scrutinize the sender and intent before taking action.`
        : `No overt social engineering pressure or credential harvesting signals were detected in this message.`,
    target_impersonated: matchedCredentials.length > 0 || matchedFinancial.length > 0 ? 'Financial / Account Service' : 'None detected',
    submitted_content: text,
    created_at: new Date().toISOString(),
    url_analysis: null,
    ai_social_engineering: {
      urgency_level: matchedUrgency.length >= 2 ? 'EXTREME' : matchedUrgency.length === 1 ? 'MODERATE' : 'LOW',
      tactics_detected: tactics.length > 0 ? tactics : ['Routine Communication'],
      highlighted_quotes: quotes,
      evidence_level: 'Local Heuristic Analysis',
      manipulation_pattern: tactics.length > 0 ? tactics.join(' + ') : 'None detected'
    },
    why_dangerous: dangerCards.length > 0 ? dangerCards : [
      {
        title: "Baseline Pattern Verification",
        category: "Safety Evaluation",
        detected_evidence: "No high-risk panic indicators found",
        explanation: "Message lacks typical extortion, panic, or unverified wire transfer demands."
      }
    ],
    recommended_actions: threatLevel === 'CRITICAL' ? [
      "Do not reply or follow any instructions in this message",
      "Do not disclose one-time passwords (OTPs) or account credentials",
      "Verify directly with the sender via an independent verified phone or portal",
      "Quarantine or report this message to your security provider"
    ] : [
      "Verify unfamiliar sender email addresses or phone numbers",
      "Do not disclose confidential data in unencrypted channels"
    ]
  };
}

function generateDefaultWhyDangerous(threatLevel, raw) {
  if (threatLevel === 'CRITICAL') {
    return [
      {
        title: "Critical Threat Indicators Flagged",
        category: "Threat Intelligence",
        detected_evidence: raw.summary_verdict || "Unrecognized payload pattern",
        explanation: "The intelligence engine flagged high-confidence markers of deception or malicious intent."
      }
    ];
  }
  return [];
}

function generateDefaultActions(threatLevel) {
  if (threatLevel === 'CRITICAL') {
    return [
      "Do not click links or open attachments",
      "Do not provide credentials, OTPs, or payments",
      "Contact the organization through official verified channels",
      "Report the malicious message to your IT security team"
    ];
  }
  if (threatLevel === 'SUSPICIOUS') {
    return [
      "Exercise heightened caution before responding",
      "Inspect the destination link URL carefully",
      "Verify the sender's identity through a second channel"
    ];
  }
  return [
    "Follow standard cybersecurity hygiene",
    "Stay cautious when entering credentials on third-party sites"
  ];
}
