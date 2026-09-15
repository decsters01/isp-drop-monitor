# Data Model: Dashboard Dark e Executável Electron

**Feature**: `002-dashboard-electron-exe` | **Date**: 2026-09-15

## Novas Estruturas e Entidades

### 1. Modelo de Agregação Diária (`DailyMetricsSummary`)
Utilizado para alimentar o gráfico de barras comparativo de Uptime vs. Quedas do ISP dos últimos 7 dias.

| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `dateLabel` | string | Ex: "Seg 14/09" |
| `uptimeHours` | number | Horas em que o PC esteve operacional |
| `downtimeMinutes` | number | Minutos acumulados de indisponibilidade do ISP |
| `outagesCount` | number | Total de quedas no dia |
| `availabilityPct` | number | Percentual líquido de disponibilidade |

### 2. Modelo de Distribuição de Qualidade (`QualityDistribution`)
Utilizado para o gráfico analítico de qualidade de conexão.

| Faixa | Critério | Cor no Tema Dark |
| :--- | :--- | :--- |
| **Ótima** | Latência < 25ms e 0% perda | Emerald (`#34D399`) |
| **Normal** | Latência 25ms - 50ms e 0% perda | Brand Blue (`#3B82F6`) |
| **Instável** | Latência > 50ms ou perda < 100% | Amber (`#F59E0B`) |
| **Queda** | Perda = 100% | Rose (`#F43F5E`) |

### 3. Configuração de Build do Electron (`ElectronBuildConfig`)
Configurações do instalador NSIS para o `electron-builder`.

- `appId`: `com.isp.dropmonitor`
- `productName`: "Monitor de Conexão ISP"
- `artifactName`: "Monitor-Conexao-ISP-Setup-${version}.${ext}"
- `target`: `nsis` e `portable`
- `perMachine`: `false` (instalação direta no perfil do usuário sem UAC)
