import fs from "node:fs";
import PDFDocument from "pdfkit";
import { IntegritySigner } from "./integrity-signer";
import { OutageCategory, OutageEvent } from "../../shared/types";

export interface GeneratePdfOptions {
  outputPath: string;
  customerName?: string;
  ispName?: string;
  contractNumber?: string;
  incidentProtocol?: string;
  periodStart: number;
  periodEnd: number;
  totalUptimeSec: number;
  totalDowntimeSec: number;
  events: OutageEvent[];
}

export interface GeneratePdfResult {
  reportId: string;
  sha256Hash: string;
  pdfPath: string;
  availabilityPct: number;
  outagesCount: number;
}

export class PdfReportGenerator {
  public static async generate(options: GeneratePdfOptions): Promise<GeneratePdfResult> {
    const now = Date.now();
    const reportId = IntegritySigner.generateReportId();

    const uptime = Math.max(1, options.totalUptimeSec);
    const downtime = options.totalDowntimeSec;
    // Disponibilidade líquida: (uptime - downtime) / uptime
    const netUptime = Math.max(0, uptime - downtime);
    const availabilityPct = Math.min(100, Math.max(0, Math.round((netUptime / uptime) * 10000) / 100));

    const ispEvents = options.events.filter((e) => e.category === OutageCategory.ISP_EXTERNAL_FAILURE);

    // Payload canônico e cálculo de Hash SHA-256
    const canonicalPayload = IntegritySigner.buildCanonicalPayload(
      reportId,
      now,
      options.periodStart,
      options.periodEnd,
      uptime,
      downtime,
      availabilityPct,
      options.events,
      options.customerName,
      options.ispName,
      options.contractNumber
    );
    const sha256Hash = IntegritySigner.calculateHash(canonicalPayload);

    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 40, size: "A4" });
        const writeStream = fs.createWriteStream(options.outputPath);

        doc.pipe(writeStream);

        // CABEÇALHO
        doc
          .fillColor("#0F172A")
          .fontSize(16)
          .text("LAUDO TÉCNICO DE AUDITORIA DE CONEXÃO ISP", { align: "center", bold: true } as any);
        doc
          .fontSize(10)
          .fillColor("#475569")
          .text("Relatório Pericial de Estabilidade de Rede e Perda de Conectividade Externa", { align: "center" });
        doc.moveDown(1.5);

        // DADOS CADASTRAIS & PERÍODO
        doc.fillColor("#0F172A").fontSize(11).text("1. IDENTIFICAÇÃO E PARÂMETROS DA AUDITORIA", { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(9).fillColor("#1E293B");

        const fmtDate = (ms: number) => new Date(ms).toLocaleString("pt-BR");
        doc.text(`Titular / Assinante: ${options.customerName || "Não informado"}`);
        doc.text(`Operadora (ISP): ${options.ispName || "Provedor Local / Banda Larga"}`);
        doc.text(`Nº do Contrato / Código: ${options.contractNumber || "Não informado"}`);
        if (options.incidentProtocol) {
          doc.text(`Protocolo de Chamado Contestado: ${options.incidentProtocol}`);
        }
        doc.text(`Período Auditado: ${fmtDate(options.periodStart)} até ${fmtDate(options.periodEnd)}`);
        doc.moveDown(1.5);

        // RESUMO EXECUTIVO
        doc.fillColor("#0F172A").fontSize(11).text("2. RESUMO EXECUTIVO DE DISPONIBILIDADE E UPTIME", { underline: true });
        doc.moveDown(0.5);

        const formatDuration = (sec: number) => {
          const h = Math.floor(sec / 3600);
          const m = Math.floor((sec % 3600) / 60);
          const s = sec % 60;
          return `${h}h ${m}m ${s}s`;
        };

        doc.rect(40, doc.y, 515, 60).fillAndStroke("#F8FAFC", "#CBD5E1");
        const boxY = doc.y + 8;
        doc.fillColor("#0F172A").fontSize(9);
        doc.text(`Tempo Total com Computador Ligado (Uptime do PC): ${formatDuration(uptime)}`, 50, boxY);
        doc.text(`Tempo Total de Quedas do Provedor (Indisponibilidade ISP): ${formatDuration(downtime)}`, 50, boxY + 14);
        doc.text(`Total de Quedas Confirmadas da Operadora: ${ispEvents.length} ocorrência(s)`, 50, boxY + 28);
        doc.text(
          `DISPONIBILIDADE EFETIVA: ${availabilityPct}%  (Meta Regulatória Anatel R-QST: >= 99.00%)`,
          50,
          boxY + 42,
          { bold: true } as any
        );

        doc.y = boxY + 65;
        doc.moveDown(1.5);

        // HISTÓRICO DE OCORRÊNCIAS
        doc.fillColor("#0F172A").fontSize(11).text("3. DISCRIMINAÇÃO CRONOLÓGICA DAS INTERRUPÇÕES", { underline: true });
        doc.moveDown(0.5);

        if (options.events.length === 0) {
          doc.fontSize(9).fillColor("#16A34A").text("Nenhuma interrupção de conectividade registrada no período analisado.");
        } else {
          doc.fontSize(8).fillColor("#334155");
          // Cabeçalho da tabela
          const tableTop = doc.y;
          doc.text("Início", 45, tableTop, { bold: true } as any);
          doc.text("Retorno", 165, tableTop, { bold: true } as any);
          doc.text("Duração", 285, tableTop, { bold: true } as any);
          doc.text("Origem / Causa Imputada", 365, tableTop, { bold: true } as any);
          doc.text("Perda", 485, tableTop, { bold: true } as any);

          doc.moveTo(40, tableTop + 12).lineTo(555, tableTop + 12).stroke("#94A3B8");

          let curY = tableTop + 16;
          for (const ev of options.events.slice(0, 30)) { // Limite de 30 eventos para página única/dupla limpa
            if (curY > 720) {
              doc.addPage();
              curY = 50;
            }
            const originText =
              ev.category === OutageCategory.ISP_EXTERNAL_FAILURE
                ? "Link da Operadora (ISP)"
                : "Rede Local / Roteador";
            const color = ev.category === OutageCategory.ISP_EXTERNAL_FAILURE ? "#DC2626" : "#D97706";

            doc.fillColor("#1E293B").text(fmtDate(ev.startTime), 45, curY);
            doc.text(ev.endTime ? fmtDate(ev.endTime) : "Em andamento", 165, curY);
            doc.text(formatDuration(ev.durationSeconds), 285, curY);
            doc.fillColor(color).text(originText, 365, curY);
            doc.fillColor("#1E293B").text(`${ev.packetLossAvg}%`, 485, curY);

            curY += 14;
          }
        }

        // RODAPÉ PERICIAL COM HASH SHA-256
        const bottomY = 760;
        doc.moveTo(40, bottomY).lineTo(555, bottomY).stroke("#CBD5E1");
        doc
          .fontSize(7)
          .fillColor("#64748B")
          .text(`ID do Laudo: ${reportId}  |  Emissão: ${fmtDate(now)}`, 40, bottomY + 5);
        doc.text(
          `Código de Autenticidade Criptográfica (SHA-256): ${sha256Hash}`,
          40,
          bottomY + 14
        );
        doc.text(
          "Documento pericial emitido por monitoramento assíncrono em dupla camada. Dados auditáveis conforme Resolução nº 574 e 632 da Anatel.",
          40,
          bottomY + 23
        );

        doc.end();

        writeStream.on("finish", () => {
          resolve({
            reportId,
            sha256Hash,
            pdfPath: options.outputPath,
            availabilityPct,
            outagesCount: ispEvents.length
          });
        });

        writeStream.on("error", (err) => reject(err));
      } catch (error) {
        reject(error);
      }
    });
  }
}
