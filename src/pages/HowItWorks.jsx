import React from 'react';
import { 
  ShieldCheck, 
  Brain, 
  Globe, 
  Highlighter, 
  Lock, 
  Cpu, 
  CheckCircle2, 
  AlertTriangle, 
  FileSearch, 
  Terminal,
  Zap,
  ArrowRight
} from 'lucide-react';

export default function HowItWorks({ setActivePage }) {
  const steps = [
    {
      step: '01',
      title: 'Multi-Vector Ingestion & Normalization',
      icon: Cpu,
      description: 'Incoming payloads (SMS, emails, chat messages, or URLs) are sanitized and parsed into structural tokens. URLs are normalized to extract apex domains, subdomains, schemes, and parameters without executing dangerous remote code.',
      badge: 'Passive Inspection',
    },
    {
      step: '02',
      title: 'Cognitive Social Engineering Detection',
      icon: Brain,
      description: 'Unlike standard spam filters that only check blacklist databases, TrustLens analyzes human psychological manipulation patterns: artificial countdowns, legal threats, channel isolation instructions, and panic-inducing triggers.',
      badge: 'NLP Heuristics',
    },
    {
      step: '03',
      title: 'Domain Typosquatting & Homoglyph Parsing',
      icon: Globe,
      description: 'Adversaries routinely replace Latin characters with lookalike digits or Cyrillic homoglyphs (e.g. "paypa1.com" substituting "1" for "l"). TrustLens flags character substitutions, hyphen stuffing, and deceptive brand impersonation.',
      badge: 'Syntax Forensics',
    },
    {
      step: '04',
      title: 'Explainable AI & Forensic Attribution',
      icon: Highlighter,
      description: 'TrustLens never outputs an opaque black-box score. Every assessment clearly explains "Why is this dangerous?", highlights suspicious quotes with forensic rationale, and separates detected evidence from heuristic signals.',
      badge: 'Explainable Security',
    },
    {
      step: '05',
      title: 'Actionable Incident Response Mitigation',
      icon: ShieldCheck,
      description: 'Upon threat classification, TrustLens generates a dynamic, step-by-step containment checklist—guiding users on credential revocation, 2FA rotation, bank alerts, and registrar abuse reporting.',
      badge: 'Immediate Remediation',
    },
  ];

  const taxonomy = [
    {
      tactic: 'Artificial Urgency',
      example: '"Your account will be suspended within 2 hours."',
      mitigation: 'Legitimate providers offer graceful grace periods; never rush without independent verification.'
    },
    {
      tactic: 'Channel Isolation',
      example: '"Do NOT call billing support; reply only to this ticket."',
      mitigation: 'Forcing communication away from verified enterprise numbers is a signature indicator of BEC fraud.'
    },
    {
      tactic: 'Adversary-in-the-Middle (AiTM)',
      example: '"Enter your 6-digit OTP code to confirm identity."',
      mitigation: 'Attackers capture session tokens in real time; always verify you are on the authentic official domain.'
    },
    {
      tactic: 'Deceptive Lookalike Domains',
      example: '"wire-settlement-accounts-corp.net"',
      mitigation: 'Offshore anonymously registered apex domains stacked with trustworthy enterprise keywords.'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
          <Zap className="w-3.5 h-3.5" />
          <span>Product Architecture & Threat Intelligence Model</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          How TrustLens Sees Through the Scam
        </h1>

        <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
          Phishing attacks have evolved past crude spelling errors into sophisticated social engineering campaigns and brand impersonation. Here is how TrustLens dissects malicious communications.
        </p>
      </div>

      {/* 5-Step Pipeline Flow */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
          The 5-Stage Threat Analysis Pipeline
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {steps.map((st) => {
            const Icon = st.icon;
            return (
              <div
                key={st.step}
                className="p-6 rounded-2xl bg-midnight-900/80 border border-slate-800/80 hover:border-slate-700 transition flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-mono font-extrabold text-slate-600">
                      {st.step}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/60">
                      {st.badge}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5 mt-3">
                    <div className="p-2 rounded-lg bg-slate-800 text-cyan-400">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h3 className="text-base font-semibold text-white">
                      {st.title}
                    </h3>
                  </div>

                  <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">
                    {st.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Social Engineering Taxonomy Table */}
      <div className="p-6 sm:p-8 rounded-2xl bg-midnight-900/80 border border-slate-800/80 space-y-6">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">
            Detected Manipulation Taxonomy
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Key psychological persuasion signals catalogued by the TrustLens heuristic engine
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {taxonomy.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-midnight-850/70 border border-slate-800/80 space-y-2"
            >
              <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{item.tactic}</span>
              </div>
              <div className="text-xs font-mono text-slate-300 bg-midnight-950 p-2 rounded border border-slate-800/60">
                {item.example}
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                <strong className="text-slate-300">Defense Rule: </strong>
                {item.mitigation}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Risk Calibration Standards */}
      <div className="p-6 rounded-2xl bg-midnight-900/80 border border-slate-800 space-y-4">
        <h2 className="text-base font-bold text-white tracking-tight">
          Calibrated Risk Thresholds
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 space-y-1">
            <span className="text-xs font-bold font-mono text-emerald-400">
              SAFE: 0 - 34
            </span>
            <p className="text-xs text-slate-300">
              Normal operational communication. Lacks psychological extortion, urgency pressure, or unverified credential gates.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/25 space-y-1">
            <span className="text-xs font-bold font-mono text-amber-400">
              SUSPICIOUS: 35 - 69
            </span>
            <p className="text-xs text-slate-300">
              Anomalous keywords, low-reputation top-level domains, or mild urgency. Requires verification via a secondary trusted channel.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/25 space-y-1">
            <span className="text-xs font-bold font-mono text-rose-400">
              CRITICAL: 70 - 100
            </span>
            <p className="text-xs text-slate-300">
              Extreme urgency, active brand lookalikes, wire transfer coercion, or OTP harvesting. Immediate threat isolation required.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Bottom Banner */}
      <div className="text-center pt-4">
        <button
          onClick={() => setActivePage('dashboard')}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-midnight-950 bg-cyan-400 hover:bg-cyan-300 transition shadow-lg shadow-cyan-500/20"
        >
          <span>Launch Analysis Workspace</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
