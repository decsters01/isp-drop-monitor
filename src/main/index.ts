import path from "node:path";
import { app, BrowserWindow } from "electron";
import { registerIpcHandlers } from "./ipc/register-handlers";
import { NetworkEngine } from "./monitor/network-engine";
import { SessionTracker } from "./lifecycle/session-tracker";
import { initDatabase } from "./storage/database";
import { SystemTrayManager } from "./tray";
import { IPC_CHANNELS } from "../shared/ipc-channels";
import { ConnectionStatus, OutageCategory, SessionShutdownReason } from "../shared/types";

let mainWindow: BrowserWindow | null = null;
let isAppQuitting = false;

async function createWindow(): Promise<void> {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 750,
    minWidth: 900,
    minHeight: 600,
    backgroundColor: "#070B14",
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      sandbox: false,
      contextIsolation: true
    }
  });

  // Inicializar Tray
  SystemTrayManager.initialize(mainWindow);

  // Evitar fechar ao clicar no X, apenas ocultar na bandeja
  mainWindow.on("close", (event) => {
    if (!isAppQuitting) {
      event.preventDefault();
      mainWindow?.hide();
    }
  });

  mainWindow.once("ready-to-show", () => {
    mainWindow?.show();
  });

  // Carregar UI (Vite dev server ou build estático)
  if (process.env.VITE_DEV_SERVER_URL) {
    await mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    await mainWindow.loadFile(path.join(__dirname, "../../dist/index.html"));
  }
}

app.whenReady().then(async () => {
  // 1. Inicializar Banco de Dados
  await initDatabase();

  // 2. Inicializar Rastreamento de Sessão Uptime
  const session = SessionTracker.initialize();
  NetworkEngine.setSessionId(session.id);

  // 3. Registrar IPC
  registerIpcHandlers();

  // 4. Criar Janela
  await createWindow();

  // 5. Iniciar Motor de Rede
  NetworkEngine.start(3000);

  // 6. Conectar eventos do motor à UI e Bandeja
  NetworkEngine.onStatusChange((status) => {
    SystemTrayManager.updateStatus(status);
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send(IPC_CHANNELS.NETWORK_STATUS_UPDATED, status);
    }
  });

  NetworkEngine.onOutageAlert((outage) => {
    const isIsp = outage.category === OutageCategory.ISP_EXTERNAL_FAILURE;
    SystemTrayManager.notifyOutage(
      isIsp ? "⚠️ Queda de Internet Detectada (ISP)" : "⚠️ Falha na Rede Local (Roteador)",
      isIsp
        ? "A conexão externa parou de responder, mas seu roteador local está comunicante. Registrando laudo pericial."
        : "O roteador e a internet estão inacessíveis. Verifique seu cabo ou Wi-Fi."
    );
  });
});

app.on("before-quit", () => {
  isAppQuitting = true;
  NetworkEngine.stop();
  SessionTracker.shutdown(SessionShutdownReason.NORMAL);
});

app.on("window-all-closed", () => {
  // Mantém processo rodando em segundo plano no Windows (System Tray)
  if (process.platform !== "win32") {
    app.quit();
  }
});
