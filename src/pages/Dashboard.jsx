import React, { useState, useRef, useEffect } from 'react';
import InputTabs from '../components/InputTabs';
import ScannerRadar from '../components/ScannerRadar';
import ThreatCard from '../components/ThreatCard';
import WhyDangerous from '../components/WhyDangerous';
import QuoteHighlighter from '../components/QuoteHighlighter';
import UrlAnalysis from '../components/UrlAnalysis';
import SocialEngineering from '../components/SocialEngineering';
import ActionChecklist from '../components/ActionChecklist';
import DemoButtons from '../components/DemoButtons';
import { TELEMETRY_METRICS, RECENT_SAMPLE_SCANS } from '../data/mockData';
import { analyzeThreat } from '../services/api';
import { 
  Shield, 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  ArrowDown, 
  Activity, 
  ChevronRight, 
  CheckCircle2, 
  Sparkles,
  Lock,
  Search,
  ExternalLink,
  History
} from 'lucide-react';

export default function Dashboard({ 
  onSaveScanToHistory, 
  forceMock, 
  setActivePage,
  activeResult,
  setActiveResult 
}) {
  const [isScanning, setIsScanning] = useState(false);
  const [isDemoScan, setIsDemoScan] = useState(false);
  const [scanSource, setScanSource] = useState('mock'); // 'backend' | 'mock' | 'demo' | 'unknown'
  const [errorNotice, setErrorNotice] = useState(null);
  const abortControllerRef = useRef(null);
  const workspaceRef = useRef(null);

  useEffect(() => {
    if (activeResult) {
      setScanSource(activeResult.analysis_source || 'unknown');
    }
  }, [activeResult]);

  const scrollToWorkspace = () => {
    workspaceRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleStartAnalysis = async ({ type, content, file, forceDemoResult = null }) => {
    setErrorNotice(null);
    setIsScanning(true);
    setIsDemoScan(Boolean(forceDemoResult));
    abortControllerRef.current = new AbortController();

    if (forceDemoResult) {
      // Simulate realistic scanning delay for demo
      try {
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(resolve, 1800);
          abortControllerRef.current.signal.addEventListener('abort', () => {
            clearTimeout(timeout);
            reject(new DOMException('Scan aborted', 'AbortError'));
          });
        });

        const newResult = {
          ...forceDemoResult,
          scan_id: `scan_${Date.now().toString(36)}`,
          created_at: new Date().toISOString(),
          analysis_source: 'demo',
        };

        setActiveResult(newResult);
        setScanSource('demo');
        setIsScanning(false);
        if (onSaveScanToHistory) {
          onSaveScanToHistory(newResult);
        }

        setTimeout(() => {
          document.getElementById('threat-results-anchor')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
        return;
      } catch (err) {
        if (err.name === 'AbortError') {
          setIsScanning(false);
          return;
        }
      }
    }

    try {
      const response = await analyzeThreat({
        type,
        content,
        file,
        forceMock,
        signal: abortControllerRef.current.signal,
      });

      const result = {
        ...response.data,
        analysis_source: response.source,
      };
      setActiveResult(result);
      setScanSource(response.source);
      setIsScanning(false);

      if (onSaveScanToHistory) {
        onSaveScanToHistory(result);
      }

      setTimeout(() => {
        document.getElementById('threat-results-anchor')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      if (err.name === 'AbortError') {
        setIsScanning(false);
        return;
      }
      setIsScanning(false);
      setErrorNotice(err.message || 'Threat scanning failed. Check your input and try again.');
    }
  };

  const handleCancelScan = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsScanning(false);
  };

  const handleDemoSelect = (demo) => {
    handleStartAnalysis({
      type: demo.inputType,
      content: demo.sampleInput,
      forceDemoResult: demo.result,
    });
  };

  return (
    <div className="space-y-12 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-6 sm:pt-12 text-center max-w-4xl mx-auto px-4">
        {/* Subtle decorative glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(500px,100vw)] h-[300px] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Multi-Vector Scam Awareness Workspace</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Don't Trust the Message. <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-400">
              Verify It.
            </span>
          </h1>

          <p className="text-base lg:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            TrustLens gives everyday internet users and cybersecurity teams an intelligent lens to dissect manipulative emails, deceptive domains, credential harvesting lures, and payment fraud before damage is done.
          </p>

          {/* Quick CTA Actions */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={scrollToWorkspace}
              className="flex min-h-12 items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-midnight-950 bg-gradient-to-r from-cyan-400 to-cyan-300 hover:from-cyan-300 hover:to-cyan-200 shadow-lg shadow-cyan-500/25 transition-all transform hover:-translate-y-0.5"
            >
              <Search className="w-4 h-4" />
              <span>Analyze Message or URL Now</span>
              <ArrowDown className="w-4 h-4" />
            </button>

            <button
              onClick={() => setActivePage('how-it-works')}
              className="flex min-h-12 items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 transition"
            >
              <span>Explore Detection Architecture</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 2. PRODUCT CAPABILITIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="mb-3 text-xs leading-relaxed text-slate-400">
          Product capabilities and demo fixtures only — no live threat telemetry,
          model accuracy, or real-world scan totals are displayed.
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {TELEMETRY_METRICS.map((metric, idx) => (
            <div
              key={idx}
              className="p-4 sm:p-5 rounded-2xl bg-midnight-900/80 border border-slate-800/80 backdrop-blur-sm"
            >
              <span className="text-xs font-semibold text-slate-400 block truncate">
                {metric.label}
              </span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-xl sm:text-2xl font-bold font-mono text-white tracking-tight">
                  {metric.value}
                </span>
                <span className="text-[11px] font-mono text-cyan-400">
                  {metric.change}
                </span>
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                {metric.note}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 3. READY-TO-TEST DEMO SCENARIOS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <DemoButtons onSelectDemo={handleDemoSelect} isLoading={isScanning} />
      </section>

      {/* 4. ANALYSIS INPUT WORKSPACE */}
      <section ref={workspaceRef} id="analysis-workspace" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Security Analysis Workspace
              </h2>
              <p className="text-xs text-slate-400">
                Select an inspection vector below to evaluate for malicious indicators
              </p>
            </div>
          </div>
        </div>

        {/* Input Tabs Component */}
        <InputTabs 
          onAnalyze={handleStartAnalysis} 
          isLoading={isScanning}
        />

        {/* Error Notice Card */}
        {errorNotice && (
          <div role="alert" className="mt-4 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{errorNotice}</span>
            </div>
            <button
              onClick={() => setErrorNotice(null)}
              className="text-xs underline hover:text-white"
            >
              Dismiss
            </button>
          </div>
        )}
      </section>

      {/* 5. LIVE SCANNING RADAR */}
      {isScanning && (
        <section className="max-w-4xl mx-auto px-4">
          <ScannerRadar onCancel={handleCancelScan} isMock={forceMock || isDemoScan} />
        </section>
      )}

      {!activeResult && !isScanning && (
        <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8" aria-live="polite">
          <div className="flex items-start gap-4 rounded-2xl border border-slate-800 bg-midnight-900/70 p-5 sm:p-6">
            <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-3 text-cyan-300">
              <ShieldCheck className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Threat evaluation</h2>
              <p className="mt-1 text-base leading-relaxed text-slate-300">
                Run a scan to view detailed threat evaluation. Start with a sample scenario or submit a message, URL, or image above.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* 6. THREAT INTELLIGENCE RESULTS */}
      <div id="threat-results-anchor" />
      {activeResult && !isScanning && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          {scanSource !== 'backend' && activeResult.analysis_status !== 'unavailable' && activeResult.analysis_status !== 'partial' && (
            <div role="status" className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm leading-relaxed text-amber-100">
              {scanSource === 'demo'
                ? 'Preset demonstration result — the shown score and findings are fixed sample data, not computed from this submission or by an AI model.'
                : scanSource === 'mock'
                  ? 'Local heuristic output only — no AI model evaluated this content. This is not a verified security verdict.'
                  : scanSource === 'backend-heuristic'
                    ? 'The backend returned offline heuristic results; no AI model evaluated this content. This is not a verified security verdict.'
                    : 'The source of this saved result was not recorded. Treat it as unverified.'}
              {' '}
              {scanSource === 'demo'
                ? 'Do not rely on simulated demo data to decide whether a message or link is safe.'
                : scanSource === 'mock' || scanSource === 'backend-heuristic'
                  ? 'Treat heuristic results as guidance only; verify the sender and destination independently.'
                  : 'Verify the sender and destination independently.'}
            </div>
          )}
          {activeResult.analysis_status === 'unavailable' || activeResult.analysis_status === 'partial' ? (
            <div className="rounded-2xl border border-amber-500/30 bg-midnight-900/90 p-6 text-slate-200">
              <h2 className="text-xl font-bold text-white">
                {activeResult.analysis_status === 'partial' ? 'Image analysis incomplete' : 'Image analysis unavailable'}
              </h2>
              <p className="mt-2 text-base leading-relaxed">{activeResult.plain_english_explanation}</p>
              {activeResult.url_analysis?.submitted_url && (
                <p className="mt-4 break-all text-sm text-cyan-200">
                  Extracted QR destination: {activeResult.url_analysis.submitted_url}
                </p>
              )}
              {activeResult.url_analysis?.heuristic_flags?.length > 0 && (
                <ul className="mt-3 list-disc space-y-1 pl-6 text-sm text-slate-300">
                  {activeResult.url_analysis.heuristic_flags.map((flag) => <li key={flag}>{flag}</li>)}
                </ul>
              )}
              <ul className="mt-4 list-disc space-y-2 pl-6 text-base leading-relaxed">
                {activeResult.recommended_actions.map((action) => <li key={action}>{action}</li>)}
              </ul>
            </div>
          ) : (
            <>
              <ThreatCard result={activeResult} />
              <WhyDangerous
                items={activeResult.why_dangerous}
                threatLevel={activeResult.threat_level}
              />
              <QuoteHighlighter
                originalText={activeResult.submitted_content}
                quotes={activeResult.ai_social_engineering?.highlighted_quotes || []}
              />
              {activeResult.url_analysis && (
                <UrlAnalysis urlData={activeResult.url_analysis} />
              )}
              {activeResult.ai_social_engineering && (
                <SocialEngineering
                  socialData={activeResult.ai_social_engineering}
                  analysisSource={scanSource}
                />
              )}
              <ActionChecklist
                actions={activeResult.recommended_actions || []}
                threatLevel={activeResult.threat_level}
                riskScore={activeResult.risk_score}
                analysisSource={activeResult.analysis_source}
              />
            </>
          )}
        </section>
      )}

      {/* 7. ILLUSTRATIVE SAMPLE SCANS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
              Illustrative Threat Examples
            </h3>
          </div>
          <span className="text-xs text-slate-400">Static examples — not current threats or live telemetry</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {RECENT_SAMPLE_SCANS.map((scan) => {
            const isCrit = scan.threat_level === 'CRITICAL';
            const isSusp = scan.threat_level === 'SUSPICIOUS';

            return (
              <div
                key={scan.scan_id}
                className="p-4 rounded-xl bg-midnight-900/60 border border-slate-800/80 hover:border-slate-700 transition space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                    SAMPLE · {scan.type}
                  </span>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                    isCrit
                      ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                      : isSusp
                        ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                        : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                  }`}>
                    {scan.threat_level}
                  </span>
                </div>

                <div>
                  <span className="text-xs font-semibold text-white block">
                    {scan.target}
                  </span>
                  <span className="text-[11px] font-mono text-cyan-400/90 block truncate mt-0.5">
                    {scan.domain}
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 line-clamp-2 italic font-mono bg-midnight-950 p-2 rounded border border-slate-800/60">
                  "{scan.excerpt}"
                </p>

                <div className="flex items-center justify-between pt-1 text-[10px] text-slate-500 font-mono">
                  <span>Score: {scan.risk_score}/100</span>
                  <span>Illustrative</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 8. FOOTER */}
      <footer className="mt-16 border-t border-slate-800/80 pt-8 text-xs text-slate-400 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
              <Shield className="w-3 h-3 text-cyan-400" />
            </div>
            <span className="font-semibold text-white">TrustLens Cybersecurity Platform</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">See Through the Scam.</span>
          </div>

          <p className="text-slate-400 text-center sm:text-right">
            Designed for everyday internet users, security analysts, and enterprise awareness training.
          </p>
        </div>
      </footer>
    </div>
  );
}
