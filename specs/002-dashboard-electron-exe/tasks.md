---
description: "Task list for Dashboard Dark Profissional e Empacotamento Executável Electron"
---

# Tasks: Dashboard Dark Profissional e Empacotamento Executável Electron

**Input**: Design documents from `/specs/002-dashboard-electron-exe/`  
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `quickstart.md`  
**Organization**: Tarefas agrupadas por histórias de usuário com foco no dashboard analítico escuro e empacotamento do instalador Windows.

## Format: `- [ ] [ID] [P?] [Story?] Description with file path`
- **[P]**: Paralelizável (arquivos distintos, sem dependência bloqueante)
- **[Story]**: Rótulo da história correspondente ([US1], [US2])

---

## Phase 1: Setup (Infraestrutura de Build e Assets)

**Purpose**: Configuração das ferramentas de empacotamento e criação dos ícones de alta resolução

- [ ] T001 Configurar electron-builder com target NSIS e portable em package.json
- [ ] T002 [P] Gerar e registrar asset de ícone oficial de alta resolução para o instalador em build/icon.ico e build/icon.png

---

## Phase 2: Foundational (Métricas Analíticas e Canais IPC)

**Purpose**: Suporte a dados históricos agregados para múltiplos gráficos

- [ ] T003 [P] Definir tipos DailyMetricsSummary e QualityDistribution em src/shared/types.ts
- [ ] T004 [P] Implementar consultas de agregação dos últimos 7 dias e distribuição de faixas de latência em src/main/storage/repositories/sample-repository.ts
- [ ] T005 Registrar novo canal IPC analítico em src/main/ipc/register-handlers.ts, src/shared/ipc-channels.ts e src/preload/index.ts

**Checkpoint**: Camada de dados pronta para alimentar múltiplos gráficos.

---

## Phase 3: User Story 1 - Dashboard Dark Multi-Gráficos (Priority: P1) 🎯 MVP

**Goal**: Interface moderna e de alto contraste Preto e Azul com múltiplos gráficos analíticos e cards responsivos.

**Independent Test**: Abrir o dashboard: os três gráficos (tempo real de latência, distribuição de qualidade e barras dos últimos 7 dias) devem carregar simultaneamente de forma fluida a 60 FPS com efeitos de hover em cards e linhas.

- [ ] T006 [P] [US1] Implementar componente de gráfico de barras de estabilidade dos últimos 7 dias em src/renderer/src/components/DailyStabilityChart.tsx
- [ ] T007 [P] [US1] Implementar painel analítico de distribuição de qualidade de conexão em src/renderer/src/components/QualityDistribution.tsx
- [ ] T008 [US1] Integrar a grade multi-gráficos responsiva e controles visuais no tema Dark em src/renderer/src/App.tsx

**Checkpoint**: Dashboard Dark enriquecido com múltiplos gráficos analíticos funcional.

---

## Phase 4: User Story 2 - Empacotamento do Executável Windows (.exe) (Priority: P2)

**Goal**: Produzir o instalador executável oficial `.exe` e a versão portátil para Windows 10/11 x64.

**Independent Test**: Executar `npm run build:exe` e verificar a criação bem-sucedida do instalador `.exe` funcional na pasta `release/`.

- [ ] T009 [US2] Executar o pipeline de empacotamento e compilar o instalador executável oficial (.exe) na pasta release/

---

## Phase 5: Polish & Quality

**Purpose**: Verificação de conformidade, validação de regras de código e testes

- [ ] T010 [P] Executar testes unitários e auditoria de ausência de imports inline e exaustividade TypeScript em todo o código
