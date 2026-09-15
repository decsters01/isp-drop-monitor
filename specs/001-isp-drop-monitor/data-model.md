# Data Model: Monitor Contínuo de Quedas e Auditoria ISP

**Feature**: `001-isp-drop-monitor` | **Date**: 2026-09-15

Este documento define o modelo de dados relacional e entidades em memória para o motor de auditoria de rede local.

---

## Esquema do Banco de Dados SQLite

### 1. Tabela: `operational_sessions` (Sessões do PC)
Registra cada período em que o computador permaneceu ligado e em operação.

| Campo | Tipo | Restrições | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | TEXT / UUID | PRIMARY KEY | Identificador único da sessão |
| `boot_time` | INTEGER | NOT NULL | Timestamp UNIX (ms) de início da sessão |
| `shutdown_time` | INTEGER | NULL | Timestamp UNIX (ms) de encerramento da sessão |
| `last_heartbeat` | INTEGER | NOT NULL | Timestamp UNIX (ms) do último batimento gravado |
| `shutdown_reason`| TEXT | NOT NULL | `NORMAL`, `UNEXPECTED_CRASH`, `SUSPENDED`, `RUNNING` |
| `os_version` | TEXT | NOT NULL | Versão do Windows detectada |

### 2. Tabela: `connectivity_samples` (Amostras de Rede)
Registra cada ciclo de sondagem executado pelo motor de auditoria.

| Campo | Tipo | Restrições | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | Identificador sequencial |
| `session_id` | TEXT | NOT NULL, REFERENCES `operational_sessions(id)` | Sessão operacional ativa |
| `timestamp` | INTEGER | NOT NULL | Timestamp UNIX (ms) da verificação |
| `gateway_ip` | TEXT | NOT NULL | Endereço IP do gateway local (roteador) |
| `gateway_latency_ms` | REAL | NULL | Latência para o gateway (-1 ou NULL em perda) |
| `gateway_loss_pct` | REAL | NOT NULL | Perda de pacotes no gateway (0% a 100%) |
| `gateway_method` | TEXT | NOT NULL | `ICMP` ou `TCP_FALLBACK` |
| `external_latency_ms`| REAL | NULL | Latência média para a internet externa (ms) |
| `external_loss_pct` | REAL | NOT NULL | Perda média para alvos externos (0% a 100%) |
| `interface_type` | TEXT | NOT NULL | `ETHERNET`, `WIFI`, `OTHER` |
| `interface_name` | TEXT | NOT NULL | Nome do adaptador de rede ativo no Windows |

### 3. Tabela: `outage_events` (Eventos Consolidados de Queda / Instabilidade)
Registra eventos de indisponibilidade ou instabilidade severa apurados pelo motor de análise.

| Campo | Tipo | Restrições | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | TEXT / UUID | PRIMARY KEY | Identificador único do evento de queda |
| `session_id` | TEXT | NOT NULL, REFERENCES `operational_sessions(id)` | Sessão operacional correspondente |
| `start_time` | INTEGER | NOT NULL | Timestamp UNIX (ms) do início da interrupção |
| `end_time` | INTEGER | NULL | Timestamp UNIX (ms) do retorno da estabilidade |
| `duration_seconds` | INTEGER | NULL | Duração calculada da queda em segundos |
| `category` | TEXT | NOT NULL | `ISP_EXTERNAL_FAILURE`, `LOCAL_ROUTER_FAILURE`, `UNCLASSIFIED` |
| `event_type` | TEXT | NOT NULL | `CONTINUOUS_OUTAGE` (>=5s) ou `FLAPPING_WINDOW` (<60s) |
| `packet_loss_avg` | REAL | NOT NULL | Percentual médio de pacotes perdidos no evento |
| `gateway_status` | TEXT | NOT NULL | `REACHABLE` ou `UNREACHABLE` |

### 4. Tabela: `audit_reports` (Histórico de Laudos Periciais Gerados)
Registra os relatórios periciais formalmente exportados para arquivo PDF.

| Campo | Tipo | Restrições | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | TEXT / UUID | PRIMARY KEY | Identificador único do laudo pericial |
| `created_at` | INTEGER | NOT NULL | Timestamp UNIX (ms) da geração do laudo |
| `period_start` | INTEGER | NOT NULL | Início do período auditado |
| `period_end` | INTEGER | NOT NULL | Fim do período auditado |
| `customer_name` | TEXT | NULL | Nome do titular da assinatura de internet |
| `isp_name` | TEXT | NULL | Nome da operadora de telecomunicações |
| `contract_number`| TEXT | NULL | Número do contrato ou código de assinante |
| `incident_protocol`| TEXT | NULL | Protocolo de atendimento sob contestação |
| `total_uptime_sec`| INTEGER | NOT NULL | Tempo total em que o computador esteve ligado |
| `total_downtime_sec`| INTEGER| NOT NULL | Tempo total de indisponibilidade imputada ao ISP |
| `availability_pct`| REAL | NOT NULL | Taxa percentual de disponibilidade (Uptime Líquido) |
| `outages_count` | INTEGER | NOT NULL | Quantidade de ocorrências de queda registradas |
| `sha256_hash` | TEXT | NOT NULL | Hash criptográfico do conteúdo probatório |
| `pdf_path` | TEXT | NOT NULL | Caminho do arquivo PDF salvo em disco |

---

## Máquinas de Estado

### Estado do Monitoramento de Conexão (`ConnectionMonitorState`)

```text
[ONLINE_ESTAVEL]
       │
       ▼ (Perda externa >= 5s contínuos com gateway acessível)
[QUEDA_EXTERNA_ISP] ──(Sondagem externa restabelecida)──► [ONLINE_ESTAVEL]
       │
       ▼ (Gateway local e internet inacessíveis)
[QUEDA_LOCAL_ROTEADOR] ──(Gateway e internet restabelecidos)──► [ONLINE_ESTAVEL]
       │
       ▼ (Múltiplas alternâncias em intervalo < 60s)
[INSTABILIDADE_FLAPPING] ──(60s sem oscilações)──► [ONLINE_ESTAVEL]
```

### Ciclo de Vida da Sessão Operacional (`SessionState`)

```text
[INICIALIZADA] ──► [RUNNING] ──(Heartbeat a cada 30s)──► [RUNNING]
                     │  │
                     │  └──(Evento de suspensão do SO)──► [SUSPENDED] ──(Resume)──► [RUNNING]
                     │
                     └──(Evento de encerramento normal)──► [CLOSED_NORMAL]
                     │
                     └──(Corte de energia / Crash detectado no boot seguinte)──► [CLOSED_CRASH]
```
