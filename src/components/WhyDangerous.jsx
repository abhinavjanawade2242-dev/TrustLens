import React from 'react';
import { 
  AlertTriangle, 
  Clock, 
  KeyRound, 
  Globe, 
  CreditCard, 
  ShieldAlert, 
  CheckCircle2, 
  HelpCircle,
  FileSearch,
  BadgeAlert
} from 'lucide-react';

export default function WhyDangerous({ items = [], threatLevel = 'SAFE' }) {
  if (!items || items.length === 0) {
    if (threatLevel === 'SAFE') {
      return (
        <div className="rounded-2xl bg-midnight-900/80 border border-slate-800/80 p-6 lg:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                Why is this dangerous? (Threat Analysis)
              </h3>
              <p className="text-xs text-slate-400">
                Signature TrustLens Deep Risk Decomposition
              </p>
            </div>
          </div>
          <div className="p-5 rounded-xl bg-midnight-850/60 border border-emerald-500/20 text-slate-300 text-sm leading-relaxed">
            <span className="font-semibold text-emerald-400 block mb-1">
              No Critical Coercion Signals Flagged
            </span>
            The analysis pipeline did not detect urgency exploitation, artificial deadlines, OTP/credential harvesting solicitations, or known spoofed domain patterns in this payload. Normal digital hygiene remains recommended.
          </div>
        </div>
      );
    }
    return null;
  }

  const getCategoryIcon = (category = '') => {
    const c = category.toLowerCase();
    if (c.includes('deadline') || c.includes('urgency') || c.includes('time')) {
      return Clock;
    }
    if (c.includes('credential') || c.includes('otp') || c.includes('password') || c.includes('key')) {
      return KeyRound;
    }
    if (c.includes('domain') || c.includes('link') || c.includes('url') || c.includes('spoof')) {
      return Globe;
    }
    if (c.includes('payment') || c.includes('wire') || c.includes('invoice') || c.includes('fee')) {
      return CreditCard;
    }
    return ShieldAlert;
  };

  return (
    <div className="rounded-2xl bg-midnight-900/85 border border-slate-800/80 p-6 lg:p-8 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-sm shadow-rose-950">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white tracking-tight">
                Why Is This Dangerous?
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                Signature Feature
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Psychological coercion breakdown and deceptive signal evidence
            </p>
          </div>
        </div>

        {/* Legend: Detected Evidence vs Heuristic */}
        <div className="flex items-center gap-3 text-[11px] text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-400" />
            <span>Detected Text Quote</span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>Behavioral Heuristic</span>
          </div>
        </div>
      </div>

      {/* Grid of Dangerous Explanations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item, idx) => {
          const Icon = getCategoryIcon(item.category);
          return (
            <div
              key={idx}
              className="p-5 rounded-xl bg-midnight-850/80 border border-slate-800/90 hover:border-slate-700 transition flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-slate-800/80 text-cyan-400 border border-slate-700/60">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      {item.category || 'Threat Vector'}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-rose-500/10 text-rose-300 border border-rose-500/20">
                    Flagged Signal #{idx + 1}
                  </span>
                </div>

                <h4 className="text-base font-semibold text-white mt-3">
                  {item.title}
                </h4>

                <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                  {item.explanation}
                </p>
              </div>

              {/* Detected Evidence Box */}
              {item.detected_evidence && (
                <div className="mt-2 pt-3 border-t border-slate-800/80">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1 flex items-center gap-1">
                    <FileSearch className="w-3 h-3 text-cyan-400" />
                    Extracted Signal Evidence:
                  </span>
                  <div className="text-xs font-mono text-rose-300 bg-rose-950/20 border border-rose-500/30 p-2.5 rounded-lg break-words">
                    {item.detected_evidence}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
