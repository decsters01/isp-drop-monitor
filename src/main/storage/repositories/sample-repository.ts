import { getDatabase, persistDatabase } from "../database";
import { ConnectivitySample, GatewayCheckMethod, InterfaceType } from "../../../shared/types";

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
}
