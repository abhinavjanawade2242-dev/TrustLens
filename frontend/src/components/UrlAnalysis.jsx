import React from 'react';
import { 
  Globe, 
  Lock, 
  Unlock, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  Fingerprint, 
  Layers, 
  Info,
  ExternalLink
} from 'lucide-react';

export default function UrlAnalysis({ urlData }) {
  if (!urlData) return null;

  const {
    submitted_url,
    actual_domain,
    is_spoofed,
    lookalike_brand,
    character_substitution,
    https_status,
    heuristic_flags = [],
  } = urlData;

  const isHttps = https_status?.present ?? (submitted_url?.startsWith('https://') || false);

  return (
    <div className="rounded-2xl bg-midnight-900/80 border border-slate-800/80 p-6 lg:p-8 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white tracking-tight">
                URL & Domain Intelligence
              </h3>
              {is_spoofed ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                  Spoofed Domain Detected
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  Domain Profile Evaluated
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Structural domain parsing, homoglyph detection, and SSL verification
            </p>
          </div>
        </div>

        {/* Apex Domain Pill */}
        <div className="flex items-center gap-2 bg-midnight-950 px-3 py-1.5 rounded-lg border border-slate-800">
          <Fingerprint className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-mono text-cyan-300 font-medium">
            {actual_domain || 'Unresolved Host'}
          </span>
        </div>
      </div>

      {/* Main Grid: Submitted URL, Brand Mimicry, Homoglyphs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Submitted URL & Actual Host */}
        <div className="p-4 rounded-xl bg-midnight-850/70 border border-slate-800/80 space-y-3">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
              Submitted URL Destination
            </span>
            <div className="mt-1.5 p-2.5 rounded-lg bg-midnight-950 border border-slate-800/90 font-mono text-xs text-slate-200 break-all select-all">
              {submitted_url || 'N/A'}
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Note: TrustLens evaluates destination syntax without visiting or executing live remote payloads.
            </span>
          </div>

          <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between">
            <span className="text-xs text-slate-400">Spoofing Classification:</span>
            <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
              is_spoofed 
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' 
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
            }`}>
              {is_spoofed ? 'DECEPTIVE SPOOF' : 'AUTHENTIC / CONSISTENT'}
            </span>
          </div>
        </div>

        {/* Lookalike Brand & Character Substitution */}
        <div className="p-4 rounded-xl bg-midnight-850/70 border border-slate-800/80 space-y-3">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
              Lookalike Brand Indicators
            </span>
            <p className="text-sm font-medium text-white mt-1">
              {lookalike_brand || 'No registered brand trademarks spoofed'}
            </p>
          </div>

          <div className="pt-2 border-t border-slate-800/60">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
              Character Substitution / Homoglyphs
            </span>
            <p className="text-xs font-mono text-slate-300 mt-1 bg-slate-900/80 p-2 rounded border border-slate-800">
              {character_substitution || 'None detected'}
            </p>
          </div>
        </div>
      </div>

      {/* Critical Cybersecurity Advisory: HTTPS Warning */}
      <div className="mt-4 p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex items-start gap-3">
        {isHttps ? (
          <Lock className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        ) : (
          <Unlock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        )}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-white">
              {isHttps ? 'HTTPS / TLS Encryption Active' : 'Unencrypted HTTP Connection'}
            </span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-slate-800 text-slate-300">
              Security Protocol
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            {https_status?.note || (isHttps
              ? 'Data in transit is encrypted using TLS.'
              : 'Connection is unencrypted. Login credentials can be intercepted in plain text.')}
          </p>
          {/* Explicit requirement: Never state that HTTPS guarantees a website is trustworthy */}
          <div className="mt-2 text-[11px] text-amber-300/90 bg-amber-500/10 border border-amber-500/25 px-2.5 py-1.5 rounded flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>
              <strong>Crucial Security Rule:</strong> HTTPS only encrypts the connection between your browser and the server. It does <em>NOT</em> mean the website owner is honest or safe. Modern phishing sites routinely obtain free HTTPS certificates.
            </span>
          </div>
        </div>
      </div>

      {/* Heuristic Flags List with Plain English Explanations */}
      {heuristic_flags.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-800">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-3">
            Domain Heuristic Indicators ({heuristic_flags.length})
          </span>
          <div className="space-y-2">
            {heuristic_flags.map((flag, idx) => (
              <div 
                key={idx}
                className="flex items-start gap-2.5 p-3 rounded-lg bg-midnight-950 border border-slate-800/80 text-xs"
              >
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="font-mono text-slate-200">{flag}</span>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Evaluated against known adversarial registration patterns and typosquatting databases.
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
