import { getDatabase, persistDatabase } from "../database";
import { AuditReportData } from "../../../shared/types";

export class ReportRepository {
  public static saveReport(report: AuditReportData): void {
    const db = getDatabase();
    db.run(
      `INSERT INTO audit_reports 
       (id, created_at, period_start, period_end, customer_name, isp_name, contract_number, incident_protocol, total_uptime_sec, total_downtime_sec, availability_pct, outages_count, sha256_hash, pdf_path)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        report.id,
        report.createdAt,
        report.periodStart,
        report.periodEnd,
        report.customerName || null,
        report.ispName || null,
        report.contractNumber || null,
        report.incidentProtocol || null,
        report.totalUptimeSec,
        report.totalDowntimeSec,
        report.availabilityPct,
        report.outagesCount,
        report.sha256Hash,
        report.pdfPath
      ]
    );
    persistDatabase();
  }

  public static getReports(): AuditReportData[] {
    const db = getDatabase();
    const res = db.exec(`SELECT * FROM audit_reports ORDER BY created_at DESC`);
    if (!res || res.length === 0 || !res[0].values) {
      return [];
    }

    return res[0].values.map((row) => ({
      id: row[0] as string,
      createdAt: row[1] as number,
      periodStart: row[2] as number,
      periodEnd: row[3] as number,
      customerName: (row[4] as string) || undefined,
      ispName: (row[5] as string) || undefined,
      contractNumber: (row[6] as string) || undefined,
      incidentProtocol: (row[7] as string) || undefined,
      totalUptimeSec: row[8] as number,
      totalDowntimeSec: row[9] as number,
      availabilityPct: row[10] as number,
      outagesCount: row[11] as number,
      sha256Hash: row[12] as string,
      pdfPath: row[13] as string
    }));
  }
}
