import { contextBridge, ipcRenderer } from "electron";
import { IPC_CHANNELS } from "../shared/ipc-channels";
import { LiveNetworkStatus } from "../shared/types";

contextBridge.exposeInMainWorld("electronAPI", {
  getNetworkStatus: () => ipcRenderer.invoke(IPC_CHANNELS.NETWORK_GET_STATUS),
  onStatusUpdated: (callback: (data: LiveNetworkStatus) => void) => {
    const subscription = (_event: Electron.IpcRendererEvent, value: LiveNetworkStatus) => callback(value);
    ipcRenderer.on(IPC_CHANNELS.NETWORK_STATUS_UPDATED, subscription);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.NETWORK_STATUS_UPDATED, subscription);
  },
  getOutagesHistory: (params: { startDate: number; endDate: number; categoryFilter: string }) =>
    ipcRenderer.invoke(IPC_CHANNELS.OUTAGES_GET_HISTORY, params),
  generatePdfReport: (params: {
    periodStart: number;
    periodEnd: number;
    customerName?: string;
    ispName?: string;
    contractNumber?: string;
    incidentProtocol?: string;
    destinationPath?: string;
  }) => ipcRenderer.invoke(IPC_CHANNELS.REPORT_GENERATE_PDF, params),
  getAnalyticsData: (params?: { daysCount?: number }) =>
    ipcRenderer.invoke(IPC_CHANNELS.ANALYTICS_GET_DATA, params)
});
