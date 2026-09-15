import { getDatabase, persistDatabase } from "../database";
import { OutageCategory, OutageEvent, OutageEventType } from "../../../shared/types";

export class OutageRepository {
  public static createOutage(outage: OutageEvent): void {
    const db = getDatabase();
    db.run(
      `INSERT INTO outage_events 
       (id, session_id, start_time, end_time, duration_seconds, category, event_type, packet_loss_avg, gateway_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        outage.id,
        outage.sessionId,
        outage.startTime,
        outage.endTime,
        outage.durationSeconds,
        outage.category,
        outage.eventType,
        outage.packetLossAvg,
        outage.gatewayStatus
      ]
    );
    persistDatabase();
  }

  public static closeOutage(id: string, endTime: number, durationSeconds: number, packetLossAvg: number): void {
    const db = getDatabase();
    db.run(
      `UPDATE outage_events 
       SET end_time = ?, duration_seconds = ?, packet_loss_avg = ?
       WHERE id = ?`,
      [endTime, durationSeconds, packetLossAvg, id]
    );
    persistDatabase();
  }

  public static getOutages(startDate: number, endDate: number, categoryFilter: "ALL" | "ISP_ONLY" | "LOCAL_ONLY"): OutageEvent[] {
    const db = getDatabase();
    let query = `SELECT id, session_id, start_time, end_time, duration_seconds, category, event_type, packet_loss_avg, gateway_status
                 FROM outage_events 
                 WHERE start_time >= ? AND start_time <= ?`;
    const params: (number | string)[] = [startDate, endDate];

    if (categoryFilter === "ISP_ONLY") {
      query += ` AND category = '${OutageCategory.ISP_EXTERNAL_FAILURE}'`;
    } else if (categoryFilter === "LOCAL_ONLY") {
      query += ` AND category = '${OutageCategory.LOCAL_ROUTER_FAILURE}'`;
    }

    query += ` ORDER BY start_time DESC`;
    const res = db.exec(query, params);

    if (!res || res.length === 0 || !res[0].values) {
      return [];
    }

    return res[0].values.map((row) => ({
      id: row[0] as string,
      sessionId: row[1] as string,
      startTime: row[2] as number,
      endTime: row[3] as number | null,
      durationSeconds: (row[4] as number) || 0,
      category: row[5] as OutageCategory,
      eventType: row[6] as OutageEventType,
      packetLossAvg: (row[7] as number) || 100,
      gatewayStatus: row[8] as "REACHABLE" | "UNREACHABLE"
    }));
  }

  public static getTotalIspDowntimeSeconds(periodStart: number, periodEnd: number): number {
    const db = getDatabase();
    const res = db.exec(
      `SELECT SUM(duration_seconds) 
       FROM outage_events 
       WHERE category = ? AND start_time >= ? AND start_time <= ? AND duration_seconds IS NOT NULL`,
      [OutageCategory.ISP_EXTERNAL_FAILURE, periodStart, periodEnd]
    );

    if (!res || res.length === 0 || !res[0].values || res[0].values[0][0] === null) {
      return 0;
    }
    return Number(res[0].values[0][0]);
  }
}
