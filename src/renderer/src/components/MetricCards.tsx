import React from "react";
import { Activity, Clock, AlertOctagon, CheckCircle2 } from "lucide-react";
import { LiveNetworkStatus, MetricsSummary, ConnectionStatus } from "@shared/types";

interface MetricCardsProps {
  status: LiveNetworkStatus | null;
  metrics: MetricsSummary | null;
}

export const MetricCards: React.FC<MetricCardsProps> = ({ status, metrics }) => {
  const availability = metrics?.availabilityPct ?? 100;
  const isOptimal = availability >= 99.0;
  const isOnline = status?.status === ConnectionStatus.ONLINE;

  const cards = [
    {
      title: "Status da Conexão",
      value: isOnline ? "Operacional" : "Interrupção",
      detail: isOnline
        ? `Gateway: ${status?.currentGatewayLatencyMs ?? 1}ms | Net: ${status?.currentExternalLatencyMs ?? 0}ms`
        : "Queda de conexão detectada",
      icon: isOnline ? CheckCircle2 : AlertOctagon,
      iconColor: isOnline ? "text-emerald-400" : "text-rose-500",
      bgGlow: isOnline ? "hover:border-emerald-500/40" : "hover:border-rose-500/40"
    },
    {
      title: "Disponibilidade Efetiva",
      value: `${availability.toFixed(2)}%`,
      detail: isOptimal ? "Em conformidade com a Anatel (>=99%)" : "Abaixo da meta regulatória Anatel",
      icon: Activity,
      iconColor: isOptimal ? "text-brand-blue" : "text-rose-400",
      bgGlow: isOptimal ? "hover:border-brand-blue/50" : "hover:border-rose-500/50"
    },
    {
      title: "Quedas do ISP Confirmadas",
      value: `${metrics?.totalOutagesCount ?? 0}`,
      detail: `${metrics?.totalDowntimeSeconds ?? 0} segundos fora do ar no período`,
      icon: AlertOctagon,
      iconColor: "text-amber-400",
      bgGlow: "hover:border-amber-500/40"
    },
    {
      title: "Uptime do Computador",
      value: `${metrics?.totalMonitoredHours ?? 0}h`,
      detail: `Latência média: ${metrics?.averageLatencyMs ?? 0}ms`,
      icon: Clock,
      iconColor: "text-brand-cyan",
      bgGlow: "hover:border-brand-cyan/40"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => {
        const IconComponent = card.icon;
        return (
          <div
            key={index}
            className={`p-4 bg-dark-800 border border-dark-700 rounded-xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl hover:shadow-black/50 ${card.bgGlow} group cursor-default`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                {card.title}
              </span>
              <div className="p-2 rounded-lg bg-dark-850 border border-dark-700 group-hover:border-dark-600 transition-colors">
                <IconComponent className={`w-4 h-4 ${card.iconColor}`} />
              </div>
            </div>
            <div className="text-2xl font-black tracking-tight text-white mb-1">
              {card.value}
            </div>
            <p className="text-xs text-slate-400 truncate">
              {card.detail}
            </p>
          </div>
        );
      })}
    </div>
  );
};
