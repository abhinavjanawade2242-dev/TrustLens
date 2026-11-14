import React from 'react';
import { DEMO_SCENARIOS } from '../data/mockData';
import { Play, ShieldAlert, AlertTriangle, ShieldCheck, Sparkles } from 'lucide-react';

export default function DemoButtons({ onSelectDemo, isLoading }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Interactive Test Scenarios
          </h3>
        </div>
        <span className="text-[11px] text-slate-400">Preset demonstration results</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
        {DEMO_SCENARIOS.map((demo) => {
          const isCritical = demo.result.threat_level === 'CRITICAL';
          const Icon = isCritical ? ShieldAlert : ShieldCheck;

          return (
            <button
              key={demo.id}
              onClick={() => onSelectDemo(demo)}
              disabled={isLoading}
              className={`min-h-48 p-4 rounded-xl text-left transition-all border group relative overflow-hidden flex flex-col justify-between disabled:cursor-not-allowed disabled:opacity-50 ${
                isCritical
                  ? 'bg-midnight-850/70 border-slate-800/80 hover:border-rose-500/50 hover:bg-slate-800/50'
                  : 'bg-midnight-850/70 border-slate-800/80 hover:border-emerald-500/50 hover:bg-slate-800/50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {demo.badge}
                  </span>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                    isCritical
                      ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                      : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                  }`}>
                    {demo.result.threat_level}
                  </span>
                </div>

                <h4 className="text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors">
                  {demo.title}
                </h4>

                <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2">
                  {demo.shortDesc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-cyan-400 group-hover:translate-x-1 transition-transform">
                <span className="font-medium">Run Test Scan</span>
                <Play className="w-3.5 h-3.5 fill-cyan-400" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
