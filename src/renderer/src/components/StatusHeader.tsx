import React from "react";
import { Wifi, Network, ShieldCheck, AlertTriangle, Radio } from "lucide-react";
import { ConnectionStatus, InterfaceType, LiveNetworkStatus, assertNever } from "@shared/types";

interface StatusHeaderProps {
  status: LiveNetworkStatus | null;
  onOpenReportModal: () => void;
}

export const StatusHeader: React.FC<StatusHeaderProps> = ({ status, onOpenReportModal }) => {
  const isOnline = status?.status === ConnectionStatus.ONLINE;
  const isIspOutage = status?.status === ConnectionStatus.ISP_OUTAGE;
  const isLocalOutage = status?.status === ConnectionStatus.LOCAL_OUTAGE;
  const isFlapping = status?.status === ConnectionStatus.FLAPPING;

  const getStatusBadge = () => {
    if (!status) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
          <Radio className="w-3.5 h-3.5 animate-pulse text-slate-400" />
          Conectando...
        </span>
      );
    }

    switch (status.status) {
      case ConnectionStatus.ONLINE:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-800/80 shadow-sm shadow-emerald-900/30">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Conexão Estável
          </span>
        );
      case ConnectionStatus.ISP_OUTAGE:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-950/80 text-rose-400 border border-rose-800 animate-pulse shadow-sm shadow-rose-900/40">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            Falha no Link Externo (ISP)
          </span>
        );
      case ConnectionStatus.LOCAL_OUTAGE:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-950/80 text-amber-400 border border-amber-800 shadow-sm shadow-amber-900/30">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            Falha no Roteador Local
          </span>
        );
      case ConnectionStatus.FLAPPING:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-950/80 text-amber-300 border border-amber-700 animate-pulse">
            <Radio className="w-3.5 h-3.5 text-amber-300" />
            Instabilidade Severa (Flapping)
          </span>
        );
      default:
        assertNever(status.status);
    }
  };

  const getInterfaceIcon = () => {
    if (status?.interfaceType === InterfaceType.WIFI) {
      return <Wifi className="w-4 h-4 text-brand-blue" />;
    }
    return <Network className="w-4 h-4 text-brand-blue" />;
  };

  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-dark-850 border-b border-dark-700 rounded-xl shadow-lg shadow-black/40">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-lg bg-navy-800/80 border border-navy-600 shadow-inner">
          <ShieldCheck className="w-6 h-6 text-brand-blue" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            Auditor de Conexão ISP
            <span className="text-xs font-normal text-brand-cyan px-2 py-0.5 rounded bg-navy-800/50 border border-navy-700">
              Windows Native
            </span>
          </h1>
          <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
            {getInterfaceIcon()}
            <span>Interface: {status?.interfaceName || "Detectando..."}</span>
            <span className="text-slate-600">•</span>
            <span>Gateway: {status?.gatewayIp || "192.168.1.1"}</span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {getStatusBadge()}

        <button
          onClick={onOpenReportModal}
          className="px-4 py-2 text-sm font-semibold rounded-lg bg-brand-blue hover:bg-navy-500 text-white transition-all duration-200 shadow-md shadow-brand-blue/20 hover:shadow-brand-blue/40 hover:-translate-y-0.5 active:translate-y-0"
        >
          Gerar Laudo Técnico em PDF
        </button>
      </div>
    </header>
  );
};
