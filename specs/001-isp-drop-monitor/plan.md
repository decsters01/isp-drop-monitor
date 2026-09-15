# Implementation Plan: Monitor Contínuo de Quedas e Auditoria de Conexão ISP

**Branch**: `001-isp-drop-monitor` | **Date**: 2026-09-15 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-isp-drop-monitor/spec.md`

## Summary

Implementação de um software desktop para Windows em **Electron com TypeScript**, com arquitetura modular e desacoplada em duas camadas:
1. **Core / Main Process:** Motor assíncrono de monitoramento contínuo em segundo plano que executa sondagens de dupla camada (Gateway local com fallback TCP + alvos externos de internet 1.1.1.1 e 8.8.8.8), rastreia sessões de uptime do PC com heartbeat a cada 30 segundos, persiste amostras em SQLite local e compila laudos periciais em PDF com Hash SHA-256 e ID Único de Emissão.
2. **UI / Renderer Process:** Interface gráfica profissional em **React com Tailwind CSS** (paleta Preto e Azul conforme diretrizes visuais do usuário), cards de resumo de rede, gráficos interativos de latência em tempo real, tabela com busca e filtros, operando com ícone discreto na bandeja do sistema (System Tray).

## Technical Context

**Language/Version**: TypeScript 5.x / Node.js 22 LTS (Main Process) + React 18+ (Renderer Process)

**Primary Dependencies**:
- Desktop Runtime: `electron`, `electron-builder`
- Rede & Sockets: Módulos nativos Node.js (`net.Socket`, `child_process.spawn`)
- Persistência Local: `better-sqlite3` (ou `sql.js` com persistência em arquivo seguro)
- Relatórios & Criptografia: `pdfkit`, módulo nativo `crypto` (Hash SHA-256)
- Interface & Estilização: `react`, `lucide-react`, `tailwindcss`, `recharts` / `chart.js`

**Storage**: SQLite local em modo Write-Ahead Logging (WAL) armazenado em `%APPDATA%/isp-drop-monitor/audit.db`

**Testing**: `vitest` para testes unitários do motor de rede e contratos; testes com simuladores de rede (mock de ICMP/TCP)

**Target Platform**: Windows 10 e Windows 11 (64-bit), executando estritamente sob credenciais normais de usuário (sem elevação UAC)

**Project Type**: Desktop Application com System Tray e Engine de Segundo Plano

**Performance Goals**:
- Consumo de CPU < 1% em repouso contínuo
- Consumo de banda de sondagem < 2 KB/min
- Renderização do dashboard a 60 FPS com throttling de eventos de rede
- Emissão de laudo PDF em menos de 5 segundos

**Constraints**:
- Não bloquear a thread da interface de usuário em nenhuma chamada de I/O de rede
- Operação 100% offline (nenhum dado de telemetria é enviado para a nuvem; privacidade total)
- Isolamento estrito entre núcleo de dados e interface gráfica via IPC tipado

**Scale/Scope**:
- Suporte para até 1 ano de histórico local sem degradação de performance
- Suporte para dezenas de milhares de amostras agregadas por consulta

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio Constitucional | Status | Justificativa Técnica no Design |
| :--- | :---: | :--- |
| **I. Integração Nativa com o Subsistema de Rede do Windows** | **PASS** | Utiliza comandos e sockets nativos assíncronos do Windows, sem polling excessivo e sem bloquear a interface de usuário. |
| **II. Arquitetura Desktop Modular e Desacoplada** | **PASS** | Separação estrita entre Main Process (motor de rede/SQLite) e Renderer (React UI), conectados exclusivamente por contratos IPC fortemente tipados. |
| **III. Resiliência de Conectividade e Observabilidade** | **PASS** | Suporte a Sleep/Resume via `powerMonitor`, detecção de desconexão de adaptadores, agrupamento de flapping (60s) e logs estruturados em SQLite. |
| **IV. Segurança, Privilégios Mínimos e Privacidade** | **PASS** | Não exige permissão de Administrador (evita raw sockets através de sockets normais e ping nativo). Nenhuma telemetria sai da máquina do usuário. |
| **V. Qualidade Orientada a Testes (Test-First & Simulation)** | **PASS** | Módulos de rede construídos sob interfaces mockáveis, permitindo simular perda de pacotes, latência e desconexões em suíte automatizada. |

## Project Structure

### Documentation (this feature)

```text
specs/001-isp-drop-monitor/
├── plan.md              # Este arquivo (plano de implementação técnica)
├── research.md          # Decisões de arquitetura e tecnologia (Phase 0)
├── data-model.md        # Esquema SQLite e máquinas de estado (Phase 1)
├── quickstart.md        # Guia de validação ponta a ponta (Phase 1)
├── contracts/           # Contratos IPC e schema do laudo pericial (Phase 1)
│   ├── ipc-channels.json
│   └── report-schema.json
└── checklists/
    └── requirements.md  # Checklist de conformidade e qualidade
