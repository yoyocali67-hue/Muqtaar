import React from 'react';

interface PositionDot {
  role: string;
  x: number; // percentage 0 - 100
  y: number; // percentage 0 - 100
}

interface TacticalPitchProps {
  positions: PositionDot[];
  accentColor?: string;
  className?: string;
}

export function TacticalPitch({ positions, accentColor = '#38bdf8', className = '' }: TacticalPitchProps) {
  const getRoleColor = (role: string) => {
    if (role === 'GK') return 'bg-amber-500/90 text-black border-amber-300';
    if (['CB', 'LB', 'RB', 'LWB', 'RWB'].includes(role)) return 'bg-blue-600 text-white border-blue-400';
    if (['DMF', 'CMF', 'AMF', 'LMF', 'RMF'].includes(role)) return 'bg-purple-600 text-white border-purple-400';
    return 'bg-emerald-500 text-black font-bold border-emerald-300';
  };

  return (
    <div className={`relative w-full aspect-[4/5] max-w-[340px] mx-auto rounded-xl overflow-hidden border border-zinc-800 bg-[#07130e] p-2 shadow-inner select-none ${className}`}>
      {/* Pitch grass subtle stripes */}
      <div className="absolute inset-0 opacity-20 pointer-events-none flex flex-col">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className={`flex-1 ${i % 2 === 0 ? 'bg-emerald-900/30' : 'bg-emerald-950/20'}`}
          />
        ))}
      </div>

      {/* Soccer Pitch Markings SVG */}
      <svg
        viewBox="0 0 100 120"
        className="w-full h-full stroke-emerald-500/30 fill-none"
        strokeWidth="0.8"
      >
        {/* Outer touchline */}
        <rect x="5" y="5" width="90" height="110" rx="3" />
        
        {/* Halfway line */}
        <line x1="5" y1="60" x2="95" y2="60" />
        
        {/* Center circle */}
        <circle cx="50" cy="60" r="14" />
        <circle cx="50" cy="60" r="1" fill="currentColor" />

        {/* Top Penalty Box (Opponent) */}
        <rect x="22" y="5" width="56" height="20" />
        <rect x="36" y="5" width="28" height="7" />
        <circle cx="50" cy="18" r="0.9" fill="currentColor" />
        <path d="M 38 25 A 12 12 0 0 0 62 25" />

        {/* Bottom Penalty Box (Our Side) */}
        <rect x="22" y="95" width="56" height="20" />
        <rect x="36" y="108" width="28" height="7" />
        <circle cx="50" cy="102" r="0.9" fill="currentColor" />
        <path d="M 38 95 A 12 12 0 0 1 62 95" />

        {/* Corner Arcs */}
        <path d="M 5 9 A 4 4 0 0 0 9 5" />
        <path d="M 95 9 A 4 4 0 0 1 91 5" />
        <path d="M 5 111 A 4 4 0 0 1 9 115" />
        <path d="M 95 111 A 4 4 0 0 0 91 115" />
      </svg>

      {/* Player Dots */}
      <div className="absolute inset-0 p-3 pointer-events-none">
        {positions.map((pos, index) => {
          const badgeClass = getRoleColor(pos.role);
          return (
            <div
              key={`${pos.role}-${index}`}
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
              className="absolute flex flex-col items-center justify-center transition-all duration-300 pointer-events-auto group cursor-default"
            >
              <div
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-semibold shadow-md border ${badgeClass} transition-transform group-hover:scale-110`}
              >
                {pos.role}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
