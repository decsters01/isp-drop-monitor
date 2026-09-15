export const IPC_CHANNELS = {
  NETWORK_GET_STATUS: "network:get-current-status",
  NETWORK_STATUS_UPDATED: "network:status-updated",
  OUTAGES_GET_HISTORY: "outages:get-history",
  REPORT_GENERATE_PDF: "report:generate-pdf"
} as const;

export type IpcChannels = typeof IPC_CHANNELS[keyof typeof IPC_CHANNELS];