```

### Source Code (repository root)

```text
src/
├── main/                              # Electron Main Process (Core & Background Engine)
│   ├── index.ts                       # Ponto de entrada do Electron, ciclo de vida da janela e Tray
│   ├── tray.ts                        # Gerenciamento do ícone na bandeja do sistema
│   ├── monitor/                       # Motor de auditoria de conectividade
│   │   ├── network-engine.ts          # Orquestrador do loop de sondagem
│   │   ├── icmp-probe.ts              # Sondagem ICMP para gateway e destinos externos
│   │   ├── tcp-fallback.ts            # Fallback de teste TCP (portas 53, 80, 443) para roteadores sem ping
│   │   ├── adapter-detector.ts        # Identificação de interface ativa (Wi-Fi vs Ethernet)
│   │   └── flapping-aggregator.ts     # Agrupador de oscilações rápidas em janela de 60s
│   ├── lifecycle/                     # Auditoria de ciclo de vida do PC
│   │   ├── session-tracker.ts         # Gerenciamento de sessões de boot e shutdown
│   │   └── heartbeat-service.ts       # Batimento a cada 30s em SQLite
│   ├── storage/                       # Camada de banco de dados
│   │   ├── database.ts                # Inicialização do SQLite e migrations
│   │   └── repositories/              # Consultas para sessões, amostras, quedas e laudos
│   ├── report/                        # Geração do laudo técnico pericial
│   │   ├── pdf-generator.ts           # Diagramação com PDFKit
│   │   └── integrity-signer.ts        # Cálculo do Hash SHA-256 e ID Único
│   └── ipc/                           # Handlers de comunicação IPC tipada
│       └── register-handlers.ts
│
├── preload/                           # Context Bridge seguro
│   └── index.ts                       # Exposição tipada de APIs do Electron para o Renderer
│
├── renderer/                          # Renderer Process (React Desktop UI)
│   ├── src/
│   │   ├── App.tsx                    # Layout principal (Paleta Preto e Azul)
│   │   ├── components/
│   │   │   ├── StatusHeader.tsx       # Indicador em tempo real e tipo de conexão (Wi-Fi / Cabo)
│   │   │   ├── MetricCards.tsx        # Cards: Status, Disponibilidade %, Quedas e Latência Média
│   │   │   ├── LatencyChart.tsx       # Gráfico em tempo real de latência local vs externa
│   │   │   ├── OutagesTable.tsx       # Tabela interativa com busca, paginação e filtros
│   │   │   └── ReportModal.tsx        # Modal para preencher dados e exportar laudo em PDF
│   │   ├── hooks/                     # Hooks de estado e assinatura de eventos IPC
│   │   └── styles/
│   │       └── index.css              # Configurações de Tailwind CSS
│
└── shared/                            # Tipos compartilhados entre Main e Renderer
    ├── types.ts                       # Interfaces e Enums com exaustividade TypeScript
    └── ipc-channels.ts                # Nomes dos canais de IPC
```

## Complexity Tracking

*Nenhuma violação constitucional detectada. Todas as restrições foram atendidas com a arquitetura proposta.*
