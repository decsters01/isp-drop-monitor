import { getDatabase, persistDatabase } from "../database";
import { OperationalSession, SessionShutdownReason } from "../../../shared/types";

export class SessionRepository {
  public static createSession(session: OperationalSession): void {
    const db = getDatabase();
    db.run(
      `INSERT INTO operational_sessions (id, boot_time, shutdown_time, last_heartbeat, shutdown_reason, os_version)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        session.id,
        session.bootTime,
        session.shutdownTime,
        session.lastHeartbeat,
        session.shutdownReason,
        session.osVersion
      ]
    );
    persistDatabase();
  }

  public static updateHeartbeat(sessionId: string, timestamp: number): void {
    const db = getDatabase();
    db.run(
      `UPDATE operational_sessions SET last_heartbeat = ? WHERE id = ?`,
      [timestamp, sessionId]
    );
    persistDatabase();
  }

  public static closeSession(sessionId: string, shutdownTime: number, reason: SessionShutdownReason): void {
    const db = getDatabase();
    db.run(
      `UPDATE operational_sessions SET shutdown_time = ?, shutdown_reason = ? WHERE id = ?`,
      [shutdownTime, reason, sessionId]
    );
    persistDatabase();
  }

  public static getLastSession(): OperationalSession | null {
    const db = getDatabase();
    const res = db.exec(`SELECT * FROM operational_sessions ORDER BY boot_time DESC LIMIT 1`);
    if (!res || res.length === 0 || !res[0].values || res[0].values.length === 0) {
      return null;
    }
    const row = res[0].values[0];
    return {
      id: row[0] as string,
      bootTime: row[1] as number,
      shutdownTime: row[2] as number | null,
      lastHeartbeat: row[3] as number,
      shutdownReason: row[4] as SessionShutdownReason,
      osVersion: row[5] as string
    };
  }

  public static getTotalUptimeSeconds(periodStart: number, periodEnd: number): number {
    const db = getDatabase();
    const res = db.exec(
      `SELECT boot_time, COALESCE(shutdown_time, last_heartbeat) as end_t 
       FROM operational_sessions 
       WHERE boot_time <= ? AND COALESCE(shutdown_time, last_heartbeat) >= ?`,
      [periodEnd, periodStart]
    );

    if (!res || res.length === 0 || !res[0].values) {
      return 0;
    }

    let totalMs = 0;
    for (const row of res[0].values) {
      const b = Math.max(row[0] as number, periodStart);
      const e = Math.min(row[1] as number, periodEnd);
      if (e > b) {
        totalMs += (e - b);
      }
    }
    return Math.floor(totalMs / 1000);
  }
}
