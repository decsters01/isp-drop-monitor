import crypto from "node:crypto";
import { OutageEvent } from "../../shared/types";

export interface ReportCanonicalPayload {
  reportId: string;
  createdAt: number;
  periodStart: number;
  periodEnd: number;
  customerName?: string;
  ispName?: string;
  contractNumber?: string;
  totalUptimeSec: number;
  totalDowntimeSec: number;
  availabilityPct: number;
  events: {
    id: string;
    startTime: number;
    endTime: number | null;
    durationSeconds: number;
    category: string;
  }[];
}

export class IntegritySigner {
  /**
   * Gera um UUID v4 para o laudo
   */
  public static generateReportId(): string {
    return crypto.randomUUID();
  }

  /**
   * Calcula o Hash SHA-256 determinístico sobre a estrutura de dados canônica do laudo
   */
  public static calculateHash(payload: ReportCanonicalPayload): string {
    const serialized = JSON.stringify(payload, Object.keys(payload).sort());
    return crypto.createHash("sha256").update(serialized, "utf-8").digest("hex");
  }

  /**
   * Converte a lista de eventos no formato canônico para cálculo
   */
  public static buildCanonicalPayload(
    reportId: string,
    createdAt: number,
    periodStart: number,
    periodEnd: number,
    totalUptimeSec: number,
    totalDowntimeSec: number,
    availabilityPct: number,
    events: OutageEvent[],
    customerName?: string,
    ispName?: string,
    contractNumber?: string
  ): ReportCanonicalPayload {
    return {
      reportId,
      createdAt,
      periodStart,
      periodEnd,
      customerName,
      ispName,
      contractNumber,
      totalUptimeSec,
      totalDowntimeSec,
      availabilityPct,
      events: events.map((e) => ({
        id: e.id,
        startTime: e.startTime,
        endTime: e.endTime,
        durationSeconds: e.durationSeconds,
        category: e.category
      }))
    };
  }
}
