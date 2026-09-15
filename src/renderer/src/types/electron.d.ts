import { LiveNetworkStatus, OutageEvent, MetricsSummary } from "@shared/types";

export interface ElectronAPI {
  getNetworkStatus: () => Promise<LiveNetworkStatus>;
  onStatusUpdated: (callback: (data: LiveNetworkStatus) => void) => () => void;
  getOutagesHistory: (params: {
    startDate: number;
    endDate: number;
    categoryFilter: "ALL" | "ISP_ONLY" | "LOCAL_ONLY";
  }) => Promise<{
    events: OutageEvent[];
    metrics: MetricsSummary;
  }>;
  generatePdfReport: (params: {
    periodStart: number;
    periodEnd: number;
    customerName?: string;
    ispName?: string;
    contractNumber?: string;
    incidentProtocol?: string;
    destinationPath?: string;
  }) => Promise<{
    success: boolean;
    reportId?: string;
    pdfPath?: string;
    sha256Hash?: string;
    availabilityPct?: number;
    outagesCount?: number;
    error?: string;
  }>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
