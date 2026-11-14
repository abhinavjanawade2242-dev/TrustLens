/**
 * Risk classification and visual helper utilities for TrustLens
 * 
 * Strict thresholds:
 * SAFE: 0 - 39
 * SUSPICIOUS: 40 - 69
 * CRITICAL: 70 - 100
 */

export const RISK_LEVELS = {
  SAFE: 'SAFE',
  SUSPICIOUS: 'SUSPICIOUS',
  CRITICAL: 'CRITICAL',
};

export function getThreatLevel(score) {
  const num = Number(score) || 0;
  if (num >= 70) return RISK_LEVELS.CRITICAL;
  if (num >= 40) return RISK_LEVELS.SUSPICIOUS;
  return RISK_LEVELS.SAFE;
}

export function getRiskDetails(threatLevel, score = 0) {
  const level = (threatLevel || getThreatLevel(score)).toUpperCase();

  switch (level) {
    case RISK_LEVELS.CRITICAL:
      return {
        level: RISK_LEVELS.CRITICAL,
        label: 'CRITICAL THREAT',
        shortLabel: 'CRITICAL',
        color: '#f43f5e',
        badgeBg: 'bg-rose-500/15',
        badgeBorder: 'border-rose-500/40',
        badgeText: 'text-rose-400',
        bgSubtle: 'rgba(244, 63, 94, 0.08)',
        borderSubtle: 'rgba(244, 63, 94, 0.25)',
        glow: 'glow-critical',
        meterColor: '#f43f5e',
        severityRank: 3,
        summaryHeader: 'Immediate Threat Detected',
        advisory: 'High probability of active fraud, credential theft, or malware. Do NOT interact or provide credentials.',
      };

    case RISK_LEVELS.SUSPICIOUS:
      return {
        level: RISK_LEVELS.SUSPICIOUS,
        label: 'SUSPICIOUS ACTIVITY',
        shortLabel: 'SUSPICIOUS',
        color: '#f59e0b',
        badgeBg: 'bg-amber-500/15',
        badgeBorder: 'border-amber-500/40',
        badgeText: 'text-amber-400',
        bgSubtle: 'rgba(245, 158, 11, 0.08)',
        borderSubtle: 'rgba(245, 158, 11, 0.25)',
        glow: 'glow-suspicious',
        meterColor: '#f59e0b',
        severityRank: 2,
        summaryHeader: 'Potential Risk Indicators Found',
        advisory: 'Multiple anomalies or psychological manipulation tactics detected. Proceed with caution.',
      };

    case RISK_LEVELS.SAFE:
    default:
      return {
        level: RISK_LEVELS.SAFE,
        label: 'LOW RISK / SAFE',
        shortLabel: 'SAFE',
        color: '#10b981',
        badgeBg: 'bg-emerald-500/15',
        badgeBorder: 'border-emerald-500/40',
        badgeText: 'text-emerald-400',
        bgSubtle: 'rgba(16, 185, 129, 0.08)',
        borderSubtle: 'rgba(16, 185, 129, 0.25)',
        glow: 'glow-safe',
        meterColor: '#10b981',
        severityRank: 1,
        summaryHeader: 'No Critical Threat Indicators',
        advisory: 'Standard baseline patterns detected. Always exercise digital hygiene when clicking links or entering passwords.',
      };
  }
}

export function formatDate(timestamp) {
  if (!timestamp) return 'Just now';
  try {
    const d = new Date(timestamp);
    if (isNaN(d.getTime())) return timestamp;
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(d);
  } catch {
    return timestamp;
  }
}

/**
 * Normalizes URL string safely for analysis display
 */
export function normalizeUrl(input) {
  if (!input) return '';
  let str = input.trim();
  if (!/^https?:\/\//i.test(str)) {
    str = 'http://' + str;
  }
  try {
    const parsed = new URL(str);
    const hostname = parsed.hostname;
    const isIpv6 = /^\[[\da-f:.]+\]$/i.test(hostname);
    const labels = hostname.replace(/\.$/, '').split('.');
    const isValidHostname = isIpv6 || (
      hostname.length <= 253 &&
      labels.every((label) =>
        label.length > 0 &&
        label.length <= 63 &&
        /^[a-z\d](?:[a-z\d-]*[a-z\d])?$/i.test(label)
      )
    );
    if (!isValidHostname) {
      throw new TypeError('Invalid hostname');
    }
    return {
      isValid: true,
      original: input,
      normalized: parsed.href,
      hostname,
      protocol: parsed.protocol,
      pathname: parsed.pathname,
    };
  } catch {
    return {
      isValid: false,
      original: input,
      normalized: input,
      hostname: '',
      protocol: '',
      pathname: '',
    };
  }
}
