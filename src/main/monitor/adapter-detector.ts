import { exec } from "node:child_process";
import os from "node:os";
import util from "node:util";
import { InterfaceType } from "../../shared/types";

const execAsync = util.promisify(exec);

export interface DetectedInterface {
  gatewayIp: string;
  interfaceName: string;
  interfaceType: InterfaceType;
}

export class AdapterDetector {
  private static cachedGateway: string = "192.168.1.1";
  private static cachedInterfaceName: string = "Adaptador de Rede";
  private static cachedType: InterfaceType = InterfaceType.ETHERNET;
  private static lastCheck: number = 0;

  public static async detect(): Promise<DetectedInterface> {
    const now = Date.now();
    // Cache de 10 segundos para não onerar o processamento
    if (now - this.lastCheck < 10000 && this.cachedGateway) {
      return {
        gatewayIp: this.cachedGateway,
        interfaceName: this.cachedInterfaceName,
        interfaceType: this.cachedType
      };
    }

    try {
      if (process.platform === "win32") {
        const { stdout } = await execAsync("route print 0.0.0.0", { timeout: 3000 });
        const lines = stdout.split("\r\n");
        for (const line of lines) {
          const parts = line.trim().split(/\s+/);
          // Linha de rota padrão: 0.0.0.0   0.0.0.0   192.168.x.x   192.168.x.y
          if (parts[0] === "0.0.0.0" && parts[1] === "0.0.0.0" && parts[2]) {
            this.cachedGateway = parts[2];
            break;
          }
        }
      }
    } catch {
      // Mantém valor padrão ou anterior caso falhe
    }

    // Identificar tipo de interface via os.networkInterfaces()
    try {
      const interfaces = os.networkInterfaces();
      let detectedName = "Conexão de Rede";
      let detectedType = InterfaceType.OTHER;

      for (const [name, addrs] of Object.entries(interfaces)) {
        if (!addrs) continue;
        const hasIPv4 = addrs.some((a) => !a.internal && a.family === "IPv4");
        if (hasIPv4) {
          detectedName = name;
          const lowerName = name.toLowerCase();
          if (lowerName.includes("wi-fi") || lowerName.includes("wireless") || lowerName.includes("wlan") || lowerName.includes("sem fio")) {
            detectedType = InterfaceType.WIFI;
          } else if (lowerName.includes("ethernet") || lowerName.includes("local") || lowerName.includes("eth") || lowerName.includes("cabo")) {
            detectedType = InterfaceType.ETHERNET;
          } else {
            detectedType = InterfaceType.ETHERNET;
          }
          break;
        }
      }

      this.cachedInterfaceName = detectedName;
      this.cachedType = detectedType;
    } catch {
      // Ignora erro e usa cache
    }

    this.lastCheck = now;
    return {
      gatewayIp: this.cachedGateway,
      interfaceName: this.cachedInterfaceName,
      interfaceType: this.cachedType
    };
  }
}
