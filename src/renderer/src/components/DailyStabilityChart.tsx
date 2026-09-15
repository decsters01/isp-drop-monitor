import React from "react";
import { BarChart3, Calendar } from "lucide-react";
import { DailyMetricsSummary } from "@shared/types";

interface DailyStabilityChartProps {
  dailyData: DailyMetricsSummary[];
}

export const DailyStabilityChart: React.FC<DailyStabilityChartProps> = ({ dailyData }) => {
  const data = dailyData.length > 0 ? dailyData : [
    { dateLabel: "Seg", uptimeHours: 8, downtimeMinutes: 0, outagesCount: 0, availabilityPct: 100 },
    { dateLabel: "Ter", uptimeHours: 10, downtimeMinutes: 12, outagesCount: 2, availabilityPct: 98.0 },
    { dateLabel: "Qua", uptimeHours: 9, downtimeMinutes: 0, outagesCount: 0, availabilityPct: 100 },
    { dateLabel: "Qui", uptimeHours: 11, downtimeMinutes: 45, outagesCount: 4, availabilityPct: 93.2 },
    { dateLabel: "Sex", uptimeHours: 8, downtimeMinutes: 5, outagesCount: 1, availabilityPct: 99.0 },
    { dateLabel: "Sáb", uptimeHours: 14, downtimeMinutes: 0, outagesCount: 0, availabilityPct: 100 },
    { dateLabel: "Dom", uptimeHours: 12, downtimeMinutes: 2, outagesCount: 1, availabilityPct: 99.7 }
  ];

  const maxHours = Math.max(...data.map((d) => d.uptimeHours), 12);

  return (
    <div className="p-5 bg-dark-800 border border-dark-700 rounded-xl shadow-lg shadow-black/30 transition-all hover:border-dark-600">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-brand-cyan" />
          <h2 className="text-sm font-bold text-white tracking-wide uppercase">
            Estabilidade Diária (Últimos 7 Dias)
          </h2>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span>Consolidado por dia</span>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 pt-2">
        {data.map((day, idx) => {
          const heightPct = Math.min(100, Math.max(15, (day.uptimeHours / maxHours) * 100));
          const hasOutages = day.outagesCount > 0;
          const isSeverelyDegraded = day.availabilityPct < 99.0;

          return (
            <div key={idx} className="flex flex-col items-center group cursor-pointer">
              {/* Tooltip no hover */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 mb-1 px-2 py-1 bg-dark-900 border border-dark-700 rounded text-[10px] text-white text-center shadow-lg pointer-events-none z-10 whitespace-nowrap">
                <p className="font-bold">{day.dateLabel}</p>
                <p className="text-brand-blue">{day.uptimeHours}h PC ligado</p>
                <p className={hasOutages ? "text-rose-400" : "text-emerald-400"}>
                  {hasOutages ? `${day.downtimeMinutes}m off (${day.outagesCount}x)` : "0 quedas"}
                </p>
                <p className="text-slate-400">{day.availabilityPct}% disp.</p>
              </div>

              {/* Barra */}
              <div className="w-full h-28 bg-dark-850 rounded-lg p-1 flex items-end justify-center border border-dark-700 group-hover:border-brand-blue/50 transition-colors">
                <div
                  style={{ height: `${heightPct}%` }}
                  className={`w-full rounded-md transition-all duration-300 relative overflow-hidden ${
                    isSeverelyDegraded
                      ? "bg-gradient-to-t from-rose-900 to-rose-600 shadow-sm shadow-rose-600/30"
                      : hasOutages
                      ? "bg-gradient-to-t from-amber-800 to-amber-500"
                      : "bg-gradient-to-t from-navy-800 to-brand-blue shadow-sm shadow-brand-blue/30"
                  }`}
                >
                  {day.downtimeMinutes > 0 && (
                    <div
                      style={{ height: `${Math.min(40, day.downtimeMinutes * 2)}%` }}
                      className="absolute top-0 inset-x-0 bg-rose-500/80 animate-pulse"
                    />
                  )}
                </div>
              </div>

              {/* Rótulo do Dia */}
              <span className="text-[10px] font-medium text-slate-400 mt-2 group-hover:text-white transition-colors truncate max-w-full">
                {day.dateLabel}
              </span>
              <span
                className={`text-[9px] font-bold ${
                  day.availabilityPct >= 99.0 ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {day.availabilityPct}%
              </span>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-center gap-6 mt-4 pt-3 border-t border-dark-700/60 text-[10px] text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded bg-brand-blue"></span>
          <span>Conexão Normal (&gt;=99%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded bg-amber-500"></span>
          <span>Oscilações Leves</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded bg-rose-600"></span>
          <span>Quedas do Provedor (&lt;99%)</span>
        </div>
      </div>
    </div>
  );
};
