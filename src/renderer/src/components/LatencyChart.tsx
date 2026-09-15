import React, { useMemo } from "react";
import { Activity, Server, Globe } from "lucide-react";

export interface LatencyDataPoint {
  time: string;
  gatewayMs: number;
  externalMs: number;
}

interface LatencyChartProps {
  data: LatencyDataPoint[];
}

export const LatencyChart: React.FC<LatencyChartProps> = ({ data }) => {
  const points = data.length > 0 ? data : [
    { time: "00:00", gatewayMs: 1, externalMs: 15 },
    { time: "00:05", gatewayMs: 2, externalMs: 16 }
  ];

  // Cálculo de escala SVG
  const maxVal = useMemo(() => {
    const max = Math.max(...points.map((p) => Math.max(p.gatewayMs, p.externalMs)), 30);
    return Math.ceil(max / 10) * 10;
  }, [points]);

  const width = 800;
  const height = 180;
  const padding = 30;

  const getCoordinates = (val: number, index: number, total: number) => {
    const x = padding + (index / (total - 1 || 1)) * (width - padding * 2);
    const y = height - padding - (val / maxVal) * (height - padding * 2);
    return { x, y };
  };

  const gatewayPoints = points.map((p, i) => getCoordinates(p.gatewayMs, i, points.length));
  const externalPoints = points.map((p, i) => getCoordinates(p.externalMs, i, points.length));

  const toPathString = (coords: { x: number; y: number }[]) => {
    if (coords.length === 0) return "";
    return coords.reduce((acc, curr, idx) => `${acc} ${idx === 0 ? "M" : "L"} ${curr.x} ${curr.y}`, "");
  };

  const gatewayPath = toPathString(gatewayPoints);
  const externalPath = toPathString(externalPoints);

  const lastPoint = points[points.length - 1];

  return (
    <div className="p-5 bg-dark-800 border border-dark-700 rounded-xl shadow-lg shadow-black/30 transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-brand-blue" />
          <h2 className="text-sm font-bold text-white tracking-wide uppercase">
            Oscilação de Latência em Tempo Real (Dupla Camada)
          </h2>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <Server className="w-3 h-3 text-emerald-400" />
            <span className="text-slate-300">Gateway Local:</span>
            <span className="font-semibold text-white">{lastPoint?.gatewayMs ?? 0} ms</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-blue"></span>
            <Globe className="w-3 h-3 text-brand-blue" />
            <span className="text-slate-300">Internet (ISP):</span>
            <span className="font-semibold text-white">{lastPoint?.externalMs ?? 0} ms</span>
          </div>
        </div>
      </div>

      <div className="relative w-full overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-44 select-none">
          {/* Linhas de Grade Horizontal */}
          {[0, 0.5, 1].map((ratio, idx) => {
            const y = height - padding - ratio * (height - padding * 2);
            const val = Math.round(ratio * maxVal);
            return (
              <g key={idx}>
                <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#1E293B" strokeDasharray="3 3" />
                <text x={padding - 6} y={y + 3} fill="#64748B" fontSize="9" textAnchor="end">
                  {val}ms
                </text>
              </g>
            );
          })}

          {/* Linha do Gateway Local */}
          <path d={gatewayPath} fill="none" stroke="#34D399" strokeWidth="2" strokeLinecap="round" opacity="0.85" />

          {/* Linha da Internet Externa */}
          <path d={externalPath} fill="none" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" />

          {/* Destaque do Último Ponto */}
          {externalPoints.length > 0 && (
            <circle
              cx={externalPoints[externalPoints.length - 1].x}
              cy={externalPoints[externalPoints.length - 1].y}
              r="4"
              fill="#60A5FA"
              stroke="#0F172A"
              strokeWidth="2"
            />
          )}
        </svg>
      </div>
      <div className="flex justify-between text-[10px] text-slate-500 px-4 mt-1">
        <span>Histórico recente</span>
        <span>Ao vivo (3s amostragem)</span>
      </div>
    </div>
  );
};
