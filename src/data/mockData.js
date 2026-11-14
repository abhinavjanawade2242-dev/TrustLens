/**
 * Demo Scenarios & Mock Threat Intelligence Data
 * Built strictly according to the TrustLens Shared Response Contract.
 */

export const DEMO_SCENARIOS = [
  {
    id: 'demo-1-invoice',
    badge: 'Demo 1',
    title: 'Urgent Invoice Lure',
    category: 'Financial Phishing',
    inputType: 'text',
    shortDesc: 'A fraudulent finance email threatening immediate legal escalation and wire transfer.',
    sampleInput: `FINAL NOTICE: Overdue Invoice #INV-98241 requires immediate settlement of $4,850.00. 
Failure to transfer funds within the next 2 hours will result in asset freeze and referral to international collection attorneys.
Please download your updated remittance voucher and execute direct payment via the secure routing portal below:
https://wire-settlement-accounts-corp.net/auth/invoice-pay?id=98241
Do NOT contact billing support as this legal matter has been transferred.`,
    result: {
      scan_id: "scan_2026_inv_982",
      threat_level: "CRITICAL",
      risk_score: 94,
      summary_verdict: "Urgent Financial Fraud & Impending Legal Action Lure",
      plain_english_explanation: "This message uses extreme psychological pressure, an artificial 2-hour deadline, and legal threats to coerce an unverified wire transfer to a newly registered offshore domain.",
      target_impersonated: "Corporate Accounting Department",
      submitted_content: "FINAL NOTICE: Overdue Invoice #INV-98241 requires immediate settlement of $4,850.00. Failure to transfer funds within the next 2 hours will result in asset freeze and referral to international collection attorneys. Please download your updated remittance voucher and execute direct payment via the secure routing portal below: https://wire-settlement-accounts-corp.net/auth/invoice-pay?id=98241 Do NOT contact billing support as this legal matter has been transferred.",
      created_at: new Date().toISOString(),
      url_analysis: {
        submitted_url: "https://wire-settlement-accounts-corp.net/auth/invoice-pay?id=98241",
        actual_domain: "wire-settlement-accounts-corp.net",
        is_spoofed: true,
        lookalike_brand: "Corporate Accounting / Wire Escrow",
        character_substitution: "Hyphenated keyword stuffing ('wire-settlement-accounts-corp')",
        https_status: {
          present: true,
          note: "Uses standard free SSL certificate. Remember: HTTPS encrypts traffic, but does NOT verify that the owner is legitimate."
        },
        heuristic_flags: [
          "Domain registered within the last 48 hours",
          "Keyword clustering matching financial fraud patterns",
          "Anonymized registrar WHOIS with masked registrant country"
        ]
      },
      ai_social_engineering: {
        urgency_level: "EXTREME",
        tactics_detected: [
          "Artificial 2-Hour Deadline",
          "Legal Coercion & Asset Freeze Threats",
          "Channel Isolation (Do NOT contact billing support)",
          "Urgent Wire Transfer Demand"
        ],
        highlighted_quotes: [
          {
            quote: "FINAL NOTICE: Overdue Invoice #INV-98241 requires immediate settlement of $4,850.00",
            category: "Urgency / Financial Pressure",
            reason: "Standard lure pretending an urgent debt exists to trigger panic and hasty decision making."
          },
          {
            quote: "Failure to transfer funds within the next 2 hours will result in asset freeze",
            category: "Artificial Deadline & Coercion",
            reason: "Artificial time limit designed to prevent victims from consulting financial advisors or supervisors."
          },
          {
            quote: "https://wire-settlement-accounts-corp.net/auth/invoice-pay?id=98241",
            category: "Deceptive Credential / Payment Harvester",
            reason: "Unverified third-party domain mimicking corporate payment gateway."
          },
          {
            quote: "Do NOT contact billing support as this legal matter has been transferred",
            category: "Channel Isolation Attack",
            reason: "Deliberate instruction to cut off legitimate verification channels before the transaction is executed."
          }
        ],
        evidence_level: "HIGH (Deterministic Keyword & Domain Matches)",
        manipulation_pattern: "Pretexting with Channel Isolation: The attacker creates a high-stakes, time-sensitive emergency and explicitly warns the victim not to contact their normal internal support channels."
      },
      why_dangerous: [
        {
          title: "Artificial 2-Hour Deadline",
          category: "Psychological Coercion",
          detected_evidence: "'within the next 2 hours will result in asset freeze'",
          explanation: "Attackers manufacture urgency so victims skip standard invoice approval policies and verification procedures."
        },
        {
          title: "Channel Isolation Directive",
          category: "Defense Evasion",
          detected_evidence: "'Do NOT contact billing support as this legal matter has been transferred'",
          explanation: "Explicitly demanding that you avoid standard organizational channels is a hallmark of business email compromise (BEC)."
        },
        {
          title: "Untrusted Payment Gateway",
          category: "Financial Interception",
          detected_evidence: "'wire-settlement-accounts-corp.net'",
          explanation: "The domain is not affiliated with any legitimate enterprise clearinghouse and was registered anonymously."
        },
        {
          title: "Threat of Legal Action & Asset Seizure",
          category: "Fear Exploitation",
          detected_evidence: "'referral to international collection attorneys'",
          explanation: "Frightening terminology is deployed to intimidate the recipient into compliance."
        }
      ],
      recommended_actions: [
        "Do not click the invoice settlement link or download attachments",
        "Do not authorize any wire transfers or payments",
        "Verify outstanding invoices directly with your finance team via their known phone number",
        "Forward this email to your organization's security or IT team for quarantine",
        "Report the malicious hosting domain to the registrar abuse contact"
      ]
    }
  },
  {
    id: 'demo-2-brand',
    badge: 'Demo 2',
    title: 'Brand Lookalike & OTP Stealer',
    category: 'Credential Harvester',
    inputType: 'text',
    shortDesc: 'A deceptive SMS mimicking an online provider claiming unauthorized login and requesting verification.',
    sampleInput: `Security Alert: We detected an unrecognized login attempt from Moscow, RU on your account.
If this was NOT you, you must verify your identity immediately to prevent permanent account suspension:
https://paypa1-security-verification-portal.com/login?token=8923
Enter your 2FA verification code on the prompt to restore access within 15 minutes.`,
    result: {
      scan_id: "scan_2026_brand_304",
      threat_level: "CRITICAL",
      risk_score: 91,
      summary_verdict: "Deceptive Brand Typosquatting & Two-Factor OTP Harvesting",
      plain_english_explanation: "This attack impersonates a major payment provider using typosquatting ('paypa1' replacing letter 'l' with numeral '1') to capture your master password and real-time 2FA OTP codes.",
      target_impersonated: "PayPal / Payment Service Provider",
      submitted_content: "Security Alert: We detected an unrecognized login attempt from Moscow, RU on your account. If this was NOT you, you must verify your identity immediately to prevent permanent account suspension: https://paypa1-security-verification-portal.com/login?token=8923 Enter your 2FA verification code on the prompt to restore access within 15 minutes.",
      created_at: new Date().toISOString(),
      url_analysis: {
        submitted_url: "https://paypa1-security-verification-portal.com/login?token=8923",
        actual_domain: "paypa1-security-verification-portal.com",
        is_spoofed: true,
        lookalike_brand: "PayPal Inc.",
        character_substitution: "Typosquatting: 'paypa1' substituted numeral '1' for lowercase 'l'",
        https_status: {
          present: true,
          note: "TLS active. Warning: Phishing sites routinely obtain free TLS certificates to show a false padlock."
        },
        heuristic_flags: [
          "Homoglyph / leetspeak character substitution ('1' for 'l')",
          "Brand trademark mimicry without official SSL organization validation",
          "High entropy phishing landing query parameter ('?token=8923')"
        ]
      },
      ai_social_engineering: {
        urgency_level: "HIGH",
        tactics_detected: [
          "Security Panic Simulation",
          "Unrecognized Geographic Login Lure (Moscow, RU)",
          "Real-time OTP Code Harvesting Request",
          "15-Minute Expiration Pressure"
        ],
        highlighted_quotes: [
          {
            quote: "We detected an unrecognized login attempt from Moscow, RU on your account",
            category: "Geographic Fear Trigger",
            reason: "Mentioning a foreign hostile IP creates instant anxiety, lowering critical scrutiny."
          },
          {
            quote: "verify your identity immediately to prevent permanent account suspension",
            category: "Account Loss Threat",
            reason: "Threatening account loss pushes user into immediate unthinking action."
          },
          {
            quote: "https://paypa1-security-verification-portal.com/login?token=8923",
            category: "Homoglyph Typosquat Domain",
            reason: "Deceptive domain replacing 'l' with digit '1' to trick human visual inspection."
          },
          {
            quote: "Enter your 2FA verification code on the prompt to restore access within 15 minutes",
            category: "Adversary-in-the-Middle 2FA Theft",
            reason: "Prompting for 2FA allows attackers to instantly bypass two-factor authentication."
          }
        ],
        evidence_level: "HIGH (Character Substitution & Tokenized Phishing Path)",
        manipulation_pattern: "Adversary-in-the-Middle (AiTM) Phishing: The adversary uses an alarming fake security notice to harvest both primary credentials and one-time passcodes in real-time."
      },
      why_dangerous: [
        {
          title: "Visual Homoglyph / Typosquatting",
          category: "Domain Spoofing",
          detected_evidence: "'paypa1-security-verification-portal.com'",
          explanation: "Replacing 'l' with '1' tricks users glancing quickly on mobile screens into believing the link is official."
        },
        {
          title: "Real-Time 2FA / OTP Harvesting",
          category: "Credential Compromise",
          detected_evidence: "'Enter your 2FA verification code on the prompt'",
          explanation: "The attacker proxies your 2FA token directly into the real service to hijack active sessions."
        },
        {
          title: "Alarming Foreign Location Lure",
          category: "Social Engineering",
          detected_evidence: "'unrecognized login attempt from Moscow, RU'",
          explanation: "Specific foreign locations are chosen to provoke panic and urgent reaction."
        },
        {
          title: "15-Minute Countdown Pressure",
          category: "Urgency Manipulation",
          detected_evidence: "'restore access within 15 minutes'",
          explanation: "Artificial time restrictions suppress critical verification impulses."
        }
      ],
      recommended_actions: [
        "Never enter your password or 2FA codes on this site",
        "Open a fresh browser window and manually type the official website address",
        "If you already entered credentials, immediately change your password from the official website",
        "Revoke all active sessions and refresh your two-factor authenticator app",
        "Block the sender number or report the SMS as spam"
      ]
    }
  },
  {
    id: 'demo-3-safe',
    badge: 'Demo 3',
    title: 'Safe Tech Newsletter',
    category: 'Legitimate Communication',
    inputType: 'text',
    shortDesc: 'A routine developer weekly newsletter with standard informational links and transparent sender details.',
    sampleInput: `Hi Alex,
Welcome to issue #142 of CyberGuard Weekly.
This week we discuss browser sandboxing architecture, WebAssembly security boundaries, and open-source vulnerability management.
You can read the full article on our engineering blog:
https://cyberguard-insights.org/posts/2026/browser-isolation-deep-dive
You received this because you subscribed to our developer newsletter. You can adjust your preferences or unsubscribe at any time below.
Have a productive week,
The CyberGuard Editorial Team`,
    result: {
      scan_id: "scan_2026_news_051",
      threat_level: "SAFE",
      risk_score: 8,
      summary_verdict: "Standard Informational Newsletter — No Threat Signals Detected",
      plain_english_explanation: "This message displays regular editorial communication patterns: clear sender identity, no coercive deadlines, no credential or payment demands, and clean contextual links.",
      target_impersonated: "None detected (Original Sender Consistent)",
      submitted_content: "Hi Alex, Welcome to issue #142 of CyberGuard Weekly. This week we discuss browser sandboxing architecture, WebAssembly security boundaries, and open-source vulnerability management. You can read the full article on our engineering blog: https://cyberguard-insights.org/posts/2026/browser-isolation-deep-dive You received this because you subscribed to our developer newsletter. You can adjust your preferences or unsubscribe at any time below. Have a productive week, The CyberGuard Editorial Team",
      created_at: new Date().toISOString(),
      url_analysis: {
        submitted_url: "https://cyberguard-insights.org/posts/2026/browser-isolation-deep-dive",
        actual_domain: "cyberguard-insights.org",
        is_spoofed: false,
        lookalike_brand: "None (Matches content context)",
        character_substitution: "None detected",
        https_status: {
          present: true,
          note: "TLS enabled. Link points to consistent public blog archive."
        },
        heuristic_flags: [
          "Consistent domain context with publisher name",
          "Standard unsubscribe mechanism declared",
          "No credential gating or sensitive input parameters"
        ]
      },
      ai_social_engineering: {
        urgency_level: "NONE",
        tactics_detected: [
          "Transparent Opt-out / Unsubscribe Options",
          "Informational Educational Tone",
          "No Pressure or Threat Indicators"
        ],
        highlighted_quotes: [],
        evidence_level: "LOW RISK (Routine Baseline Pattern)",
        manipulation_pattern: "None: Content exhibits normal informational structure without coercive psychological persuasion."
      },
      why_dangerous: [
        {
          title: "No Coercive Urgency Detected",
          category: "Tone Analysis",
          detected_evidence: "'Have a productive week'",
          explanation: "Message lacks artificial deadlines, penalties, or threats."
        },
        {
          title: "Transparent Content Navigation",
          category: "Link Evaluation",
          detected_evidence: "'https://cyberguard-insights.org/posts/2026/...'",
          explanation: "Links direct to public editorial pages rather than credential login forms."
        },
        {
          title: "Clear Unsubscribe Provision",
          category: "Compliance",
          detected_evidence: "'adjust your preferences or unsubscribe at any time'",
          explanation: "Conforms to standard CAN-SPAM and GDPR transparency expectations."
        }
      ],
      recommended_actions: [
        "Content appears standard and non-malicious",
        "Always practice normal digital hygiene: do not enter credentials into unfamiliar prompts",
        "If unsure about any external links, preview destinations before navigating"
      ]
    }
  }
];

