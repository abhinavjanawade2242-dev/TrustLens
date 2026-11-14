import React from 'react';
import { Brain, Flame, Zap, Shield, AlertOctagon, CheckCircle2, FileText, Info } from 'lucide-react';

export default function SocialEngineering({ socialData }) {
  if (!socialData) return null;

  const {
    urgency_level = 'NONE',
    tactics_detected = [],
    highlighted_quotes = [],
    manipulation_pattern,
    evidence_level,
  } = socialData;

  const getUrgencyBadge = (level) => {
    const l = (level || '').toUpperCase();
    if (l === 'EXTREME' || l === 'CRITICAL') {
      return {
        bg: 'bg-rose-500/15',
        border: 'border-rose-500/40',
        text: 'text-rose-400',
        icon: Flame,
        label: 'EXTREME URGENCY',
      };
    }
    if (l === 'HIGH') {
      return {
        bg: 'bg-orange-500/15',
        border: 'border-orange-500/40',
        text: 'text-orange-400',
        icon: Zap,
        label: 'HIGH URGENCY',
      };
    }
    if (l === 'MODERATE' || l === 'MEDIUM') {
      return {
        bg: 'bg-amber-500/15',
        border: 'border-amber-500/40',
        text: 'text-amber-400',
        icon: AlertOctagon,
        label: 'MODERATE URGENCY',
      };
    }
    return {
      bg: 'bg-emerald-500/15',
      border: 'border-emerald-500/40',
      text: 'text-emerald-400',
      icon: CheckCircle2,
      label: 'CALM / NO URGENCY',
    };
  };

  const urgencyStyle = getUrgencyBadge(urgency_level);
  const UrgencyIcon = urgencyStyle.icon;

  return (
    <div className="rounded-2xl bg-midnight-900/80 border border-slate-800/80 p-6 lg:p-8 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              AI Social Engineering Analysis
            </h3>
            <p className="text-xs text-slate-400">
              Psychological manipulation heuristics and persuasion tactic taxonomy
            </p>
          </div>
        </div>

        {/* Urgency Badge */}
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border ${urgencyStyle.bg} ${urgencyStyle.border} ${urgencyStyle.text}`}>
          <UrgencyIcon className="w-4 h-4 shrink-0" />
          <span>{urgencyStyle.label}</span>
        </div>
      </div>

      <div className="space-y-5">
        {/* Manipulation Pattern Explanation */}
        {manipulation_pattern && (
          <div className="p-4 rounded-xl bg-midnight-850/80 border border-slate-800 space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
              Core Manipulation Vector
            </span>
            <p className="text-sm text-slate-200 leading-relaxed">
              {manipulation_pattern}
            </p>
          </div>
        )}

        {/* Tactics Detected Tags */}
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2.5">
            Tactics Detected ({tactics_detected.length})
          </span>
          {tactics_detected.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {tactics_detected.map((tactic, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800/90 text-cyan-300 border border-cyan-500/20 shadow-sm"
                >
                  {tactic}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">No specific deceptive tactics flagged.</p>
          )}
        </div>

        {/* Confidence / Evidence Level */}
        {evidence_level && (
          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-cyan-400" />
              Evidence Confidence Level:
            </span>
            <span className="font-mono text-cyan-400 bg-cyan-950/40 px-2.5 py-1 rounded border border-cyan-900/60">
              {evidence_level}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
