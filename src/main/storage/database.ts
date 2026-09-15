import fs from "node:fs";
import path from "node:path";
import initSqlJs, { Database } from "sql.js";

let dbInstance: Database | null = null;
let dbFilePath: string = "";

export function getDatabasePath(): string {
  const appData = process.env.APPDATA || process.env.USERPROFILE || ".";
  const targetDir = path.join(appData, "isp-drop-monitor");
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  return path.join(targetDir, "audit.db");
}

export async function initDatabase(customPath?: string): Promise<Database> {
  if (dbInstance) {
    return dbInstance;
  }

  const SQL = await initSqlJs();
  dbFilePath = customPath || getDatabasePath();

  if (fs.existsSync(dbFilePath)) {
    const fileBuffer = fs.readFileSync(dbFilePath);
    dbInstance = new SQL.Database(fileBuffer);
  } else {
    dbInstance = new SQL.Database();
  }

  // Criação das tabelas
  dbInstance.run(`
    CREATE TABLE IF NOT EXISTS operational_sessions (
      id TEXT PRIMARY KEY,
      boot_time INTEGER NOT NULL,
      shutdown_time INTEGER,
      last_heartbeat INTEGER NOT NULL,
      shutdown_reason TEXT NOT NULL,
      os_version TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS connectivity_samples (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL,
      timestamp INTEGER NOT NULL,
      gateway_ip TEXT NOT NULL,
      gateway_latency_ms REAL,
      gateway_loss_pct REAL NOT NULL,
      gateway_method TEXT NOT NULL,
      external_latency_ms REAL,
      external_loss_pct REAL NOT NULL,
      interface_type TEXT NOT NULL,
      interface_name TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS outage_events (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      start_time INTEGER NOT NULL,
      end_time INTEGER,
      duration_seconds INTEGER,
      category TEXT NOT NULL,
      event_type TEXT NOT NULL,
      packet_loss_avg REAL NOT NULL,
      gateway_status TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS audit_reports (
      id TEXT PRIMARY KEY,
      created_at INTEGER NOT NULL,
      period_start INTEGER NOT NULL,
      period_end INTEGER NOT NULL,
      customer_name TEXT,
      isp_name TEXT,
      contract_number TEXT,
      incident_protocol TEXT,
      total_uptime_sec INTEGER NOT NULL,
      total_downtime_sec INTEGER NOT NULL,
      availability_pct REAL NOT NULL,
      outages_count INTEGER NOT NULL,
      sha256_hash TEXT NOT NULL,
      pdf_path TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_samples_timestamp ON connectivity_samples(timestamp);
    CREATE INDEX IF NOT EXISTS idx_outages_starttime ON outage_events(start_time);
  `);

  persistDatabase();
  return dbInstance;
}

export function persistDatabase(): void {
  if (!dbInstance || !dbFilePath || dbFilePath === ":memory:") return;
  try {
    const data = dbInstance.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbFilePath, buffer);
  } catch (err) {
    console.error("Erro ao persistir banco de dados:", err);
  }
}

export function getDatabase(): Database {
  if (!dbInstance) {
    throw new Error("Banco de dados não inicializado. Chame initDatabase() primeiro.");
  }
  return dbInstance;
}
