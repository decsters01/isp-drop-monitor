import React, { useEffect, useState, useCallback } from "react";
import { StatusHeader } from "./components/StatusHeader";
import { MetricCards } from "./components/MetricCards";
import { LatencyChart, LatencyDataPoint } from "./components/LatencyChart";
import { DailyStabilityChart } from "./components/DailyStabilityChart";
import { QualityDistribution } from "./components/QualityDistribution";
import { OutagesTable } from "./components/OutagesTable";
import { ReportModal } from "./components/ReportModal";
import { LiveNetworkStatus, OutageEvent, MetricsSummary, DailyMetricsSummary, QualityDistribution as QualityDistType } from "@shared/types";

export const App: React.FC = () => {
  const [networkStatus, setNetworkStatus] = useState<LiveNetworkStatus | null>(null);
  const [outages, setOutages] = useState<OutageEvent[]>([]);
  const [metrics, setMetrics] = useState<MetricsSummary | null>(null);
  const [dailyMetrics, setDailyMetrics] = useState<DailyMetricsSummary[]>([]);
  const [qualityDistribution, setQualityDistribution] = useState<QualityDistType | null>(null);
  const [latencyHistory, setLatencyHistory] = useState<LatencyDataPoint[]>([]);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Carregar dados analíticos e histórico
  const fetchHistory = useCallback(async () => {
    try {
      if (window.electronAPI) {
        const now = Date.now();
        const start = now - 7 * 24 * 60 * 60 * 1000; // últimos 7 dias

        const [historyRes, analyticsRes] = await Promise.all([
          window.electronAPI.getOutagesHistory({
            startDate: start,
            endDate: now,
            categoryFilter: "ALL"
          }),
          window.electronAPI.getAnalyticsData({ daysCount: 7 })
        ]);

        setOutages(historyRes.events);
        setMetrics(historyRes.metrics);
        setDailyMetrics(analyticsRes.daily);
        setQualityDistribution(analyticsRes.distribution);
      }
    } catch (err) {
      console.error("Erro ao carregar histórico:", err);
    }
  }, []);

  useEffect(() => {
    if (!window.electronAPI) {
      return;
    }

    // 1. Status inicial
    window.electronAPI.getNetworkStatus().then((status) => {
      setNetworkStatus(status);
      if (status) {
        const timeStr = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
        setLatencyHistory([
          {
            time: timeStr,
            gatewayMs: status.currentGatewayLatencyMs ?? 1,
            externalMs: status.currentExternalLatencyMs ?? 15
          }
        ]);
      }
    });

    // 2. Ouvir atualizações periódicas de status via IPC
    const unsubscribe = window.electronAPI.onStatusUpdated((status) => {
      setNetworkStatus(status);
      const timeStr = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      setLatencyHistory((prev) => {
        const next = [
          ...prev.slice(-25), // Manter últimas 25 amostras para o gráfico
          {
            time: timeStr,
            gatewayMs: status.currentGatewayLatencyMs ?? 1,
            externalMs: status.currentExternalLatencyMs ?? 0
          }
        ];
        return next;
      });
    });

    // 3. Buscar histórico
    fetchHistory();
    const interval = setInterval(fetchHistory, 15000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [fetchHistory]);

  return (
    <div className="min-h-screen bg-dark-900 text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Cabeçalho de Status */}
      <StatusHeader
        status={networkStatus}
        onOpenReportModal={() => setIsReportModalOpen(true)}
      />

      {/* Cards de Métricas Principais */}
      <MetricCards status={networkStatus} metrics={metrics} />

      {/* Seção de Múltiplos Gráficos Analíticos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DailyStabilityChart dailyData={dailyMetrics} />
        <QualityDistribution distribution={qualityDistribution} />
      </div>

      {/* Gráfico de Linha em Tempo Real de Dupla Camada */}
      <LatencyChart data={latencyHistory} />

      {/* Tabela Interativa de Quedas com Filtros */}
      <OutagesTable events={outages} />

      {/* Modal de Emissão de Laudo Pericial */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => {
          setIsReportModalOpen(false);
          fetchHistory();
        }}
      />
    </div>
  );
};
