import { exec } from "node:child_process";
import util from "node:util";

const execAsync = util.promisify(exec);

export interface PingResult {
  host: string;
  isAlive: boolean;
  latencyMs: number | null;
  packetLossPct: number;
}

export class IcmpProbe {
  /**
   * Dispara um ping assíncrono para o host usando utilitário nativo sem elevação de privilégios.
   */
  public static async ping(host: string, timeoutMs: number = 1000): Promise<PingResult> {
    const isWindows = process.platform === "win32";
    const command = isWindows
      ? `ping -n 1 -w ${timeoutMs} ${host}`
      : `ping -c 1 -W ${Math.ceil(timeoutMs / 1000)} ${host}`;

    try {
      const { stdout } = await execAsync(command, { timeout: timeoutMs + 500 });
      let latencyMs: number | null = null;

      // Parsing de latência para Windows: "tempo=15ms" ou "tempo<1ms" ou "time=15ms"
      const match = stdout.match(/(?:tempo|time)[=<]([\d]+)ms/i);
      if (match && match[1]) {
        latencyMs = parseInt(match[1], 10);
      } else if (stdout.includes("<1ms") || stdout.includes("<1 ms")) {
        latencyMs = 1;
      }

      const isAlive = latencyMs !== null || stdout.includes("TTL=") || stdout.includes("ttl=");

      return {
        host,
        isAlive,
        latencyMs: isAlive ? (latencyMs ?? 1) : null,
        packetLossPct: isAlive ? 0 : 100
      };
    } catch {
      return {
        host,
        isAlive: false,
        latencyMs: null,
        packetLossPct: 100
      };
    }
  }

  /**
   * Executa pings concorrentes para múltiplos alvos
   */
  public static async pingAll(hosts: string[], timeoutMs: number = 1000): Promise<PingResult[]> {
    return Promise.all(hosts.map((host) => this.ping(host, timeoutMs)));
  }
}
