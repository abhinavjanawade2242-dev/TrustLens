import React, { useState } from 'react';
import { Highlighter, Info, ShieldCheck, AlertCircle, Quote } from 'lucide-react';

export default function QuoteHighlighter({ originalText = '', quotes = [] }) {
  const [selectedQuote, setSelectedQuote] = useState(quotes.length > 0 ? quotes[0] : null);

  // Normalize quotes structure: could be array of strings or array of objects
  const normalizedQuotes = quotes.map((q, idx) => {
    if (typeof q === 'string') {
      return {
        id: `q-${idx}`,
        quote: q,
        category: 'Social Engineering Pattern',
        reason: 'Flagged phrase commonly associated with phishing lures or psychological manipulation.'
      };
    }
    return {
      id: `q-${idx}`,
      quote: q.quote || '',
      category: q.category || 'Deceptive Pattern',
      reason: q.reason || 'Flagged for suspicious terminology or coercion.'
    };
  }).filter(q => q.quote && q.quote.trim().length > 0);

  if (!originalText || originalText.trim().length === 0) {
    return null;
  }

  if (normalizedQuotes.length === 0) {
    return (
      <div className="rounded-2xl bg-midnight-900/80 border border-slate-800/80 p-6 lg:p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-slate-800 text-slate-300 border border-slate-700/60">
            <Highlighter className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              Suspicious Phrase Highlighter
            </h3>
            <p className="text-xs text-slate-400">
              Interactive text forensics and manipulation markers
            </p>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-midnight-850/60 border border-slate-800 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-white text-sm block">
              No High-Risk Phrases Detected
            </span>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              The NLP extractor scanned the submitted communication and found no overt urgent phrases, panic keywords, or direct solicitations for passwords/credentials.
            </p>
          </div>
        </div>

        <div className="mt-4 p-4 rounded-xl bg-midnight-950 border border-slate-800/80 font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
          {originalText}
        </div>
      </div>
    );
  }

  // Segment original text by matching quotes
  // To avoid substring collision, we find occurrences
  const renderHighlightedContent = () => {
    let segments = [{ text: originalText, isHighlight: false, match: null }];

    normalizedQuotes.forEach(q => {
      const newSegments = [];
      segments.forEach(seg => {
        if (seg.isHighlight) {
          newSegments.push(seg);
          return;
        }

        const quoteStr = q.quote;
        const lowerText = seg.text.toLowerCase();
        const lowerQuote = quoteStr.toLowerCase();
        const index = lowerText.indexOf(lowerQuote);

        if (index === -1) {
          newSegments.push(seg);
        } else {
          const before = seg.text.substring(0, index);
          const matched = seg.text.substring(index, index + quoteStr.length);
          const after = seg.text.substring(index + quoteStr.length);

          if (before) newSegments.push({ text: before, isHighlight: false });
          newSegments.push({ text: matched, isHighlight: true, quoteObj: q });
          if (after) newSegments.push({ text: after, isHighlight: false });
        }
      });
      segments = newSegments;
    });

    return segments.map((seg, i) => {
      if (!seg.isHighlight) {
        return <span key={i} className="text-slate-300">{seg.text}</span>;
      }

      const isSelected = selectedQuote && (selectedQuote.quote === seg.quoteObj.quote);

      return (
        <mark
          key={i}
          onClick={() => setSelectedQuote(seg.quoteObj)}
          className={`cursor-pointer inline rounded px-1.5 py-0.5 mx-0.5 font-medium transition-all duration-200 border ${
            isSelected
              ? 'bg-rose-500/30 text-rose-200 border-rose-400 ring-2 ring-rose-500/40'
              : 'bg-rose-500/15 text-rose-300 border-rose-500/30 hover:bg-rose-500/25 hover:border-rose-400'
          }`}
          title="Click to view why this phrase is suspicious"
        >
          {seg.text}
        </mark>
      );
    });
  };

  return (
    <div className="rounded-2xl bg-midnight-900/80 border border-slate-800/80 p-6 lg:p-8 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Highlighter className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              Suspicious Quote Forensic Highlighter
            </h3>
            <p className="text-xs text-slate-400">
              Click or tap any highlighted segment to inspect the deception rationale
            </p>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-mono font-medium bg-rose-500/15 text-rose-300 border border-rose-500/30 shrink-0">
          {normalizedQuotes.length} Suspicious Signal{normalizedQuotes.length > 1 ? 's' : ''} Flagged
        </span>
      </div>

      {/* Main Text Presentation Area */}
      <div className="p-5 rounded-xl bg-midnight-950/90 border border-slate-800/80 text-sm leading-relaxed whitespace-pre-wrap font-sans">
        {renderHighlightedContent()}
      </div>

      {/* Quote Explanation Detail Card */}
      {selectedQuote && (
        <div className="mt-5 p-4 rounded-xl bg-midnight-850 border border-cyan-500/30 shadow-lg animate-fadeIn">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <Quote className="w-4 h-4 text-cyan-400 shrink-0" />
              <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
                {selectedQuote.category}
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
              Interactive Forensics
            </span>
          </div>

          <div className="mt-2 text-xs font-mono text-rose-300 bg-rose-950/20 border-l-2 border-rose-500 pl-3 py-1.5 my-2">
            "{selectedQuote.quote}"
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mt-2">
            <strong className="text-white">Why it's flagged: </strong>
            {selectedQuote.reason}
          </p>
        </div>
      )}

      {/* Quick Select Pill List */}
      <div className="mt-4 flex flex-wrap items-center gap-2 pt-2">
        <span className="text-xs text-slate-400 font-medium mr-1">Flagged Quotes:</span>
        {normalizedQuotes.map((q, idx) => {
          const isSelected = selectedQuote && selectedQuote.quote === q.quote;
          return (
            <button
              key={idx}
              onClick={() => setSelectedQuote(q)}
              className={`text-xs px-2.5 py-1 rounded-lg border font-mono transition truncate max-w-[200px] ${
                isSelected
                  ? 'bg-rose-500/20 border-rose-500/60 text-rose-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
              }`}
            >
              "{q.quote}"
            </button>
          );
        })}
      </div>
    </div>
  );
}
