import React, { useState } from 'react';
import { getRiskDetails, formatDate } from '../utils/riskHelpers';
import { 
  History, 
  Trash2, 
  ExternalLink, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Search, 
  Filter, 
  Clock, 
  Info,
  ChevronRight,
  X,
  FileText
} from 'lucide-react';

export default function ThreatHistory({ history = [], onClearHistory, onSelectHistoryItem, setActivePage }) {
  const [filterLevel, setFilterLevel] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const filtered = history.filter(item => {
    if (filterLevel !== 'ALL' && item.threat_level !== filterLevel) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchVerdict = (item.summary_verdict || '').toLowerCase().includes(q);
      const matchContent = (item.submitted_content || '').toLowerCase().includes(q);
      const matchTarget = (item.target_impersonated || '').toLowerCase().includes(q);
      const matchDomain = (item.url_analysis?.actual_domain || '').toLowerCase().includes(q);
      return matchVerdict || matchContent || matchTarget || matchDomain;
    }
    return true;
  });

  const handleOpenResult = (item) => {
    onSelectHistoryItem(item);
    setActivePage('dashboard');
    setTimeout(() => {
      document.getElementById('threat-results-anchor')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-md shadow-cyan-950">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Threat Intelligence History
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Review and audit previous payload scans, forensic indicators, and mitigation plans
            </p>
          </div>
        </div>

        {history.length > 0 && (
          <button
            onClick={() => setShowClearConfirm(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition self-start sm:self-auto"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {/* Browser Local Storage Notice */}
      <div className="p-4 rounded-xl bg-midnight-900/80 border border-slate-800 flex items-start gap-3 text-xs text-slate-400">
        <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-slate-300">Privacy Notice:</strong> This audit trail is saved in your browser's local sandbox storage (`localStorage`) for demonstration and audit review. Results are not uploaded to a centralized cloud database.
        </p>
      </div>

      <p className="text-xs leading-relaxed text-slate-400">
        Demo and offline heuristic results are labeled as simulated. Items with
        no source label were saved before source tracking was added.
      </p>

      {/* Controls: Search & Filter Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by keywords, domains, or impersonated brands..."
            className="w-full rounded-xl bg-midnight-950 border border-slate-800 pl-9 pr-4 py-2 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto p-1 bg-midnight-950 rounded-xl border border-slate-800">
          {['ALL', 'CRITICAL', 'SUSPICIOUS', 'SAFE', 'UNASSESSED'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setFilterLevel(lvl)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                filterLevel === lvl
                  ? 'bg-slate-800 text-cyan-400 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* History List or Empty State */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-midnight-900/60 border border-slate-800/80 space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-800/80 text-slate-500 flex items-center justify-center mx-auto">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">No Threat Scans Found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {history.length === 0
                ? "You haven't run any scans yet. Run a test scenario from the dashboard or paste a suspicious message to begin."
                : "No scans match your current search and filter criteria."}
            </p>
          </div>
          {history.length === 0 && (
            <button
              onClick={() => setActivePage('dashboard')}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-midnight-950 bg-cyan-400 hover:bg-cyan-300 transition"
            >
              Go to Dashboard
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item, index) => {
            const isPartial = item.analysis_status === 'partial';
            const isUnassessed = isPartial || item.analysis_status === 'unavailable';
            const riskScore = item.risk_score;
            const details = isUnassessed
              ? {
                  borderSubtle: 'rgba(148, 163, 184, 0.25)',
                  badgeBg: 'bg-slate-500/15',
                  badgeBorder: 'border-slate-500/40',
                  badgeText: 'text-slate-300',
                  color: '#94a3b8',
                  shortLabel: isPartial ? 'PARTIAL ANALYSIS' : 'NOT ANALYZED',
                }
              : getRiskDetails(item.threat_level || 'SAFE', riskScore ?? 0);

            return (
              <div
                key={item.scan_id || `${item.created_at || 'scan'}-${index}`}
                onClick={() => handleOpenResult(item)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    handleOpenResult(item);
                  }
                }}
                role="button"
                tabIndex={0}
                className={`p-5 rounded-2xl bg-midnight-900/80 border ${details.borderSubtle} hover:border-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/60 transition cursor-pointer group flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4`}
              >
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 rounded border border-slate-700 bg-slate-800 text-[10px] font-mono text-slate-300">
                      {isUnassessed
                        ? details.shortLabel
                        : item.analysis_source === 'backend'
                        ? 'BACKEND RESULT'
                        : item.analysis_source === 'backend-heuristic'
                          ? 'BACKEND HEURISTIC'
                        : item.analysis_source === 'demo'
                          ? 'SIMULATED DEMO'
                          : item.analysis_source === 'mock'
                            ? 'SIMULATED HEURISTIC'
                            : 'SOURCE NOT RECORDED'}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${details.badgeBg} ${details.badgeBorder} ${details.badgeText}`}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: details.color }} />
                      <span>{isUnassessed ? details.shortLabel : `${details.shortLabel} (${riskScore ?? 0}/100)`}</span>
                    </span>
                    <span className="text-xs text-slate-500 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(item.created_at)}
                    </span>
                    {item.target_impersonated && item.target_impersonated !== 'None detected' && (
                      <span className="text-xs text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-900/60 font-mono">
                        Target: {item.target_impersonated}
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-semibold text-white group-hover:text-cyan-300 transition-colors truncate">
                    {item.summary_verdict}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {item.plain_english_explanation}
                  </p>
                </div>

                <div className="shrink-0 flex items-center gap-3 self-end sm:self-center">
                  <span className="text-xs font-medium text-cyan-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    <span>Inspect Report</span>
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal to Clear History */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm rounded-2xl bg-midnight-900 border border-slate-700 p-6 space-y-4 text-slate-200 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-400">
                <Trash2 className="w-5 h-5" />
                <h3 className="font-semibold text-white">Clear Threat History?</h3>
              </div>
              <button onClick={() => setShowClearConfirm(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              This will permanently remove all cached scan reports from your local browser storage. This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-3.5 py-2 rounded-xl text-xs font-medium bg-slate-800 text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onClearHistory();
                  setShowClearConfirm(false);
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-medium bg-rose-600 hover:bg-rose-500 text-white font-semibold shadow-lg shadow-rose-950"
              >
                Yes, Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
