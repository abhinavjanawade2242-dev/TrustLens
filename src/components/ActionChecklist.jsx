import React, { useState, useEffect } from 'react';
import { CheckSquare, Square, CheckCircle2, Download } from 'lucide-react';

export default function ActionChecklist({ actions = [], threatLevel = 'SAFE', riskScore = 0 }) {
  // Store completed items by index/title
  const [completedMap, setCompletedMap] = useState({});

  // Reset checklist if actions change significantly
  useEffect(() => {
    setCompletedMap({});
  }, [actions]);

  const toggleAction = (idx) => {
    setCompletedMap(prev => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const total = actions.length;
  const completedCount = Object.values(completedMap).filter(Boolean).length;
  const progressPercent = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  const pendingActions = actions.map((act, idx) => ({ act, idx })).filter(item => !completedMap[item.idx]);
  const completedActions = actions.map((act, idx) => ({ act, idx })).filter(item => completedMap[item.idx]);

  const handleExport = () => {
    const text = `TRUSTLENS DEFENSE ACTION PLAN
Threat Assessment: ${threatLevel}
Generated: ${new Date().toLocaleString()}

COMPLETED ACTIONS (${completedCount}/${total}):
${completedActions.map(i => `[X] ${i.act}`).join('\n') || 'None yet'}

RECOMMENDED PENDING ACTIONS:
${pendingActions.map(i => `[ ] ${i.act}`).join('\n') || 'All actions completed!'}
`;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trustlens-action-checklist-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const shareMessage = `TrustLens flagged a message as ${threatLevel} (${Math.min(100, Math.max(0, Number(riskScore) || 0))}/100). Avoid unexpected links and verify requests through an official channel. TrustLens provides automated risk analysis and educational guidance. It does not replace official banking verification or professional cybersecurity advice.`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;

  return (
    <div className="rounded-2xl bg-midnight-900/80 border border-slate-800/80 p-6 lg:p-8 shadow-xl">
      {/* Header & Progress Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              Incident Response & Action Checklist
            </h3>
            <p className="text-xs text-slate-400">
              Interactive mitigation playbook tailored to this threat profile
            </p>
          </div>
        </div>

        {/* Progress & Export Buttons */}
        <div className="flex items-center gap-3">
          <div className="flex flex-wrap gap-2">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="Share a general TrustLens safety notice on WhatsApp"
              className="flex min-h-12 items-center gap-2 px-3 rounded-lg text-sm font-medium bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition"
            >
              <span>Share safety notice on WhatsApp</span>
            </a>
            <a
              href="tel:1930"
              aria-label="Call India's cybercrime helpline 1930"
              className="flex min-h-12 items-center gap-2 px-3 rounded-lg text-sm font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              <span>Call cybercrime helpline 1930</span>
            </a>
            <button
              type="button"
              onClick={handleExport}
              className="flex min-h-12 items-center gap-2 px-3 rounded-lg text-sm font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
              title="Download printable action plan"
            >
              <Download className="w-4 h-4" />
              <span>Export Plan</span>
            </button>
          </div>
        </div>
      </div>

      {/* Completion Meter Bar */}
      <div className="mb-6 p-4 rounded-xl bg-midnight-850/60 border border-slate-800/80">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="font-semibold text-slate-300 flex items-center gap-2">
            <span>Mitigation Progress</span>
            <span className="font-mono text-cyan-400">
              {completedCount} of {total} completed
            </span>
          </span>
          <span className="font-mono font-bold text-cyan-400">{progressPercent}%</span>
        </div>
        <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Sections: Recommended Pending vs Completed */}
      <div className="space-y-6">
        {/* Recommended Actions (Pending) */}
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-3 flex items-center justify-between">
            <span>Recommended Actions ({pendingActions.length})</span>
            <span className="text-[11px] text-slate-500 font-normal">Click item once resolved</span>
          </span>

          {pendingActions.length > 0 ? (
            <div className="space-y-2">
              {pendingActions.map(({ act, idx }) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => toggleAction(idx)}
                  aria-pressed={Boolean(completedMap[idx])}
                  className="group flex min-h-12 w-full items-start gap-3 p-3.5 rounded-xl bg-midnight-850/80 border border-slate-800 hover:border-cyan-500/40 hover:bg-slate-800/50 cursor-pointer transition text-left text-base text-slate-200 select-none"
                >
                  <Square className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 shrink-0 mt-0.5 transition-colors" />
                  <span className="leading-snug">{act}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Great job! All recommended security steps have been marked as resolved.</span>
            </div>
          )}
        </div>

        {/* Completed Actions */}
        {completedActions.length > 0 && (
          <div className="pt-4 border-t border-slate-800/80">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 block mb-3">
              Completed Actions ({completedActions.length})
            </span>
            <div className="space-y-2">
              {completedActions.map(({ act, idx }) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => toggleAction(idx)}
                  aria-pressed={Boolean(completedMap[idx])}
                  className="flex min-h-12 w-full items-start gap-3 p-3 rounded-xl bg-midnight-950 border border-emerald-500/20 text-left text-xs text-slate-400 cursor-pointer hover:bg-slate-900 line-through select-none"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="leading-snug">{act}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
