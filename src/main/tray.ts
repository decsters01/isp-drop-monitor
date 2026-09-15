import { app, Menu, Tray, nativeImage, BrowserWindow, Notification } from "electron";
import { ConnectionStatus, LiveNetworkStatus, assertNever } from "../shared/types";

export class SystemTrayManager {
  private static tray: Tray | null = null;

  public static initialize(mainWindow: BrowserWindow): Tray {
    if (this.tray) return this.tray;

    // Criação de ícone padrão 16x16 transparente/azul se arquivo não existir
    const icon = nativeImage.createFromBuffer(
      Buffer.from([
        0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
        0x00, 0x00, 0x00, 0x10, 0x00, 0x00, 0x00, 0x10, 0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0xf3, 0xff,
        0x61, 0x00, 0x00, 0x00, 0x19, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9c, 0x63, 0x64, 0xf8, 0x0f, 0xc4,
        0x00, 0x0c, 0x14, 0x20, 0xc1, 0x6f, 0x0c, 0x18, 0x00, 0x18, 0x00, 0x03, 0x00, 0xb8, 0xb2, 0x04,
        0x2c, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82
      ])
    );

    this.tray = new Tray(icon);
    this.tray.setToolTip("Monitor de Conexão ISP - Conexão Estável");

    const contextMenu = Menu.buildFromTemplate([
      {
        label: "Abrir Painel Principal",
        click: () => {
          mainWindow.show();
          mainWindow.focus();
        }
      },
      { type: "separator" },
      {
        label: "Sair do Monitor",
        click: () => {
          app.quit();
        }
      }
    ]);

    this.tray.setContextMenu(contextMenu);
    this.tray.on("double-click", () => {
      mainWindow.show();
      mainWindow.focus();
    });

    return this.tray;
  }

  public static updateStatus(status: LiveNetworkStatus): void {
    if (!this.tray) return;

    let tooltipText = "Monitor de Conexão ISP: ";
    switch (status.status) {
      case ConnectionStatus.ONLINE:
        tooltipText += `Estável (${status.currentExternalLatencyMs ?? 0}ms)`;
        break;
      case ConnectionStatus.ISP_OUTAGE:
        tooltipText += "QUEDA DO PROVEDOR (ISP)";
        break;
      case ConnectionStatus.LOCAL_OUTAGE:
        tooltipText += "FALHA LOCAL / ROTEADOR";
        break;
      case ConnectionStatus.FLAPPING:
        tooltipText += "INSTABILIDADE (FLAPPING)";
        break;
      default:
        assertNever(status.status);
    }

    this.tray.setToolTip(tooltipText);
  }

  public static notifyOutage(title: string, body: string): void {
    try {
      if (Notification.isSupported()) {
        new Notification({
          title,
          body
        }).show();
      }
    } catch {
      // Ignora erro de notificação em ambientes restritos
    }
  }
}
