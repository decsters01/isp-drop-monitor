import React, { useState, useMemo } from "react";
import { Search, Filter, AlertTriangle, ShieldCheck, ChevronLeft, ChevronRight } from "lucide-react";
import { OutageCategory, OutageEvent, assertNever } from "@shared/types";

interface OutagesTableProps {
  events: OutageEvent[];
}

export const OutagesTable: React.FC<OutagesTableProps> = ({ events }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"ALL" | "ISP_ONLY" | "LOCAL_ONLY">("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      // Filtro de categoria
      if (categoryFilter === "ISP_ONLY" && ev.category !== OutageCategory.ISP_EXTERNAL_FAILURE) {
        return false;
      }
      if (categoryFilter === "LOCAL_ONLY" && ev.category !== OutageCategory.LOCAL_ROUTER_FAILURE) {
        return false;
      }

      // Filtro de busca
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const dateStr = new Date(ev.startTime).toLocaleString("pt-BR").toLowerCase();
        const categoryStr = ev.category.toLowerCase();
        return dateStr.includes(term) || categoryStr.includes(term);
      }

      return true;
    });
  }, [events, categoryFilter, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / itemsPerPage));
  const paginatedEvents = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredEvents.slice(start, start + itemsPerPage);
  }, [filteredEvents, currentPage]);

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  const renderBadge = (category: OutageCategory) => {
    switch (category) {
      case OutageCategory.ISP_EXTERNAL_FAILURE:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-950/70 text-rose-400 border border-rose-800">
            <AlertTriangle className="w-3 h-3 text-rose-400" />
            Link da Operadora (ISP)
          </span>
        );
      case OutageCategory.LOCAL_ROUTER_FAILURE:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-950/70 text-amber-400 border border-amber-800">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            Rede Local / Roteador
          </span>
        );
      case OutageCategory.UNCLASSIFIED:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
            Não Classificado
          </span>
        );
      default:
        assertNever(category);
    }
  };

  return (
    <div className="p-5 bg-dark-800 border border-dark-700 rounded-xl shadow-lg shadow-black/30">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-sm font-bold text-white tracking-wide uppercase flex items-center gap-2">
            Registro Cronológico de Interrupções e Instabilidades
            <span className="text-xs font-normal text-slate-400 px-2 py-0.5 rounded bg-dark-700">
              {filteredEvents.length} eventos
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Eventos auditados com carimbo de tempo para comprovação probatória.
          </p>
        </div>

        {/* Filtros e Busca */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por data/hora..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-8 pr-3 py-1.5 text-xs bg-dark-850 border border-dark-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-brand-blue transition-colors w-48"
            />
          </div>

          <div className="flex items-center gap-1 bg-dark-850 p-1 border border-dark-700 rounded-lg">
            <button
              onClick={() => {
                setCategoryFilter("ALL");
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1 text-xs rounded font-medium transition-all ${
                categoryFilter === "ALL"
                  ? "bg-brand-blue text-white shadow-sm shadow-brand-blue/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => {
                setCategoryFilter("ISP_ONLY");
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1 text-xs rounded font-medium transition-all ${
                categoryFilter === "ISP_ONLY"
                  ? "bg-brand-blue text-white shadow-sm shadow-brand-blue/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Apenas ISP
            </button>
            <button
              onClick={() => {
                setCategoryFilter("LOCAL_ONLY");
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1 text-xs rounded font-medium transition-all ${
                categoryFilter === "LOCAL_ONLY"
                  ? "bg-brand-blue text-white shadow-sm shadow-brand-blue/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Apenas Local
            </button>
          </div>
        </div>
      </div>

      {/* Tabela */}
      <div className="overflow-x-auto rounded-lg border border-dark-700">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-dark-850 text-slate-400 uppercase text-[10px] tracking-wider border-b border-dark-700">
            <tr>
              <th className="py-3 px-4">Início da Interrupção</th>
              <th className="py-3 px-4">Término / Retorno</th>
              <th className="py-3 px-4">Duração</th>
              <th className="py-3 px-4">Classificação Pericial</th>
              <th className="py-3 px-4">Perda Média</th>
              <th className="py-3 px-4">Status Gateway</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-700/60">
            {paginatedEvents.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-1">
                    <ShieldCheck className="w-6 h-6 text-emerald-500/60 mb-1" />
                    <span className="font-semibold text-slate-400">Nenhuma queda registrada</span>
                    <span className="text-[11px] text-slate-500">
                      Sua conexão não sofreu interrupções com os filtros selecionados.
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedEvents.map((ev) => (
                <tr
                  key={ev.id}
                  className="hover:bg-dark-700/40 transition-colors group cursor-default"
                >
                  <td className="py-3 px-4 font-medium text-white">
                    {new Date(ev.startTime).toLocaleString("pt-BR")}
                  </td>
                  <td className="py-3 px-4 text-slate-400">
                    {ev.endTime ? new Date(ev.endTime).toLocaleString("pt-BR") : (
                      <span className="text-amber-400 font-semibold animate-pulse">Em andamento</span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-200">
                    {formatDuration(ev.durationSeconds)}
                  </td>
                  <td className="py-3 px-4">
                    {renderBadge(ev.category)}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-rose-400">{ev.packetLossAvg}%</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-[11px] text-emerald-400 font-mono">
                      {ev.gatewayStatus}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 mt-2 text-xs text-slate-400">
          <span>
            Página {currentPage} de {totalPages}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1 rounded bg-dark-850 border border-dark-700 disabled:opacity-30 hover:bg-dark-700 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1 rounded bg-dark-850 border border-dark-700 disabled:opacity-30 hover:bg-dark-700 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
