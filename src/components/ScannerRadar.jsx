import React, { useState, useEffect } from 'react';
import { X, Check, Radio } from 'lucide-react';

const STAGES = [
  "Preparing submitted content",
  "Applying available analysis",
  "Organizing detected indicators",
  "Preparing the result"
];

export default function ScannerRadar({ onCancel, isMock = false }) {
  const [currentStageIdx, setCurrentStageIdx] = useState(0);
  const [progress, setProgress] = useState(15);

  useEffect(() => {
    const stageDuration = 450; // ms per stage for crisp, responsive demo
    const interval = setInterval(() => {
      setCurrentStageIdx(prev => {
        if (prev < STAGES.length - 1) {
          const next = prev + 1;
          setProgress(Math.round(((next + 1) / STAGES.length) * 95));
          return next;
        }
        setProgress(100);
        return prev;
      });
    }, stageDuration);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="rounded-2xl bg-midnight-900/90 border border-cyan-500/30 p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl animate-fadeIn">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center max-w-md mx-auto">
        {/* Animated Radar Visual */}
        <div className="relative w-48 h-48 mb-6 flex items-center justify-center">
          {/* Concentric Circles */}
          <div className="absolute inset-0 rounded-full border border-cyan-500/15" />
          <div className="absolute inset-4 rounded-full border border-cyan-500/25" />
          <div className="absolute inset-10 rounded-full border border-cyan-500/35" />
          <div className="absolute inset-16 rounded-full border border-cyan-500/50" />
          
          {/* Crosshairs */}
          <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-cyan-500/20" />
          <div className="absolute left-0 right-0 top-1/2 h-[1px] bg-cyan-500/20" />

          {/* Sweeping Radar Line */}
          <div 
            className="absolute inset-0 rounded-full animate-radar-sweep pointer-events-none"
            style={{
              background: 'conic-gradient(from 0deg at 50% 50%, rgba(6, 182, 212, 0.4) 0deg, rgba(6, 182, 212, 0) 65deg, transparent 65deg)',
            }}
          />

          {/* Center Target Indicator */}
          <div className="relative z-10 flex items-center justify-center w-12 h-12 rounded-full bg-midnight-950 border border-cyan-400 shadow-lg shadow-cyan-500/30">
            <Radio className="w-5 h-5 text-cyan-400 animate-pulse" />
          </div>

          {/* Blip dots */}
          <div className="absolute top-8 right-12 w-2 h-2 rounded-full bg-cyan-300 animate-ping-slow" />
          <div className="absolute bottom-10 left-10 w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
        </div>

        {/* Status Headline */}
        <div className="space-y-1 mb-6">
          <div className="flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <h3 className="text-lg font-bold text-white tracking-tight">
              Scan in progress
            </h3>
          </div>
          <p className="text-xs font-mono text-cyan-400">
            {isMock ? 'Demo only — simulated scan animation; no AI model is running' : 'Waiting for the configured backend response'}
          </p>
        </div>

        {/* Stage Timeline */}
        <div className="w-full space-y-2 mb-6 text-left">
          {STAGES.map((stage, idx) => {
            const isCompleted = idx < currentStageIdx;
            const isCurrent = idx === currentStageIdx;
            return (
              <div
                key={idx}
                className={`flex items-center gap-3 p-2 rounded-lg text-xs transition-all ${
                  isCurrent
                    ? 'bg-cyan-500/15 border border-cyan-500/30 text-white font-medium'
                    : isCompleted
                      ? 'text-slate-400'
                      : 'text-slate-600'
                }`}
              >
                <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-[10px] ${
                  isCompleted
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : isCurrent
                      ? 'bg-cyan-500/30 text-cyan-300'
                      : 'bg-slate-800 text-slate-600'
                }`}>
                  {isCompleted ? <Check className="w-3 h-3" /> : idx + 1}
                </div>
                <span className="truncate">{stage}</span>
                {isCurrent && (
                  <span className="ml-auto flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Progress Bar */}
        <div className="w-full mb-6">
          <div className="flex justify-between text-xs text-slate-400 mb-1.5 font-mono">
            <span>Scan Progression</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-cyan-500 to-blue-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Cancellation Action */}
        {onCancel && (
          <button
            onClick={onCancel}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 transition"
          >
            <X className="w-3.5 h-3.5" />
            <span>Cancel Scan</span>
          </button>
        )}
      </div>
    </div>
  );
}
