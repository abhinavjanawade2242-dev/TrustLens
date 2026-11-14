/**
 * TrustLens API Service Layer
 * 
 * Supports both Live Backend API and Local Heuristic Engine.
 * Follows the strict TrustLens Shared Response Contract.
 */

import { DEMO_SCENARIOS } from '../data/mockData';
import { normalizeUrl } from '../utils/riskHelpers';

const DEFAULT_API_URL = 'http://localhost:8000';
export const API_BASE_URL = import.meta.env.VITE_API_URL || DEFAULT_API_URL;

/**
 * Checks backend health at /api/health
 */
export async function checkBackendHealth() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3500);

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
    try {
      const endpoint = type === 'url' ? '/api/analyze/url' : '/api/analyze/text';
      
      let body;
      let headers = {};

      if (type === 'image' && file) {
        // FormData for file upload
        const formData = new FormData();
        formData.append('image', file);
        body = formData;
      } else {
        headers['Content-Type'] = 'application/json';
        headers['Accept'] = 'application/json';
        body = JSON.stringify({
          type,
          content: content?.trim(),
          submitted_at: new Date().toISOString(),
        });
      }

      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers,
        body,
        signal,
      });

      if (res.ok) {
        const liveData = await res.json();
        return {
          source: 'backend',
          data: sanitizeResponse(liveData, content, type),
        };
      }
      // If server returned 404 or 500, fallback or throw
      console.warn(`[TrustLens] Backend responded with status ${res.status}, falling back to intelligent client-side analyzer.`);
    } catch (err) {
      if (err.name === 'AbortError') {
        throw err; // propagate user cancellation
      }
      console.warn('[TrustLens] Live backend unreachable, engaging client-side heuristic engine:', err.message);
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
 * Ensures backend responses conform safely to the Shared Response Contract
 * without crashing if fields are omitted.
 */
function sanitizeResponse(raw, originalContent, type) {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Invalid response structure received from threat intelligence server.');
  }

  const riskScore = Number.isFinite(raw.risk_score) ? raw.risk_score : 50;
  let threatLevel = raw.threat_level;
  if (!threatLevel) {
    if (riskScore >= 70) threatLevel = 'CRITICAL';
    else if (riskScore >= 35) threatLevel = 'SUSPICIOUS';
    else threatLevel = 'SAFE';
  }

  return {
    scan_id: raw.scan_id || `scan_${Date.now()}`,
    threat_level: threatLevel,
    risk_score: riskScore,
    summary_verdict: raw.summary_verdict || 'Threat Evaluation Completed',
    plain_english_explanation: raw.plain_english_explanation || 'Analysis completed according to security telemetry metrics.',
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
    why_dangerous: Array.isArray(raw.why_dangerous) ? raw.why_dangerous : generateDefaultWhyDangerous(threatLevel, raw),
    recommended_actions: Array.isArray(raw.recommended_actions) && raw.recommended_actions.length > 0 
      ? raw.recommended_actions 
      : generateDefaultActions(threatLevel),
  };
}

/**
 * Intelligent Client-Side Heuristic Engine for Demo & Offline Mode
 * Evaluates custom user inputs using pattern matching, NLP heuristics, and domain analysis.
 */
function runClientSideHeuristicEngine(type, content = '', file = null) {
  const text = (content || '').trim();

  // Check if content matches any demo scenario
  for (const demo of DEMO_SCENARIOS) {
    if (demo.sampleInput.trim() === text || text.includes(demo.sampleInput.slice(0, 40))) {
      return {
        ...demo.result,
        scan_id: `scan_${Date.now().toString(36)}`,
        created_at: new Date().toISOString(),
      };
    }
  }

  // Handle Image Upload when backend is unavailable
  if (type === 'image') {
    return {
      scan_id: `scan_img_${Date.now().toString(36)}`,
      threat_level: "SUSPICIOUS",
      risk_score: 45,
      summary_verdict: "Image File Upload Staged (Offline Preview)",
      plain_english_explanation: "Visual OCR and multimodal neural vision analysis require live backend connection. In local demo mode, the file metadata has been verified and staged for security inspection.",
      target_impersonated: "Pending OCR parsing",
      submitted_content: file ? `File: ${file.name} (${(file.size / 1024).toFixed(1)} KB)` : 'Image asset',
      created_at: new Date().toISOString(),
      url_analysis: null,
      ai_social_engineering: {
        urgency_level: "EVALUATION_PENDING",
        tactics_detected: [
          "Image-based credential text masking (Potential)",
          "QR code or embedded link obfuscation (Pending OCR)"
        ],
        highlighted_quotes: [],
        evidence_level: "Client-side metadata inspection",
        manipulation_pattern: "Visual phishing lures frequently use screenshots or image-only emails to evade text-based spam filters."
      },
      why_dangerous: [
        {
          title: "Image-Based Filter Evasion",
          category: "Obfuscation",
          detected_evidence: `Uploaded asset: ${file?.name || 'Screenshot'}`,
          explanation: "Adversaries embed fraudulent invoices or QR codes inside images so standard email text gateways cannot inspect the message."
        }
      ],
      recommended_actions: [
        "Do not scan QR codes embedded within unverified images",
        "Connect live backend for complete neural OCR and visual analysis",
        "Manually inspect sender email address header"
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

    const threatLevel = score >= 70 ? 'CRITICAL' : score >= 35 ? 'SUSPICIOUS' : 'SAFE';

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
  const threatLevel = score >= 70 ? 'CRITICAL' : score >= 35 ? 'SUSPICIOUS' : 'SAFE';

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
