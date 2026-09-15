import React from "react";
import { PieChart, ShieldCheck, Zap, AlertTriangle, XCircle } from "lucide-react";
import { QualityDistribution as QualityDistType } from "@shared/types";

interface QualityDistributionProps {
  distribution: QualityDistType | null;
}

export const QualityDistribution: React.FC<QualityDistributionProps> = ({ distribution }) => {
  const dist = distribution || {
    optimalPct: 85,
    normalPct: 10,
    unstablePct: 4,
    outagePct: 1
  };

  const categories = [
    {
      label: "Ótima (< 25ms)",
      pct: dist.optimalPct,
      color: "bg-emerald-500",
      textColor: "text-emerald-400",
      icon: ShieldCheck
    },
    {
      label: "Normal (25-50ms)",
      pct: dist.normalPct,
      color: "bg-brand-blue",
      textColor: "text-brand-cyan",
      icon: Zap
    },
    {
      label: "Instável (> 50ms)",
      pct: dist.unstablePct,
      color: "bg-amber-500",
      textColor: "text-amber-400",
      icon: AlertTriangle
    },
    {
      label: "Queda Total (100% perda)",
      pct: dist.outagePct,
      color: "bg-rose-500",
      textColor: "text-rose-400",
      icon: XCircle
    }
  ];

  return (
    <div className="p-5 bg-dark-800 border border-dark-700 rounded-xl shadow-lg shadow-black/30 transition-all hover:border-dark-600 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <PieChart className="w-4 h-4 text-brand-blue" />
            <h2 className="text-sm font-bold text-white tracking-wide uppercase">
              Qualidade da Conexão
            </h2>
          </div>
          <span className="text-xs text-slate-400">Amostragem agregada</span>
        </div>

        {/* Barra de Distribuição Segmentada */}
        <div className="w-full h-3 rounded-full bg-dark-850 flex overflow-hidden border border-dark-700 mb-4 p-0.5">
          {dist.optimalPct > 0 && (
            <div style={{ width: `${dist.optimalPct}%` }} className="bg-emerald-500 rounded-l-full h-full" title={`Ótima: ${dist.optimalPct}%`} />
          )}
          {dist.normalPct > 0 && (
            <div style={{ width: `${dist.normalPct}%` }} className="bg-brand-blue h-full" title={`Normal: ${dist.normalPct}%`} />
          )}
          {dist.unstablePct > 0 && (
            <div style={{ width: `${dist.unstablePct}%` }} className="bg-amber-500 h-full" title={`Instável: ${dist.unstablePct}%`} />
          )}
          {dist.outagePct > 0 && (
            <div style={{ width: `${dist.outagePct}%` }} className="bg-rose-500 rounded-r-full h-full" title={`Queda: ${dist.outagePct}%`} />
          )}
        </div>

        {/* Lista de Categorias */}
        <div className="grid grid-cols-2 gap-3">
          {categories.map((cat, i) => {
            const IconComp = cat.icon;
            return (
              <div
                key={i}
                className="p-2.5 rounded-lg bg-dark-850/80 border border-dark-700/80 hover:border-dark-600 transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <IconComp className={`w-3.5 h-3.5 ${cat.textColor}`} />
                    <span className="text-[11px] font-medium text-slate-300 truncate max-w-[100px]">
                      {cat.label}
                    </span>
                  </div>
                  <span className={`text-xs font-bold ${cat.textColor}`}>
                    {cat.pct}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-dark-700/60 text-[10px] text-slate-400 flex items-center justify-between">
        <span>Critério: Latência ponderada e perda</span>
        <span className="text-emerald-400 font-semibold">
          {dist.optimalPct + dist.normalPct}% estável
        </span>
      </div>
    </div>
  );
};
