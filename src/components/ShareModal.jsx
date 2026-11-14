import React, { useState } from 'react';
import { Share2, Copy, Check, X, ShieldAlert } from 'lucide-react';

export default function ShareModal({ isOpen, onClose, result }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !result) return null;

  const target = result.target_impersonated || 'Unknown Entity';
  const explanation = result.plain_english_explanation || 'Suspicious digital threat detected.';
  const link = result.url_analysis?.submitted_url || '';

  const shareText = `⚠️ PHISHGUARD SECURITY ALERT:
Threat: ${result.summary_verdict} (Risk: ${result.risk_score}/100)
Target Impersonated: ${target}
Details: ${explanation}
${link ? `Suspicious Link: ${link}` : ''}
Safe Action: DO NOT click or enter credentials!`;

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md rounded-2xl bg-midnight-900 border border-slate-800 p-6 shadow-2xl space-y-4">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 pb-2 border-b border-slate-800">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Share Scam Warning</h3>
            <p className="text-xs text-slate-400">Protect family and colleagues in 1 click</p>
          </div>
        </div>

        {/* Message Preview */}
        <div className="p-3.5 rounded-xl bg-midnight-950 border border-slate-800 text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
          {shareText}
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-lg shadow-emerald-900/20"
          >
            <Share2 className="w-4 h-4" />
            <span>WhatsApp</span>
          </a>

          <button
            onClick={handleCopy}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition border border-slate-700"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
            <span>{copied ? 'Copied' : 'Copy Text'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
