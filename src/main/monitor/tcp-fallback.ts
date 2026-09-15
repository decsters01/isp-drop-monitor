import net from "node:net";

export interface TcpCheckResult {
  host: string;
  isAlive: boolean;
  latencyMs: number | null;
}

export class TcpFallback {
  private static COMMON_PORTS = [53, 80, 443];

  /**
   * Tenta conectar em uma porta TCP do roteador.
   * Se o roteador aceitar OU rejeitar com RST (Connection Refused),
   * fica comprovado que ele está vivo e comunicante na rede local.
   */
  public static async checkHost(host: string, timeoutMs: number = 1000): Promise<TcpCheckResult> {
    const startTime = Date.now();

    for (const port of this.COMMON_PORTS) {
      const alive = await this.probePort(host, port, timeoutMs);
      if (alive) {
        return {
          host,
          isAlive: true,
          latencyMs: Math.max(1, Date.now() - startTime)
        };
      }
    }

    return {
      host,
      isAlive: false,
      latencyMs: null
    };
  }

  private static probePort(host: string, port: number, timeoutMs: number): Promise<boolean> {
    return new Promise((resolve) => {
      const socket = new net.Socket();
      let resolved = false;

      const finish = (result: boolean) => {
        if (!resolved) {
          resolved = true;
          socket.destroy();
          resolve(result);
        }
      };

      socket.setTimeout(timeoutMs);

      socket.on("connect", () => finish(true));
      socket.on("error", (err: any) => {
        // Se a conexão foi ativamente recusada (ECONNREFUSED), o IP existe e está online!
        if (err.code === "ECONNREFUSED") {
          finish(true);
        } else {
          finish(false);
        }
      });
      socket.on("timeout", () => finish(false));

      try {
        socket.connect(port, host);
      } catch {
        finish(false);
      }
    });
  }
}
