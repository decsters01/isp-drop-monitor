# Implementation Plan: Dashboard Dark Profissional e Empacotamento Executável Electron

**Branch**: `002-dashboard-electron-exe` | **Date**: 2026-09-15 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-dashboard-electron-exe/spec.md`

## Summary

Implementação do empacotamento executável oficial para Windows (`.exe` instalador NSIS e portátil via `electron-builder`) e enriquecimento do dashboard dark profissional com múltiplos gráficos analíticos (linha de latência em tempo real + barras diárias de estabilidade + histograma de qualidade), garantindo uma experiência desktop de alto nível na paleta Preto e Azul.

## Technical Context

**Language/Version**: TypeScript 5.x / Node.js 22 LTS / React 18 / Electron 33

**Primary Dependencies**:
- Empacotador: `electron-builder`
- Interface: `react`, `lucide-react`, `tailwindcss`
- Runtime & Core: `pdfkit`, `sql.js`

**Storage**: SQLite local (`%APPDATA%/isp-drop-monitor/audit.db`)

**Testing**: `vitest`

**Target Platform**: Windows 10 e Windows 11 (x64)

**Project Type**: Desktop Application com Instalador Autônomo Windows (.exe)

**Performance Goals**:
- Geração do build executável em menos de 180 segundos
- Inicialização do aplicativo empacotado em < 2 segundos
- Interface a 60 FPS com tema Dark de alto contraste

**Constraints**:
- Instalação no escopo do usuário (`perMachine: false`) sem necessidade de privilégios de Administrador
- Zero dependências de runtime externas na máquina do usuário final

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio Constitucional | Status | Justificativa Técnica no Design |
| :--- | :---: | :--- |
| **I. Integração Nativa Windows** | **PASS** | Executável compatível com Windows 10/11 x64, integração com Tray e atalhos de sistema. |
| **II. Arquitetura Modular e Desacoplada** | **PASS** | O empacotamento preserva o isolamento de processos (Main/Preload/Renderer). |
| **III. Resiliência de Conectividade** | **PASS** | Dashboard suporta estados de rede offline/desconectada sem erros. |
| **IV. Segurança e Menor Privilégio** | **PASS** | Instalador NSIS configurado sem elevação UAC obrigatória. |
| **V. Testes Automatizados** | **PASS** | Suíte Vitest integrada validando agregações de múltiplos gráficos. |

## Project Structure

### Documentation (this feature)

```text
specs/002-dashboard-electron-exe/
├── plan.md              # Este documento
├── research.md          # Pesquisa de empacotamento NSIS e múltiplos gráficos
├── data-model.md        # Modelos diários de agregação e distribuição de qualidade
├── quickstart.md        # Guia de build e teste do instalador executável
└── checklists/
    └── requirements.md  # Checklist de requisitos
```

### Source Code Impact

```text
package.json                              # Configuração de build do electron-builder e scripts
src/
├── main/
│   └── storage/
│       └── repositories/
│           └── sample-repository.ts      # Adição de agregação de histórico diário e distribuição
├── renderer/
│   └── src/
│       ├── components/
│       │   ├── DailyStabilityChart.tsx   # Novo gráfico de barras de estabilidade dos últimos 7 dias
│       │   ├── QualityDistribution.tsx   # Novo painel de distribuição percentual de qualidade
│       │   └── LatencyChart.tsx          # Gráfico de tempo real refinado
│       └── App.tsx                       # Integração dos múltiplos gráficos no Dashboard Dark
build/
└── icon.ico                              # Ícone oficial de alta resolução para o executável
```

## Complexity Tracking

*Nenhuma violação constitucional detectada.*
