export enum ConnectionStatus {
  ONLINE = "ONLINE",
  ISP_OUTAGE = "ISP_OUTAGE",
  LOCAL_OUTAGE = "LOCAL_OUTAGE",
  FLAPPING = "FLAPPING"
}

export enum InterfaceType {
  ETHERNET = "ETHERNET",
  WIFI = "WIFI",
  OTHER = "OTHER"
}

export enum GatewayCheckMethod {
  ICMP = "ICMP",
  TCP_FALLBACK = "TCP_FALLBACK"
}

export enum OutageCategory {
  ISP_EXTERNAL_FAILURE = "ISP_EXTERNAL_FAILURE",
  LOCAL_ROUTER_FAILURE = "LOCAL_ROUTER_FAILURE",
  UNCLASSIFIED = "UNCLASSIFIED"
}

export enum OutageEventType {
  CONTINUOUS_OUTAGE = "CONTINUOUS_OUTAGE",
  FLAPPING_WINDOW = "FLAPPING_WINDOW"
}

export enum SessionShutdownReason {
  NORMAL = "NORMAL",
  UNEXPECTED_CRASH = "UNEXPECTED_CRASH",
  SUSPENDED = "SUSPENDED",
  RUNNING = "RUNNING"
}

export interface OperationalSession {
  id: string;
  bootTime: number;
  shutdownTime: number | null;
  lastHeartbeat: number;
  shutdownReason: SessionShutdownReason;
  osVersion: string;
}

export interface ConnectivitySample {
  id?: number;
  sessionId: string;
  timestamp: number;
  gatewayIp: string;
  gatewayLatencyMs: number | null;
  gatewayLossPct: number;
  gatewayMethod: GatewayCheckMethod;
  externalLatencyMs: number | null;
  externalLossPct: number;
  interfaceType: InterfaceType;
  interfaceName: string;
}

export interface OutageEvent {
  id: string;
  sessionId: string;
  startTime: number;
  endTime: number | null;
  durationSeconds: number;
  category: OutageCategory;
  eventType: OutageEventType;
  packetLossAvg: number;
  gatewayStatus: "REACHABLE" | "UNREACHABLE";
}

export interface AuditReportData {
  id: string;
  createdAt: number;
  periodStart: number;
  periodEnd: number;
  customerName?: string;
  ispName?: string;
  contractNumber?: string;
  incidentProtocol?: string;
  totalUptimeSec: number;
  totalDowntimeSec: number;
  availabilityPct: number;
  outagesCount: number;
  sha256Hash: string;
  pdfPath: string;
}

export interface LiveNetworkStatus {
  status: ConnectionStatus;
  currentGatewayLatencyMs: number | null;
  currentExternalLatencyMs: number | null;
  interfaceType: InterfaceType;
  interfaceName: string;
  gatewayIp: string;
  isMonitoring: boolean;
}

export interface MetricsSummary {
  totalMonitoredHours: number;
  totalOutagesCount: number;
  totalDowntimeSeconds: number;
  availabilityPct: number;
  averageLatencyMs: number;
}

/**
 * Função utilitária para verificação exaustiva de switch statements com enums ou discriminated unions.
 */
export function assertNever(x: never): never {
  throw new Error(`Caso não tratado no switch: ${JSON.stringify(x)}`);
}
