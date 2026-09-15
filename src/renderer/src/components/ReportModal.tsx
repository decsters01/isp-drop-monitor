import React, { useState } from "react";
import { X, FileText, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose }) => {
  const [periodDays, setPeriodDays] = useState(7);
  const [customerName, setCustomerName] = useState("");
  const [ispName, setIspName] = useState("");
  const [contractNumber, setContractNumber] = useState("");
  const [incidentProtocol, setIncidentProtocol] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultMessage, setResultMessage] = useState<{ type: "success" | "error"; text: string; hash?: string } | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setIsGenerating(true);
    setResultMessage(null);

    const periodEnd = Date.now();
    const periodStart = periodEnd - periodDays * 24 * 60 * 60 * 1000;

    try {
      const response = await window.electronAPI.generatePdfReport({
        periodStart,
        periodEnd,
        customerName: customerName.trim() || undefined,
        ispName: ispName.trim() || undefined,
        contractNumber: contractNumber.trim() || undefined,
        incidentProtocol: incidentProtocol.trim() || undefined
      });

      if (response.success && response.pdfPath) {
        setResultMessage({
          type: "success",
          text: `Laudo emitido com sucesso! Salvo em: ${response.pdfPath}`,
          hash: response.sha256Hash
        });
      } else {
        setResultMessage({
          type: "error",
          text: response.error || "Operação cancelada ou não foi possível emitir o laudo."
        });
      }
    } catch (err: any) {
      setResultMessage({
        type: "error",
        text: err.message || "Erro inesperado ao gerar laudo."
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-dark-850 border border-dark-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Cabeçalho do Modal */}
        <div className="flex items-center justify-between p-5 border-b border-dark-700 bg-dark-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-navy-800 border border-navy-700">
              <FileText className="w-5 h-5 text-brand-blue" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Emitir Laudo Técnico Pericial</h3>
              <p className="text-xs text-slate-400">Documento probatório para Procon, Anatel e Ouvidoria</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-dark-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulário */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">
              Período de Auditoria
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Últimas 24 horas", days: 1 },
                { label: "Últimos 7 dias", days: 7 },
                { label: "Últimos 30 dias", days: 30 }
              ].map((p) => (
                <button
                  key={p.days}
                  type="button"
                  onClick={() => setPeriodDays(p.days)}
                  className={`py-2 text-xs rounded-lg font-medium border transition-all ${
                    periodDays === p.days
                      ? "bg-brand-blue/20 border-brand-blue text-brand-cyan shadow-sm shadow-brand-blue/30"
                      : "bg-dark-800 border-dark-700 text-slate-400 hover:text-white"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Nome do Titular
              </label>
              <input
                type="text"
                placeholder="Ex: João da Silva"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-dark-800 border border-dark-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-brand-blue"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Nome da Operadora (ISP)
              </label>
              <input
                type="text"
                placeholder="Ex: Claro, Vivo, Oi, etc."
                value={ispName}
                onChange={(e) => setIspName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-dark-800 border border-dark-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-brand-blue"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Nº Contrato / Assinante
              </label>
              <input
                type="text"
                placeholder="Ex: 12345678"
                value={contractNumber}
                onChange={(e) => setContractNumber(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-dark-800 border border-dark-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-brand-blue"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Protocolo Contestado
              </label>
              <input
                type="text"
                placeholder="Ex: 2026091512345"
                value={incidentProtocol}
                onChange={(e) => setIncidentProtocol(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-dark-800 border border-dark-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-brand-blue"
              />
            </div>
          </div>

          {resultMessage && (
            <div
              className={`p-3 rounded-xl text-xs border ${
                resultMessage.type === "success"
                  ? "bg-emerald-950/40 border-emerald-800/80 text-emerald-300"
                  : "bg-rose-950/40 border-rose-800/80 text-rose-300"
              }`}
            >
              <div className="flex items-start gap-2">
                {resultMessage.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                )}
                <div className="space-y-1">
                  <p className="font-semibold">{resultMessage.text}</p>
                  {resultMessage.hash && (
                    <p className="text-[10px] text-slate-400 font-mono break-all">
                      Hash SHA-256: {resultMessage.hash}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Rodapé do Modal */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-dark-700 bg-dark-800/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            Fechar
          </button>
          <button
            type="button"
            disabled={isGenerating}
            onClick={handleGenerate}
            className="flex items-center gap-2 px-5 py-2 text-xs font-semibold rounded-lg bg-brand-blue hover:bg-navy-500 text-white transition-all shadow-md shadow-brand-blue/30 disabled:opacity-50"
          >
            {isGenerating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {isGenerating ? "Diagramando PDF..." : "Exportar Laudo em PDF"}
          </button>
        </div>
      </div>
    </div>
  );
};
