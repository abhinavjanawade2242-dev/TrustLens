import React, { useState, useEffect } from 'react';
import { checkBackendHealth, API_BASE_URL } from '../services/api';
import { Wifi, WifiOff, RefreshCw, Server, AlertCircle, CheckCircle2, ChevronRight, X, ShieldAlert } from 'lucide-react';

export default function BackendStatus({ forceMock, setForceMock, onStatusChange }) {
  const [backendState, setBackendState] = useState({
    checked: false,
    online: false,
    checking: false,
    details: null,
    lastChecked: null,
  });
  const [showModal, setShowModal] = useState(false);

  const pingBackend = async () => {
    setBackendState(prev => ({ ...prev, checking: true }));
    const result = await checkBackendHealth();
    setBackendState({
      checked: true,
      online: result.online,
      checking: false,
      details: result,
      lastChecked: new Date().toLocaleTimeString(),
    });
    if (onStatusChange) {
      onStatusChange(result.online);
    }
  };

  useEffect(() => {
    pingBackend();
    const interval = setInterval(pingBackend, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  const isLive = backendState.online && !forceMock;

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowModal(true)}
          aria-label={`${forceMock ? 'Demo mock engine selected' : backendState.online ? 'Backend online' : 'Backend offline'}. Open backend settings`}
          className={`group flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
            isLive
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
              : forceMock
                ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
          }`}
          title="Click to view backend status and API settings"
        >
          <span className="relative flex h-2 w-2">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isLive ? 'bg-emerald-400' : forceMock ? 'bg-cyan-400' : 'bg-amber-400'
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                isLive ? 'bg-emerald-500' : forceMock ? 'bg-cyan-500' : 'bg-amber-500'
              }`}
            />
          </span>
          <span className="hidden font-mono sm:inline">
            {forceMock
              ? 'Demo Mock Engine'
              : backendState.online
                ? 'Backend Live'
                : 'Backend Offline'}
          </span>
          <ChevronRight className="w-3 h-3 opacity-60 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Backend Diagnostics & Configuration Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-2xl bg-midnight-900 border border-slate-700/60 shadow-2xl overflow-hidden p-6 text-slate-200">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <Server className="w-5 h-5 text-cyan-400" />
                <h3 className="font-semibold text-white text-base">Backend Status & API Settings</h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status Overview */}
            <div className="mt-5 space-y-4">
              <div className="p-4 rounded-xl bg-midnight-850 border border-slate-800/80 flex items-start gap-3">
                {backendState.online ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
                )}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-white text-sm">
                      {backendState.online ? 'Backend health endpoint online' : 'Backend health endpoint unreachable'}
                    </span>
                    <button
                      onClick={pingBackend}
                      disabled={backendState.checking}
                      className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3 h-3 ${backendState.checking ? 'animate-spin' : ''}`} />
                      Ping
                    </button>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {backendState.online
                      ? `Successfully connected to health probe at ${API_BASE_URL}/api/health.`
                      : `No server responding at ${API_BASE_URL}. Only explicitly labeled local demo heuristics are available; no AI threat analysis is running.`}
                  </p>
                  {backendState.lastChecked && (
                    <span className="text-[11px] font-mono text-slate-500 mt-2 block">
                      Last ping: {backendState.lastChecked}
                    </span>
                  )}
                </div>
              </div>

              {/* Mode Selector */}
              <div className="p-4 rounded-xl bg-midnight-850/60 border border-slate-800/80 space-y-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Execution Mode</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setForceMock(false)}
                    className={`px-3 py-2.5 rounded-lg text-xs font-medium border text-left transition flex flex-col gap-1 ${
                      !forceMock
                        ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-850'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">Backend first</span>
                      {!forceMock && <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />}
                    </div>
                    <span className="text-[11px] text-slate-400">Try the configured API, then clearly label any local fallback</span>
                  </button>
                  <button
                    onClick={() => setForceMock(true)}
                    className={`px-3 py-2.5 rounded-lg text-xs font-medium border text-left transition flex flex-col gap-1 ${
                      forceMock
                        ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-850'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">Demo only</span>
                      {forceMock && <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />}
                    </div>
                    <span className="text-[11px] text-slate-400">No network requests; local heuristics and preset fixtures only</span>
                  </button>
                </div>
              </div>

              {/* Endpoint Specifications & Shared Contract */}
              <div className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">API Contract Reference</span>
                <div className="text-xs font-mono p-3 bg-midnight-950 rounded-lg border border-slate-800 text-slate-300 space-y-1">
                  <div className="flex justify-between text-slate-400">
                    <span>Configured Base:</span>
                    <span className="text-cyan-400">{API_BASE_URL}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Health Probe:</span>
                    <span className="text-emerald-400">GET /api/health</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Text Analysis:</span>
                    <span className="text-cyan-300">POST /api/analyze (text)</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>URL Analysis:</span>
                    <span className="text-cyan-300">POST /api/analyze (URL)</span>
                  </div>
                </div>
              </div>

              {/* Note on Transparency */}
              <div className="text-xs text-slate-400 bg-slate-900/50 p-3 rounded-lg border border-slate-800 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>
                  A successful health check confirms only that the server responds. It does not confirm the analysis API or an AI model is available. Local fallback output is simulated heuristics, not AI detection.
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium transition"
              >
                Close Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
