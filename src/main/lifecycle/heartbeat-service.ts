import { SessionRepository } from "../storage/repositories/session-repository";

export class HeartbeatService {
  private static timer: NodeJS.Timeout | null = null;
  private static currentSessionId: string | null = null;
  private static readonly INTERVAL_MS = 30000; // 30 segundos

  public static start(sessionId: string): void {
    this.currentSessionId = sessionId;
    if (this.timer) {
      clearInterval(this.timer);
    }

    this.timer = setInterval(() => {
      if (this.currentSessionId) {
        SessionRepository.updateHeartbeat(this.currentSessionId, Date.now());
      }
    }, this.INTERVAL_MS);
  }

  public static stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  public static tickNow(): void {
    if (this.currentSessionId) {
      SessionRepository.updateHeartbeat(this.currentSessionId, Date.now());
    }
  }
}
