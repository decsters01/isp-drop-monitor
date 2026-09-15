import { ipcMain } from "electron";
import { ReportIpcHandler } from "./report-ipc";
import { NetworkEngine } from "../monitor/network-engine";
import { OutageRepository } from "../storage/repositories/outage-repository";
import { SessionRepository } from "../storage/repositories/session-repository";
import { SampleRepository } from "../storage/repositories/sample-repository";
import { IPC_CHANNELS } from "../../shared/ipc-channels";

export function registerIpcHandlers(): void {
  // Status atual
  ipcMain.handle(IPC_CHANNELS.NETWORK_GET_STATUS, () => {
    return NetworkEngine.getLiveStatus();
  });

  // Histórico de quedas e métricas
  ipcMain.handle(
    IPC_CHANNELS.OUTAGES_GET_HISTORY,
    (_event, params: { startDate: number; endDate: number; categoryFilter: "ALL" | "ISP_ONLY" | "LOCAL_ONLY" }) => {
      const events = OutageRepository.getOutages(params.startDate, params.endDate, params.categoryFilter);
      const totalUptimeSec = SessionRepository.getTotalUptimeSeconds(params.startDate, params.endDate);
      const totalDowntimeSec = OutageRepository.getTotalIspDowntimeSeconds(params.startDate, params.endDate);

      const netUptime = Math.max(0, totalUptimeSec - totalDowntimeSec);
      const availabilityPct =
        totalUptimeSec > 0 ? Math.min(100, Math.round((netUptime / totalUptimeSec) * 10000) / 100) : 100;

      const avgLatency = SampleRepository.getAverageExternalLatency(params.startDate, params.endDate);

      return {
        events,
        metrics: {
          totalMonitoredHours: Math.round((totalUptimeSec / 3600) * 10) / 10,
          totalOutagesCount: events.length,
          totalDowntimeSeconds: totalDowntimeSec,
          availabilityPct,
          averageLatencyMs: avgLatency
        }
      };
    }
  );

  // Geração do Laudo Pericial em PDF
  ipcMain.handle(IPC_CHANNELS.REPORT_GENERATE_PDF, async (_event, params) => {
    return ReportIpcHandler.handleGenerate(params);
  });

  // Métricas analíticas para múltiplos gráficos
  ipcMain.handle(IPC_CHANNELS.ANALYTICS_GET_DATA, (_event, params?: { daysCount?: number }) => {
    const days = params?.daysCount || 7;
    const daily = SampleRepository.getDailySummaries(days);
    const now = Date.now();
    const start = now - days * 86400000;
    const distribution = SampleRepository.getQualityDistribution(start, now);
    return {
      daily,
      distribution
    };
  });
}
