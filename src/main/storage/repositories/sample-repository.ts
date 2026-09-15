import { getDatabase, persistDatabase } from "../database";
import { ConnectivitySample, DailyMetricsSummary, GatewayCheckMethod, InterfaceType, OutageCategory, QualityDistribution } from "../../../shared/types";

export class SampleRepository {
  public static addSample(sample: ConnectivitySample): void {
    const db = getDatabase();
    db.run(
      `INSERT INTO connectivity_samples 
       (session_id, timestamp, gateway_ip, gateway_latency_ms, gateway_loss_pct, gateway_method, external_latency_ms, external_loss_pct, interface_type, interface_name)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        sample.sessionId,
        sample.timestamp,
        sample.gatewayIp,
        sample.gatewayLatencyMs,
        sample.gatewayLossPct,
        sample.gatewayMethod,
        sample.externalLatencyMs,
        sample.externalLossPct,
        sample.interfaceType,
        sample.interfaceName
      ]
    );
    // Persistência em lote para performance
    if (Math.random() < 0.2) {
      persistDatabase();
    }
  }

  public static getRecentSamples(limit: number = 50): ConnectivitySample[] {
    const db = getDatabase();
    const res = db.exec(
      `SELECT session_id, timestamp, gateway_ip, gateway_latency_ms, gateway_loss_pct, gateway_method, external_latency_ms, external_loss_pct, interface_type, interface_name
       FROM connectivity_samples 
       ORDER BY timestamp DESC 
       LIMIT ?`,
      [limit]
    );

    if (!res || res.length === 0 || !res[0].values) {
      return [];
    }

    return res[0].values.map((row) => ({
      sessionId: row[0] as string,
      timestamp: row[1] as number,
      gatewayIp: row[2] as string,
      gatewayLatencyMs: row[3] as number | null,
      gatewayLossPct: row[4] as number,
      gatewayMethod: row[5] as GatewayCheckMethod,
      externalLatencyMs: row[6] as number | null,
      externalLossPct: row[7] as number,
      interfaceType: row[8] as InterfaceType,
      interfaceName: row[9] as string
    })).reverse();
  }

  public static getAverageExternalLatency(periodStart: number, periodEnd: number): number {
    const db = getDatabase();
    const res = db.exec(
      `SELECT AVG(external_latency_ms) 
       FROM connectivity_samples 
       WHERE timestamp >= ? AND timestamp <= ? AND external_latency_ms IS NOT NULL AND external_loss_pct = 0`,
      [periodStart, periodEnd]
    );

    if (!res || res.length === 0 || !res[0].values || res[0].values[0][0] === null) {
      return 0;
    }
    return Math.round(Number(res[0].values[0][0]) * 10) / 10;
  }

  public static getDailySummaries(daysCount: number = 7): DailyMetricsSummary[] {
    const db = getDatabase();
    const result: DailyMetricsSummary[] = [];
    const now = new Date();

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0).getTime();
      const endOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999).getTime();

      const dayName = d.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit" });

      // Buscar sessões no dia
      const sessRes = db.exec(
        `SELECT boot_time, COALESCE(shutdown_time, last_heartbeat) 
         FROM operational_sessions 
         WHERE boot_time <= ? AND COALESCE(shutdown_time, last_heartbeat) >= ?`,
        [endOfDay, startOfDay]
      );

      let totalUptimeMs = 0;
      if (sessRes && sessRes.length > 0 && sessRes[0].values) {
        for (const row of sessRes[0].values) {
          const b = Math.max(row[0] as number, startOfDay);
          const e = Math.min(row[1] as number, endOfDay);
          if (e > b) totalUptimeMs += (e - b);
        }
      }

      // Buscar quedas no dia
      const outRes = db.exec(
        `SELECT SUM(duration_seconds), COUNT(id) 
         FROM outage_events 
         WHERE category = ? AND start_time >= ? AND start_time <= ?`,
        [OutageCategory.ISP_EXTERNAL_FAILURE, startOfDay, endOfDay]
      );

      let downtimeSec = 0;
      let count = 0;
      if (outRes && outRes.length > 0 && outRes[0].values && outRes[0].values[0]) {
        downtimeSec = (outRes[0].values[0][0] as number) || 0;
        count = (outRes[0].values[0][1] as number) || 0;
      }

      const uptimeSec = Math.floor(totalUptimeMs / 1000);
      const netSec = Math.max(0, uptimeSec - downtimeSec);
      const availabilityPct = uptimeSec > 0 ? Math.min(100, Math.round((netSec / uptimeSec) * 10000) / 100) : 100;

      result.push({
        dateLabel: dayName,
        uptimeHours: Math.round((uptimeSec / 3600) * 10) / 10,
        downtimeMinutes: Math.round(downtimeSec / 60),
        outagesCount: count,
        availabilityPct
      });
    }

    return result;
  }

  public static getQualityDistribution(periodStart: number, periodEnd: number): QualityDistribution {
    const db = getDatabase();
    const res = db.exec(
      `SELECT external_latency_ms, external_loss_pct 
       FROM connectivity_samples 
       WHERE timestamp >= ? AND timestamp <= ?`,
      [periodStart, periodEnd]
    );

    if (!res || res.length === 0 || !res[0].values || res[0].values.length === 0) {
      return { optimalPct: 100, normalPct: 0, unstablePct: 0, outagePct: 0 };
    }

    let optimal = 0;
    let normal = 0;
    let unstable = 0;
    let outage = 0;
    const total = res[0].values.length;

    for (const row of res[0].values) {
      const lat = row[0] as number | null;
      const loss = row[1] as number;

      if (loss >= 100 || lat === null) {
        outage++;
      } else if (loss > 0 || lat > 50) {
        unstable++;
      } else if (lat > 25) {
        normal++;
      } else {
        optimal++;
      }
    }

    return {
      optimalPct: Math.round((optimal / total) * 100),
      normalPct: Math.round((normal / total) * 100),
      unstablePct: Math.round((unstable / total) * 100),
      outagePct: Math.round((outage / total) * 100)
    };
  }
}
