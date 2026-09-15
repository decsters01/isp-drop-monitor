import { OutageCategory, OutageEvent, OutageEventType } from "../../shared/types";

export interface FlappingCandidate {
  startTime: number;
  lastActiveTime: number;
  totalDurationSeconds: number;
  category: OutageCategory;
  samplesCount: number;
  failedSamplesCount: number;
}

export class FlappingAggregator {
  private static activeWindow: FlappingCandidate | null = null;
  private static FLAPPING_WINDOW_MS = 60000; // 60 segundos

  public static processEvent(
    isDown: boolean,
    category: OutageCategory,
    timestamp: number
  ): { isFlapping: boolean; consolidatedEvent?: OutageEvent } {
    if (isDown) {
      if (!this.activeWindow) {
        this.activeWindow = {
          startTime: timestamp,
          lastActiveTime: timestamp,
          totalDurationSeconds: 0,
          category,
          samplesCount: 1,
          failedSamplesCount: 1
        };
        return { isFlapping: false };
      }

      // Se a última ocorrência foi dentro de 60s, mantém agrupado
      if (timestamp - this.activeWindow.lastActiveTime <= this.FLAPPING_WINDOW_MS) {
        this.activeWindow.lastActiveTime = timestamp;
        this.activeWindow.samplesCount++;
        this.activeWindow.failedSamplesCount++;
        return { isFlapping: true };
      } else {
        // Janela expirada, fecha a anterior e abre nova
        const previousEvent = this.finalizeWindow(this.activeWindow.lastActiveTime);
        this.activeWindow = {
          startTime: timestamp,
          lastActiveTime: timestamp,
          totalDurationSeconds: 0,
          category,
          samplesCount: 1,
          failedSamplesCount: 1
        };
        return { isFlapping: false, consolidatedEvent: previousEvent };
      }
    } else {
      // Conexão voltou
      if (this.activeWindow) {
        this.activeWindow.samplesCount++;
        // Se já passou de 60s desde a última oscilação, consolida a janela
        if (timestamp - this.activeWindow.lastActiveTime > this.FLAPPING_WINDOW_MS) {
          const finished = this.finalizeWindow(this.activeWindow.lastActiveTime);
          this.activeWindow = null;
          return { isFlapping: false, consolidatedEvent: finished };
        }
      }
      return { isFlapping: false };
    }
  }

  private static finalizeWindow(endTime: number): OutageEvent {
    if (!this.activeWindow) {
      throw new Error("Nenhuma janela ativa para finalizar");
    }

    const duration = Math.max(1, Math.round((endTime - this.activeWindow.startTime) / 1000));
    const lossPct = Math.round((this.activeWindow.failedSamplesCount / this.activeWindow.samplesCount) * 100);

    return {
      id: "flap_" + this.activeWindow.startTime,
      sessionId: "",
      startTime: this.activeWindow.startTime,
      endTime,
      durationSeconds: duration,
      category: this.activeWindow.category,
      eventType: OutageEventType.FLAPPING_WINDOW,
      packetLossAvg: lossPct,
      gatewayStatus: this.activeWindow.category === OutageCategory.ISP_EXTERNAL_FAILURE ? "REACHABLE" : "UNREACHABLE"
    };
  }

  public static flush(now: number): OutageEvent | null {
    if (this.activeWindow && now - this.activeWindow.lastActiveTime > this.FLAPPING_WINDOW_MS) {
      const finished = this.finalizeWindow(this.activeWindow.lastActiveTime);
      this.activeWindow = null;
      return finished;
    }
    return null;
  }
}
