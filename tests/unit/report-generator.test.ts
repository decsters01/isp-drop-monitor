import fs from "node:fs";
import path from "node:path";
import { describe, it, expect } from "vitest";
import { IntegritySigner } from "../../src/main/report/integrity-signer";
import { PdfReportGenerator } from "../../src/main/report/pdf-generator";
import { OutageCategory, OutageEventType } from "../../src/shared/types";

describe("PdfReportGenerator & IntegritySigner", () => {
  it("deve calcular o hash SHA-256 de forma determinística", () => {
    const payload = {
      reportId: "test-uuid-1234",
      createdAt: 1700000000000,
      periodStart: 1700000000000,
      periodEnd: 1700086400000,
      totalUptimeSec: 86400,
      totalDowntimeSec: 300,
      availabilityPct: 99.65,
      events: [
        {
          id: "ev1",
          startTime: 1700010000000,
          endTime: 1700010300000,
          durationSeconds: 300,
          category: OutageCategory.ISP_EXTERNAL_FAILURE
        }
      ]
    };

    const hash1 = IntegritySigner.calculateHash(payload);
    const hash2 = IntegritySigner.calculateHash(payload);
    expect(hash1).toBe(hash2);
    expect(hash1).toMatch(/^[a-f0-9]{64}$/);
  });

  it("deve gerar um arquivo PDF válido em disco com integridade", async () => {
    const tempPdf = path.join(__dirname, "temp-test-report.pdf");

    const result = await PdfReportGenerator.generate({
      outputPath: tempPdf,
      customerName: "Consumidor Teste",
      ispName: "Fibra Telecom",
      contractNumber: "CTR-998877",
      periodStart: Date.now() - 86400000,
      periodEnd: Date.now(),
      totalUptimeSec: 86400,
      totalDowntimeSec: 120,
      events: [
        {
          id: "test-outage-1",
          sessionId: "sess-1",
          startTime: Date.now() - 3600000,
          endTime: Date.now() - 3480000,
          durationSeconds: 120,
          category: OutageCategory.ISP_EXTERNAL_FAILURE,
          eventType: OutageEventType.CONTINUOUS_OUTAGE,
          packetLossAvg: 100,
          gatewayStatus: "REACHABLE"
        }
      ]
    });

    expect(result.reportId).toBeDefined();
    expect(result.sha256Hash).toMatch(/^[a-f0-9]{64}$/);
    expect(fs.existsSync(tempPdf)).toBe(true);

    const stats = fs.statSync(tempPdf);
    expect(stats.size).toBeGreaterThan(1000); // Arquivo gerado com sucesso

    // Limpeza
    fs.unlinkSync(tempPdf);
  });
});
