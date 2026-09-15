import { describe, it, expect, beforeAll } from "vitest";
import { initDatabase } from "../../src/main/storage/database";
import { SessionRepository } from "../../src/main/storage/repositories/session-repository";
import { SessionShutdownReason } from "../../src/shared/types";

describe("SessionTracker & Uptime Calculation", () => {
  beforeAll(async () => {
    // Inicializa banco em memória para teste
    await initDatabase(":memory:");
  });

  it("deve registrar e calcular corretamente o uptime total em segundos", () => {
    const t0 = 1700000000000;
    const tEnd = t0 + (3600 * 1000); // 1 hora depois

    SessionRepository.createSession({
      id: "test_session_1",
      bootTime: t0,
      shutdownTime: tEnd,
      lastHeartbeat: tEnd,
      shutdownReason: SessionShutdownReason.NORMAL,
      osVersion: "Windows 11"
    });

    const uptime = SessionRepository.getTotalUptimeSeconds(t0, tEnd);
    expect(uptime).toBe(3600); // 3600 segundos = 1 hora
  });
});
