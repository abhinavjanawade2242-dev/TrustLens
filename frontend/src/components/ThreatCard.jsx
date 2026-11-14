import React, { useState } from 'react';
import RiskGauge from './RiskGauge';
import { getRiskDetails, formatDate } from '../utils/riskHelpers';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  Target, 
  FileText, 
  ChevronDown, 
  ChevronUp, 
  Terminal, 
  Copy, 
  Check, 
  Share2, 
  Info 
} from 'lucide-react';

export default function ThreatCard({ result }) {
  const [showTechnical, setShowTechnical] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!result) return null;

  const threatLevel = result.threat_level || 'SAFE';
  const riskScore = result.risk_score ?? 0;
  const details = getRiskDetails(threatLevel, riskScore);
  const sourceLabel = result.analysis_source === 'backend'
    ? 'Backend response'
    : result.analysis_source === 'demo'
      ? 'Preset demo fixture'
      : result.analysis_source === 'mock'
        ? 'Local heuristic; no AI model'
        : result.analysis_source === 'backend-heuristic'
          ? 'Backend offline-heuristic fallback'
        : 'Source not recorded';

  const handleCopySummary = () => {
    const text = `[TrustLens Threat Intelligence Report]
Verdict: ${result.summary_verdict}
Threat Level: ${threatLevel} (Risk Score: ${riskScore}/100)
Target Impersonated: ${result.target_impersonated || 'None'}
Explanation: ${result.plain_english_explanation}
Scan ID: ${result.scan_id || 'N/A'}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`rounded-2xl border transition-all ${details.badgeBorder} bg-midnight-900/90 backdrop-blur-xl shadow-xl overflow-hidden`}>
      {/* Top Banner Accent */}
      <div 
        className="h-1.5 w-full"
        style={{ 
          background: `linear-gradient(90deg, ${details.color} 0%, rgba(6, 182, 212, 0.4) 100%)` 
        }} 
      />

      <div className="p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-slate-800/80">
          {/* Verdict and Identity */}
          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${details.badgeBg} ${details.badgeBorder} ${details.badgeText}`}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: details.color }} />
                <span>{details.label}</span>
              </span>
              <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5 bg-slate-800/60 px-2.5 py-1 rounded-full border border-slate-700/50">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {formatDate(result.created_at)}
              </span>
              {result.scan_id && (
                <span className="text-xs font-mono text-slate-500 hidden sm:inline-block">
                  ID: {result.scan_id}
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {result.summary_verdict || details.summaryHeader}
            </h2>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-3xl">
              {result.plain_english_explanation}
            </p>
          </div>

          {/* Radial Risk Gauge */}
          <div className="shrink-0 self-center lg:self-auto bg-midnight-850/80 p-2 rounded-2xl border border-slate-800/60">
            <RiskGauge score={riskScore} threatLevel={threatLevel} size={170} />
          </div>
        </div>

        {/* Target and Submitted Content Metadata */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-6 border-b border-slate-800/80">
          <div className="flex items-start gap-3 p-4 rounded-xl bg-midnight-850/60 border border-slate-800/70">
            <Target className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                Target / Brand Impersonated
              </span>
              <span className="text-sm font-medium text-white mt-0.5 block">
                {result.target_impersonated || 'None detected (Generic or Untargeted)'}
              </span>
              <span className="text-xs text-slate-400 mt-1 block">
                {result.target_impersonated && result.target_impersonated !== 'None detected' 
                  ? 'Message exhibits specific brand mimicry tactics to deceive users.' 
                  : 'No specific brand trademark patterns were detected in this payload.'}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-xl bg-midnight-850/60 border border-slate-800/70">
            <FileText className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div className="w-full overflow-hidden">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                Submitted Input Payload
              </span>
              <p className="text-xs font-mono text-slate-300 mt-1 truncate max-w-full bg-slate-900/80 px-2.5 py-1.5 rounded border border-slate-800">
                {result.submitted_content || result.url_analysis?.submitted_url || 'Plain text input payload'}
              </p>
              <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500">
                <span>Type: {result.url_analysis ? 'URL Destination' : 'Communication Text'}</span>
                <span>Length: {result.submitted_content?.length || 0} chars</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls & Expandable Technical Inspection */}
        <div className="pt-4 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => setShowTechnical(!showTechnical)}
            className="flex items-center gap-2 text-xs font-medium text-cyan-400 hover:text-cyan-300 transition px-3 py-1.5 rounded-lg hover:bg-cyan-500/10"
          >
            <Terminal className="w-4 h-4" />
            <span>{showTechnical ? 'Hide Analysis Details' : 'Expand Analysis Details'}</span>
            {showTechnical ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopySummary}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 transition border border-slate-700"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              <span>{copied ? 'Copied Report' : 'Copy Summary'}</span>
            </button>
          </div>
        </div>

        {/* Technical Telemetry Drawer */}
        {showTechnical && (
          <div className="mt-4 p-4 rounded-xl bg-midnight-950 border border-slate-800 text-xs font-mono space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between text-slate-400 pb-2 border-b border-slate-800">
              <span className="font-semibold text-slate-300">ANALYSIS RESPONSE DETAILS</span>
              <span className="text-[11px] text-cyan-400">JSON SCHEMA v2.4</span>
            </div>

            <pre className="text-slate-300 overflow-x-auto p-3 bg-black/40 rounded-lg text-[11px] leading-relaxed">
              {JSON.stringify(result, null, 2)}
            </pre>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-slate-400 text-[11px] pt-1">
              <div><strong className="text-slate-300">Result source:</strong> {sourceLabel}</div>
              <div><strong className="text-slate-300">Status:</strong> {result.analysis_status || 'Analysis response received'}</div>
              <div><strong className="text-slate-300">Scan ID:</strong> {result.scan_id || 'Not provided'}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
