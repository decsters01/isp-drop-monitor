import path from "node:path";
import { dialog } from "electron";
import { PdfReportGenerator } from "../report/pdf-generator";
import { OutageRepository } from "../storage/repositories/outage-repository";
import { ReportRepository } from "../storage/repositories/report-repository";
import { SessionRepository } from "../storage/repositories/session-repository";

export interface GeneratePdfIpcRequest {
  periodStart: number;
  periodEnd: number;
  customerName?: string;
  ispName?: string;
  contractNumber?: string;
  incidentProtocol?: string;
  destinationPath?: string;
}

export class ReportIpcHandler {
  public static async handleGenerate(request: GeneratePdfIpcRequest): Promise<{
    success: boolean;
    reportId?: string;
    pdfPath?: string;
    sha256Hash?: string;
    availabilityPct?: number;
    outagesCount?: number;
    error?: string;
  }> {
    try {
      let outputPath = request.destinationPath;

      if (!outputPath) {
        const defaultFilename = `Laudo_Auditoria_ISP_${new Date().toISOString().slice(0, 10)}.pdf`;
        const { filePath } = await dialog.showSaveDialog({
          title: "Salvar Laudo Pericial de Conexão ISP",
          defaultPath: path.join(process.env.USERPROFILE || ".", "Downloads", defaultFilename),
          filters: [{ name: "Documentos PDF (*.pdf)", extensions: ["pdf"] }]
        });

        if (!filePath) {
          return { success: false, error: "Operação cancelada pelo usuário." };
        }
        outputPath = filePath;
      }

      // Buscar métricas da sessão e eventos no banco de dados local
      const totalUptimeSec = SessionRepository.getTotalUptimeSeconds(request.periodStart, request.periodEnd);
      const totalDowntimeSec = OutageRepository.getTotalIspDowntimeSeconds(request.periodStart, request.periodEnd);
      const events = OutageRepository.getOutages(request.periodStart, request.periodEnd, "ALL");

      const result = await PdfReportGenerator.generate({
        outputPath,
        customerName: request.customerName,
        ispName: request.ispName,
        contractNumber: request.contractNumber,
        incidentProtocol: request.incidentProtocol,
        periodStart: request.periodStart,
        periodEnd: request.periodEnd,
        totalUptimeSec,
        totalDowntimeSec,
        events
      });

      // Salvar histórico no banco
      ReportRepository.saveReport({
        id: result.reportId,
        createdAt: Date.now(),
        periodStart: request.periodStart,
        periodEnd: request.periodEnd,
        customerName: request.customerName,
        ispName: request.ispName,
        contractNumber: request.contractNumber,
        incidentProtocol: request.incidentProtocol,
        totalUptimeSec,
        totalDowntimeSec,
        availabilityPct: result.availabilityPct,
        outagesCount: result.outagesCount,
        sha256Hash: result.sha256Hash,
        pdfPath: result.pdfPath
      });

      return {
        success: true,
        reportId: result.reportId,
        pdfPath: result.pdfPath,
        sha256Hash: result.sha256Hash,
        availabilityPct: result.availabilityPct,
        outagesCount: result.outagesCount
      };
    } catch (err: any) {
      console.error("Falha ao gerar laudo em PDF:", err);
      return {
        success: false,
        error: err.message || "Erro desconhecido ao gerar o laudo."
      };
    }
  }
}
