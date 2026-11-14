import React from 'react';
import { getRiskDetails, getThreatLevel } from '../utils/riskHelpers';
import { ShieldAlert, ShieldCheck, AlertTriangle } from 'lucide-react';

export default function RiskGauge({ score = 0, threatLevel, size = 180 }) {
  const level = threatLevel || getThreatLevel(score);
  const details = getRiskDetails(level, score);
  const safeScore = Math.min(100, Math.max(0, Number(score) || 0));

  // Circular gauge calculations
  const radius = 68;
  const circumference = 2 * Math.PI * radius;
  // Use 240 degree arc for gauge look
  const arcLength = circumference * 0.75;
  const strokeDashoffset = arcLength - (arcLength * safeScore) / 100;

  const IconComponent = 
    level === 'CRITICAL' ? ShieldAlert :
    level === 'SUSPICIOUS' ? AlertTriangle :
    ShieldCheck;

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg
          className="transform -rotate-[135deg]"
          width={size}
          height={size}
          viewBox="0 0 160 160"
        >
          {/* Background track */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth="11"
            strokeDasharray={arcLength}
            strokeDashoffset="0"
            strokeLinecap="round"
          />
          {/* Dynamic Value Arc */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke={details.color}
            strokeWidth="11"
            strokeDasharray={arcLength}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.4s ease',
              filter: `drop-shadow(0 0 8px ${details.color}40)`,
            }}
          />
        </svg>

        {/* Center Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <IconComponent
            className="w-6 h-6 mb-1"
            style={{ color: details.color }}
          />
          <div className="flex items-baseline justify-center">
            <span className="text-3xl sm:text-4xl font-extrabold font-mono tracking-tight text-white">
              {safeScore}
            </span>
            <span className="text-xs font-mono text-slate-500 ml-0.5">/100</span>
          </div>
          <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase mt-0.5">
            Risk Score
          </span>
        </div>
      </div>

      {/* Text Label Badge - Always show text, never color alone */}
      <div className="mt-2 text-center">
        <div
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${details.badgeBg} ${details.badgeBorder} ${details.badgeText}`}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: details.color }} />
          <span>{details.label}</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1.5 max-w-[220px]">
          Score bracket: {level === 'CRITICAL' ? '70 - 100' : level === 'SUSPICIOUS' ? '40 - 69' : '0 - 39'}
        </p>
      </div>
    </div>
  );
}
