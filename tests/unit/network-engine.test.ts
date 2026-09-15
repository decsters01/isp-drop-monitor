import { describe, it, expect, beforeEach } from "vitest";
import { FlappingAggregator } from "../../src/main/monitor/flapping-aggregator";
import { OutageCategory, OutageEventType, ConnectionStatus } from "../../src/shared/types";

describe("FlappingAggregator", () => {
  it("deve agregar microquedas ocorridas em menos de 60 segundos", () => {
    const t0 = 1000000;
    // Primeira microqueda
    const res1 = FlappingAggregator.processEvent(true, OutageCategory.ISP_EXTERNAL_FAILURE, t0);
    expect(res1.isFlapping).toBe(false);

    // Segunda microqueda 15s depois
    const res2 = FlappingAggregator.processEvent(true, OutageCategory.ISP_EXTERNAL_FAILURE, t0 + 15000);
    expect(res2.isFlapping).toBe(true);

    // Conexão volta aos 20s
    const res3 = FlappingAggregator.processEvent(false, OutageCategory.ISP_EXTERNAL_FAILURE, t0 + 20000);
    expect(res3.isFlapping).toBe(false);

    // Passados 65s sem novas oscilações, fecha a janela
    const flushed = FlappingAggregator.flush(t0 + 80000);
    expect(flushed).not.toBeNull();
    expect(flushed?.eventType).toBe(OutageEventType.FLAPPING_WINDOW);
    expect(flushed?.category).toBe(OutageCategory.ISP_EXTERNAL_FAILURE);
  });
});

describe("ConnectionStatus enum & contracts", () => {
  it("deve conter todos os estados necessários de auditoria", () => {
    expect(ConnectionStatus.ONLINE).toBe("ONLINE");
    expect(ConnectionStatus.ISP_OUTAGE).toBe("ISP_OUTAGE");
    expect(ConnectionStatus.LOCAL_OUTAGE).toBe("LOCAL_OUTAGE");
    expect(ConnectionStatus.FLAPPING).toBe("FLAPPING");
  });
});
