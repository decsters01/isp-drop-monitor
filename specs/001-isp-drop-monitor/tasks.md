---
description: "Task list for Monitor Contínuo de Quedas e Auditoria ISP"
---

# Tasks: Monitor Contínuo de Quedas e Auditoria ISP

**Input**: Design documents from `/specs/001-isp-drop-monitor/`  
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`  
**Organization**: As tarefas estão estruturadas por histórias de usuário para permitir entrega incremental, validação independente e implementação modular.

## Format: `- [ ] [ID] [P?] [Story?] Description with file path`
- **[P]**: Tarefas paralelizáveis (arquivos distintos, sem dependência bloqueante)
- **[Story]**: Rótulo da história de usuário correspondente ([US1], [US2], [US3], [US4])

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Inicialização do projeto Electron + TypeScript com React e ferramentas base

- [x] T001 Inicializar estrutura do projeto Electron + TypeScript com Vite e React em package.json, tsconfig.json e vite.config.ts
- [x] T002 [P] Configurar Tailwind CSS com a paleta Preto e Azul profissional (#0B0F19 fundo escuro, #1E293B cartões, #3B82F6 azul primário) em tailwind.config.js e src/renderer/src/styles/index.css
- [x] T003 [P] Configurar ambiente de testes unitários com Vitest em vitest.config.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Infraestrutura central de tipos, banco de dados SQLite local e comunicação IPC

*CRITICAL: Nenhuma história de usuário pode ser iniciada antes da conclusão desta fase.*

- [x] T004 [P] Definir tipos compartilhados, enums e contratos com checagem exaustiva de tipos em src/shared/types.ts e src/shared/ipc-channels.ts
- [x] T005 [P] Implementar inicialização do SQLite em modo Write-Ahead Logging (WAL) e migração de tabelas em src/main/storage/database.ts
- [x] T006 [P] Implementar repositórios de banco de dados para sessões, amostras, eventos de queda e laudos em src/main/storage/repositories/
- [x] T007 Implementar ContextBridge seguro com isolamento de contexto (preload) em src/preload/index.ts
- [x] T008 Configurar barramento e registro de canais IPC tipados do Electron em src/main/ipc/register-handlers.ts
- [x] T009 Implementar ciclo de vida da janela principal e configuração de inicialização em src/main/index.ts

**Checkpoint**: Fundação concluída. Os motores e componentes visuais das histórias de usuário podem ser desenvolvidos.

---

## Phase 3: User Story 1 - Auditoria Contínua em Dupla Camada (Priority: P1) 🎯 MVP

**Goal**: Monitoramento assíncrono ininterrupto com sondagem simultânea do gateway local e internet externa, classificando falha externa da operadora vs. falha interna do roteador.

**Independent Test**: Simular perda de internet externa mantendo o gateway local ativo (ou desconectar a fibra do roteador). O sistema deve acusar "Falha Externa do Provedor (ISP)" após 5 segundos contínuos e fechar o evento ao restabelecer a conexão.

### Tests for User Story 1
- [x] T010 [P] [US1] Implementar testes unitários para a lógica de detecção de quedas e segregação de culpa em tests/unit/network-engine.test.ts

### Implementation for User Story 1
- [x] T011 [P] [US1] Implementar detector nativo de interface ativa (Wi-Fi vs Cabo Ethernet) e descoberta de Gateway Padrão do Windows em src/main/monitor/adapter-detector.ts
- [x] T012 [P] [US1] Implementar motor de sondagem ICMP com baixo overhead para gateway e destinos públicos (1.1.1.1 e 8.8.8.8) em src/main/monitor/icmp-probe.ts
- [x] T013 [P] [US1] Implementar fallback automático para TCP SYN nas portas 53, 80 e 443 para roteadores locais que bloqueiam ICMP em src/main/monitor/tcp-fallback.ts
- [x] T014 [US1] Implementar agrupador de oscilações rápidas repetitivas (flapping em janela de 60s) em src/main/monitor/flapping-aggregator.ts
- [x] T015 [US1] Implementar orquestrador do loop assíncrono de auditoria de conectividade em src/main/monitor/network-engine.ts
- [x] T016 [US1] Implementar rotina de persistência periódica de amostras e fechamento de eventos de queda em src/main/storage/repositories/outage-repository.ts

**Checkpoint**: User Story 1 funcional de ponta a ponta em background (MVP de auditoria consolidado).

---

## Phase 4: User Story 2 - Registro de Ciclo de Vida da Máquina (Priority: P2)

**Goal**: Mapear os horários de início e encerramento de operação do computador para calcular a disponibilidade líquida da internet estritamente baseada no tempo em que a máquina esteve ligada.

**Independent Test**: Ligar a máquina, operar por alguns minutos, fechar a aplicação ou simular encerramento: verificar se a sessão foi registrada com início e término precisos e se períodos desligados não geraram falsas quedas de rede.

### Tests for User Story 2
- [x] T017 [P] [US2] Implementar testes unitários para o cálculo de uptime real e detecção de crash/sleep em tests/unit/lifecycle.test.ts

### Implementation for User Story 2
- [x] T018 [P] [US2] Implementar serviço de batimento contínuo (heartbeat a cada 30 segundos) sem necessidade de privilégios de Administrador em src/main/lifecycle/heartbeat-service.ts
- [x] T019 [US2] Implementar gerenciador de sessões com captura de boot, shutdown normal, crash anômalo e integração com powerMonitor (Sleep/Resume) em src/main/lifecycle/session-tracker.ts
- [x] T020 [US2] Implementar agregação estatística de uptime líquido e percentual de disponibilidade proporcional em src/main/storage/repositories/session-repository.ts

**Checkpoint**: Histórico de ciclo de vida do Windows integrado e auditável.

---

## Phase 5: User Story 3 - Geração e Exportação de Laudo Pericial em PDF (Priority: P3)

**Goal**: Compilar os dados de auditoria em um documento PDF formal e diagramado com Hash Criptográfico SHA-256 e ID Único de Emissão, pronto para anexar em reclamações perante o provedor, Procon ou Anatel.

**Independent Test**: Selecionar um período no histórico e acionar a exportação: um arquivo PDF profissional com carimbo de data/hora, resumo executivo de disponibilidade, gráfico consolidado e código SHA-256 deve ser gerado em menos de 5 segundos.

### Tests for User Story 3
- [x] T021 [P] [US3] Implementar testes para compilação de dados do laudo e geração do Hash SHA-256 em tests/unit/report-generator.test.ts

### Implementation for User Story 3
- [x] T022 [P] [US3] Implementar cálculo canônico do Hash Criptográfico SHA-256 e geração de UUID de autenticidade pericial em src/main/report/integrity-signer.ts
- [x] T023 [US3] Implementar diagramação vetorial do Laudo Pericial em PDF com PDFKit (cabeçalho oficial, dados cadastrais, resumo de disponibilidade e tabela de quedas) em src/main/report/pdf-generator.ts
- [x] T024 [US3] Implementar canal IPC de geração de relatório e diálogo nativo de salvamento de arquivo do Windows em src/main/ipc/report-ipc.ts

**Checkpoint**: Emissão de laudos periciais auditáveis 100% operacional.

---

## Phase 6: User Story 4 - Visualização em Tempo Real e Indicadores na Bandeja (Priority: P4)

**Goal**: Interface gráfica rica e profissional em React com paleta Preto e Azul, gráficos de latência em tempo real, cards de resumo métrico, tabela interativa com busca/filtros e operação discreta na bandeja do sistema (System Tray).

**Independent Test**: Iniciar a aplicação minimizada na bandeja do sistema, abrir o dashboard interativo, verificar a oscilação de latência em tempo real nos gráficos, filtrar eventos na tabela e acionar a emissão do laudo pelo modal.

### Implementation for User Story 4
- [x] T025 [P] [US4] Implementar gerenciamento do ícone na bandeja do sistema (System Tray), menus de contexto e notificações nativas do Windows em src/main/tray.ts
- [x] T026 [P] [US4] Implementar componente de cabeçalho de status da rede com identificação de interface (Wi-Fi vs Cabo) em src/renderer/src/components/StatusHeader.tsx
- [x] T027 [P] [US4] Implementar cards de resumo métrico (Status da Conexão, Taxa de Disponibilidade %, Quedas Registradas e Latência Média) com efeitos hover em src/renderer/src/components/MetricCards.tsx
- [x] T028 [P] [US4] Implementar gráfico interativo de linha do tempo de latência em tempo real (Gateway vs Internet) em src/renderer/src/components/LatencyChart.tsx
- [x] T029 [P] [US4] Implementar tabela interativa de eventos de quedas com busca textual, paginação e filtros por categoria em src/renderer/src/components/OutagesTable.tsx
- [x] T030 [US4] Implementar modal interativo para preenchimento de dados do assinante/protocolo e exportação do laudo em src/renderer/src/components/ReportModal.tsx
- [x] T031 [US4] Integrar todos os componentes visuais e assinaturas reativas de IPC no painel principal em src/renderer/src/App.tsx

**Checkpoint**: Aplicação desktop completa, fluida e com experiência visual moderna.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Verificação de portões de qualidade, testes ponta a ponta e otimização de recursos

- [x] T032 [P] Executar validação completa dos 5 cenários do guia em specs/001-isp-drop-monitor/quickstart.md
- [x] T033 [P] Auditar conformidade com as regras de importações no topo (sem inline imports) e exaustividade TypeScript (never checks em switches) em toda a base de código
- [x] T034 Validar o consumo de recursos sob regime contínuo garantindo CPU < 1% e tráfego de sondagem < 2 KB/min

---

## Dependencies & Execution Order

### Phase Dependencies
- **Setup (Phase 1)**: Sem dependências prévias.
- **Foundational (Phase 2)**: Depende da Phase 1. Bloqueia todas as histórias de usuário.
- **User Story 1 (Phase 3 - P1 MVP)**: Depende da Phase 2. Estabelece o motor central de rede.
- **User Story 2 (Phase 4 - P2)**: Depende da Phase 2. Pode ser desenvolvida em paralelo ou sequencialmente à US1.
- **User Story 3 (Phase 5 - P3)**: Depende dos dados estruturados em US1 e US2.
- **User Story 4 (Phase 6 - P4)**: Depende da infraestrutura IPC e modelos das histórias anteriores para exibição completa.
- **Polish (Phase 7)**: Depende da conclusão das fases anteriores.

### Oportunidades de Execução Paralela
- Na Phase 1: `T002` (Tailwind) e `T003` (Vitest) podem rodar em paralelo após `T001`.
- Na Phase 2: `T004` (Tipos), `T005` (SQLite), `T006` (Repositórios) podem ser implementados em paralelo.
- Na Phase 3: `T010` (Testes), `T011` (Adaptadores), `T012` (ICMP) e `T013` (TCP Fallback) são paralelizáveis.
- Na Phase 6: Os componentes React `T026`, `T027`, `T028`, `T029` operam em arquivos independentes e podem ser codificados em paralelo antes da integração em `T031`.

---

## Implementation Strategy

### MVP First (User Story 1 - Motor de Auditoria)
1. Concluir Setup (Phase 1) e Foundational (Phase 2).
2. Implementar User Story 1 (Phase 3).
3. **Validar MVP**: O motor detecta e registra quedas do ISP com gateway local comunicante de forma 100% autônoma.

### Entrega Incremental
1. MVP funcional (captura de rede).
2. Adição do ciclo de vida do Windows (US2).
3. Adição da emissão pericial de laudos em PDF (US3).
4. Adição da interface rica com bandeja e dashboard Preto e Azul (US4).
5. Polimento final e auditoria de recursos (Phase 7).
