import os from "node:os";
import { powerMonitor } from "electron";
import { HeartbeatService } from "./heartbeat-service";
import { SessionRepository } from "../storage/repositories/session-repository";
import { OperationalSession, SessionShutdownReason } from "../../shared/types";

export class SessionTracker {
  private static currentSession: OperationalSession | null = null;

  public static initialize(): OperationalSession {
    const now = Date.now();

    // 1. Auditar se a sessão anterior encerrou de forma anômala (Crash / Corte de Energia)
    const lastSession = SessionRepository.getLastSession();
    if (lastSession && lastSession.shutdownTime === null) {
      // Se a última sessão não tem shutdown_time, encerra retroativamente com UNEXPECTED_CRASH
      SessionRepository.closeSession(
        lastSession.id,
        lastSession.lastHeartbeat,
        SessionShutdownReason.UNEXPECTED_CRASH
      );
    }

    // 2. Criar nova sessão atual
    const newSessionId = "sess_" + now;
    const session: OperationalSession = {
      id: newSessionId,
      bootTime: now,
      shutdownTime: null,
      lastHeartbeat: now,
      shutdownReason: SessionShutdownReason.RUNNING,
      osVersion: `${os.type()} ${os.release()}`
    };

    SessionRepository.createSession(session);
    this.currentSession = session;

    // 3. Iniciar batimento periódico
    HeartbeatService.start(newSessionId);

    // 4. Configurar listener de gerenciamento de energia (Sleep / Resume / Shutdown)
    this.setupPowerMonitor();

    return session;
  }

  public static getCurrentSession(): OperationalSession | null {
    return this.currentSession;
  }

  public static shutdown(reason: SessionShutdownReason = SessionShutdownReason.NORMAL): void {
    if (this.currentSession) {
      const now = Date.now();
      HeartbeatService.stop();
      SessionRepository.closeSession(this.currentSession.id, now, reason);
      this.currentSession = null;
    }
  }

  private static setupPowerMonitor(): void {
    try {
      if (powerMonitor) {
        powerMonitor.on("suspend", () => {
          if (this.currentSession) {
            HeartbeatService.tickNow();
            SessionRepository.updateHeartbeat(this.currentSession.id, Date.now());
          }
        });

        powerMonitor.on("resume", () => {
          if (this.currentSession) {
            HeartbeatService.tickNow();
            SessionRepository.updateHeartbeat(this.currentSession.id, Date.now());
          }
        });

        powerMonitor.on("shutdown", () => {
          this.shutdown(SessionShutdownReason.NORMAL);
        });
      }
    } catch {
      // Caso esteja rodando fora de contexto nativo do Electron (ex.: testes unitários)
    }
  }
}
