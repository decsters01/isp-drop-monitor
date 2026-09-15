import { AdapterDetector } from "./adapter-detector";
import { FlappingAggregator } from "./flapping-aggregator";
import { IcmpProbe } from "./icmp-probe";
import { TcpFallback } from "./tcp-fallback";
import { OutageRepository } from "../storage/repositories/outage-repository";
import { SampleRepository } from "../storage/repositories/sample-repository";
import {
  ConnectionStatus,
  GatewayCheckMethod,
  InterfaceType,
  LiveNetworkStatus,
  OutageCategory,
  OutageEvent,
  OutageEventType
} from "../../shared/types";

export type StatusListener = (status: LiveNetworkStatus) => void;
export type OutageAlertListener = (outage: OutageEvent) => void;

export class NetworkEngine {
  private static isRunning: boolean = false;
  private static timer: NodeJS.Timeout | null = null;
  private static currentSessionId: string = "default-session";
  private static statusListeners: StatusListener[] = [];
  private static alertListeners: OutageAlertListener[] = [];

  // Estado atual
  private static currentStatus: ConnectionStatus = ConnectionStatus.ONLINE;
  private static consecutiveExternalFails: number = 0;
  private static activeOutage: OutageEvent | null = null;
  private static outageStartTime: number | null = null;
  private static currentGatewayLatency: number | null = null;
  private static currentExternalLatency: number | null = null;
  private static currentInterfaceType: InterfaceType = InterfaceType.ETHERNET;
  private static currentInterfaceName: string = "Rede";
  private static currentGatewayIp: string = "192.168.1.1";

  public static setSessionId(id: string): void {
    this.currentSessionId = id;
  }

  public static onStatusChange(listener: StatusListener): () => void {
    this.statusListeners.push(listener);
    return () => {
      this.statusListeners = this.statusListeners.filter((l) => l !== listener);
    };
  }

  public static onOutageAlert(listener: OutageAlertListener): () => void {
    this.alertListeners.push(listener);
    return () => {
      this.alertListeners = this.alertListeners.filter((l) => l !== listener);
    };
  }

  public static getLiveStatus(): LiveNetworkStatus {
    return {
      status: this.currentStatus,
      currentGatewayLatencyMs: this.currentGatewayLatency,
      currentExternalLatencyMs: this.currentExternalLatency,
      interfaceType: this.currentInterfaceType,
      interfaceName: this.currentInterfaceName,
      gatewayIp: this.currentGatewayIp,
      isMonitoring: this.isRunning
    };
  }

  public static start(intervalMs: number = 3000): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.runCycle();
    this.timer = setInterval(() => {
      this.runCycle();
    }, intervalMs);
  }

  public static stop(): void {
    this.isRunning = false;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private static async runCycle(): Promise<void> {
    if (!this.isRunning) return;
    const now = Date.now();

    try {
      const iface = await AdapterDetector.detect();
      this.currentGatewayIp = iface.gatewayIp;
      this.currentInterfaceName = iface.interfaceName;
      this.currentInterfaceType = iface.interfaceType;

      // 1. Sondagem no Gateway
      let gatewayAlive = false;
      let gatewayLatency: number | null = null;
      let gatewayMethod: GatewayCheckMethod = GatewayCheckMethod.ICMP;

      const gwIcmp = await IcmpProbe.ping(this.currentGatewayIp, 800);
      if (gwIcmp.isAlive) {
        gatewayAlive = true;
        gatewayLatency = gwIcmp.latencyMs;
      } else {
        // Fallback TCP SYN
        const gwTcp = await TcpFallback.checkHost(this.currentGatewayIp, 800);
        if (gwTcp.isAlive) {
          gatewayAlive = true;
          gatewayLatency = gwTcp.latencyMs;
          gatewayMethod = GatewayCheckMethod.TCP_FALLBACK;
        }
      }

      // 2. Sondagem Externa (1.1.1.1 e 8.8.8.8)
      const extResults = await IcmpProbe.pingAll(["1.1.1.1", "8.8.8.8"], 900);
      const aliveExternal = extResults.filter((r) => r.isAlive);
      const externalAlive = aliveExternal.length > 0;

      let externalLatency: number | null = null;
      if (externalAlive) {
        const sum = aliveExternal.reduce((acc, curr) => acc + (curr.latencyMs ?? 0), 0);
        externalLatency = Math.round(sum / aliveExternal.length);
      }

      this.currentGatewayLatency = gatewayLatency;
      this.currentExternalLatency = externalLatency;

      // Gravar amostra
      SampleRepository.addSample({
        sessionId: this.currentSessionId,
        timestamp: now,
        gatewayIp: this.currentGatewayIp,
        gatewayLatencyMs: gatewayLatency,
        gatewayLossPct: gatewayAlive ? 0 : 100,
        gatewayMethod,
        externalLatencyMs: externalLatency,
        externalLossPct: externalAlive ? 0 : 100,
        interfaceType: this.currentInterfaceType,
        interfaceName: this.currentInterfaceName
      });

      // Avaliação de Quedas
      if (!externalAlive) {
        this.consecutiveExternalFails++;
        // Limiar de 5 segundos (após ~2 amostras consecutivas)
        if (this.consecutiveExternalFails >= 2) {
          if (gatewayAlive) {
            this.handleOutage(OutageCategory.ISP_EXTERNAL_FAILURE, now);
          } else {
            this.handleOutage(OutageCategory.LOCAL_ROUTER_FAILURE, now);
          }
        }
      } else {
        // Internet ativa
        this.consecutiveExternalFails = 0;
        if (this.activeOutage) {
          this.closeActiveOutage(now);
        }
        this.currentStatus = ConnectionStatus.ONLINE;
      }

      // Checar se há janela de flapping para liberar
      const flushed = FlappingAggregator.flush(now);
      if (flushed) {
        flushed.sessionId = this.currentSessionId;
        OutageRepository.createOutage(flushed);
      }

      this.notifyListeners();
    } catch (err) {
      console.error("Erro no ciclo de monitoramento de rede:", err);
    }
  }

  private static handleOutage(category: OutageCategory, now: number): void {
    if (!this.activeOutage) {
      this.outageStartTime = now;
      this.currentStatus =
        category === OutageCategory.ISP_EXTERNAL_FAILURE
          ? ConnectionStatus.ISP_OUTAGE
          : ConnectionStatus.LOCAL_OUTAGE;

      this.activeOutage = {
        id: "outage_" + now,
        sessionId: this.currentSessionId,
        startTime: now,
        endTime: null,
        durationSeconds: 0,
        category,
        eventType: OutageEventType.CONTINUOUS_OUTAGE,
        packetLossAvg: 100,
        gatewayStatus: category === OutageCategory.ISP_EXTERNAL_FAILURE ? "REACHABLE" : "UNREACHABLE"
      };

      OutageRepository.createOutage(this.activeOutage);
      this.alertListeners.forEach((l) => l(this.activeOutage!));
    }
  }

  private static closeActiveOutage(now: number): void {
    if (this.activeOutage && this.outageStartTime) {
      const durationSeconds = Math.max(1, Math.round((now - this.outageStartTime) / 1000));
      OutageRepository.closeOutage(this.activeOutage.id, now, durationSeconds, 100);

      // Passar para agregador de flapping
      FlappingAggregator.processEvent(true, this.activeOutage.category, this.outageStartTime);
      FlappingAggregator.processEvent(false, this.activeOutage.category, now);

      this.activeOutage = null;
      this.outageStartTime = null;
    }
  }

  private static notifyListeners(): void {
    const live = this.getLiveStatus();
    this.statusListeners.forEach((l) => l(live));
  }
}