export const RECENT_SAMPLE_SCANS = [
  {
    scan_id: "scan_2026_recent_1",
    type: "SMS Phishing",
    target: "USPS Delivery Alert",
    threat_level: "CRITICAL",
    risk_score: 92,
    timestamp: "12 mins ago",
    domain: "usps-redelivery-notice77.com",
    excerpt: "USPS: Package #US98273 suspended due to incomplete address. Update now..."
  },
  {
    scan_id: "scan_2026_recent_2",
    type: "Email Lure",
    target: "Microsoft 365",
    threat_level: "SUSPICIOUS",
    risk_score: 58,
    timestamp: "45 mins ago",
    domain: "portal-ms-office-auth.net",
    excerpt: "Password expiration reminder: Your corporate M365 session will expire..."
  },
  {
    scan_id: "scan_2026_recent_3",
    type: "URL Scan",
    target: "GitHub Docs",
    threat_level: "SAFE",
    risk_score: 5,
    timestamp: "1 hour ago",
    domain: "docs.github.com",
    excerpt: "https://docs.github.com/en/actions/security-guides/security-hardening"
  },
  {
    scan_id: "scan_2026_recent_4",
    type: "WhatsApp Scam",
    target: "Bank Fraud Department",
    threat_level: "CRITICAL",
    risk_score: 96,
    timestamp: "3 hours ago",
    domain: "secure-bank-fraud-alert.cc",
    excerpt: "URGENT: $2,400 debit attempted. Reply 1 to approve or click link to dispute..."
  }
];

export const TELEMETRY_METRICS = [
  { label: 'Threats Analyzed (24h)', value: '18,492', change: '+14% vs avg', note: 'Global telemetry sample' },
  { label: 'Active Phishing Domains', value: '4,109', change: 'Live index', note: 'Crowdsourced + Heuristic' },
  { label: 'Average Detection Time', value: '1.2s', change: 'Real-time NLP', note: 'Multi-layer heuristic pipeline' },
  { label: 'Social Engineering Accuracy', value: '99.4%', change: 'Validated', note: 'Calibrated detection models' },
];
