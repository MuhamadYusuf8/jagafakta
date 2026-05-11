"use client";

import { motion } from "framer-motion";

interface ProvincePoint {
  id: string;
  name: string;
  x: number;
  y: number;
  total: number;
  hoaks: number;
  fakta: number;
  konteks: number;
  recentTitles: string[];
}

interface IndonesiaMapProps {
  provinces: ProvincePoint[];
  selectedProvince: string | null;
  onProvinceSelect: (id: string | null) => void;
}

export default function IndonesiaMap({
  provinces,
  selectedProvince,
  onProvinceSelect,
}: IndonesiaMapProps) {
  const maxTotal = Math.max(...provinces.map((p) => p.total), 1);

  return (
    <div className="relative w-full aspect-[2/1] select-none">
      <svg
        viewBox="60 70 620 290"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background gradient */}
        <defs>
          <radialGradient id="bgGrad" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#020617" />
          </radialGradient>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glowStrong" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Indonesia outline (simplified) */}
        <IndonesiaOutline />

        {/* Province dots */}
        {provinces.map((province) => {
          const intensity = province.total / maxTotal;
          const radius = Math.max(3, Math.min(12, 3 + intensity * 9));
          const isSelected = selectedProvince === province.id;
          const hasData = province.total > 0;

          // Color based on dominant verdict
          let dotColor = "#3B82F6"; // default blue (no data)
          let dotGlow = "rgba(59, 130, 246, 0.3)";
          if (hasData) {
            if (province.hoaks > province.fakta) {
              dotColor = "#EF4444"; // red for hoaks dominant
              dotGlow = "rgba(239, 68, 68, 0.4)";
            } else if (province.fakta > province.hoaks) {
              dotColor = "#22C55E"; // green for fakta dominant
              dotGlow = "rgba(34, 197, 94, 0.4)";
            } else {
              dotColor = "#F59E0B"; // amber for mixed
              dotGlow = "rgba(245, 158, 11, 0.4)";
            }
          }

          return (
            <g
              key={province.id}
              className="cursor-pointer"
              onClick={() => onProvinceSelect(isSelected ? null : province.id)}
            >
              {/* Pulse ring for provinces with data */}
              {hasData && (
                <circle
                  cx={province.x}
                  cy={province.y}
                  r={radius + 4}
                  fill="none"
                  stroke={dotColor}
                  strokeWidth={0.5}
                  opacity={0.4}
                >
                  <animate
                    attributeName="r"
                    from={String(radius)}
                    to={String(radius + 10)}
                    dur="2s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    from="0.6"
                    to="0"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                </circle>
              )}

              {/* Glow effect */}
              {hasData && (
                <circle
                  cx={province.x}
                  cy={province.y}
                  r={radius + 2}
                  fill={dotGlow}
                  filter="url(#glow)"
                />
              )}

              {/* Main dot */}
              <circle
                cx={province.x}
                cy={province.y}
                r={isSelected ? radius + 2 : radius}
                fill={dotColor}
                stroke={isSelected ? "#fff" : "rgba(255,255,255,0.2)"}
                strokeWidth={isSelected ? 1.5 : 0.5}
                opacity={hasData ? 0.9 : 0.3}
                className="transition-all duration-300"
              />

              {/* Count label for provinces with data */}
              {hasData && radius > 5 && (
                <text
                  x={province.x}
                  y={province.y + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#fff"
                  fontSize={radius > 8 ? 6 : 5}
                  fontWeight="bold"
                  className="pointer-events-none"
                >
                  {province.total}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Selected province tooltip */}
      {selectedProvince && (() => {
        const prov = provinces.find((p) => p.id === selectedProvince);
        if (!prov) return null;

        // Position tooltip
        const tooltipLeft = `${((prov.x - 60) / 620) * 100}%`;
        const tooltipTop = `${((prov.y - 70) / 290) * 100}%`;

        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute pointer-events-none z-10"
            style={{
              left: tooltipLeft,
              top: tooltipTop,
              transform: "translate(-50%, -120%)",
            }}
          >
            <div className="bg-surface-2/95 backdrop-blur-xl border border-white/10 rounded-xl p-3 
                            shadow-2xl min-w-[180px] max-w-[220px] pointer-events-auto">
              <p className="font-jakarta font-bold text-sm text-text-primary mb-2">
                {prov.name}
              </p>
              <div className="grid grid-cols-3 gap-2 text-center mb-2">
                <div>
                  <p className="text-xs font-bold text-hoaks">{prov.hoaks}</p>
                  <p className="text-[9px] text-text-muted">Hoaks</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-fakta">{prov.fakta}</p>
                  <p className="text-[9px] text-text-muted">Fakta</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-konteks">{prov.konteks}</p>
                  <p className="text-[9px] text-text-muted">Lainnya</p>
                </div>
              </div>
              {prov.recentTitles.length > 0 && (
                <div className="border-t border-white/[0.06] pt-2 space-y-1">
                  <p className="text-[9px] text-text-muted font-medium">Terbaru:</p>
                  {prov.recentTitles.slice(0, 2).map((title, i) => (
                    <p key={i} className="text-[10px] text-text-muted/80 truncate">
                      • {title}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        );
      })()}
    </div>
  );
}

/** Simplified Indonesia archipelago outline for visual context */
function IndonesiaOutline() {
  return (
    <g opacity={0.12} fill="none" stroke="#64748b" strokeWidth={0.8}>
      {/* Sumatera */}
      <path d="M100,90 L140,100 L155,130 L160,160 L150,200 L155,230 L170,265 L155,275 L130,250 L120,220 L110,180 L105,150 L95,120 Z" />
      {/* Jawa */}
      <path d="M195,270 L220,265 L260,275 L300,275 L330,280 L355,290 L340,300 L300,295 L260,295 L220,290 L200,285 Z" />
      {/* Kalimantan */}
      <path d="M220,130 L260,120 L310,125 L340,145 L335,175 L320,210 L300,240 L275,230 L250,210 L230,180 L225,150 Z" />
      {/* Sulawesi */}
      <path d="M370,130 L395,135 L420,140 L430,160 L410,175 L400,200 L385,220 L395,240 L410,245 L400,255 L380,240 L375,215 L385,195 L395,170 L385,155 L370,145 Z" />
      {/* Bali + NTT */}
      <path d="M350,295 L365,290 L380,298 L410,305 L445,315 L460,325 L440,330 L410,320 L380,310 L355,305 Z" />
      {/* Maluku */}
      <ellipse cx="485" cy="185" rx="25" ry="35" />
      {/* Papua */}
      <path d="M530,150 L570,145 L620,160 L650,180 L640,210 L610,220 L570,210 L540,195 Z" />
    </g>
  );
}
