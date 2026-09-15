# Technical Research & Architecture Decisions: Dashboard Dark e Executável Electron

**Feature**: `002-dashboard-electron-exe` | **Date**: 2026-09-15

## 1. Empacotamento Executável para Windows (.exe)

- **Decision**: Configurar `electron-builder` com destino Windows NSIS (Instalador de clique único com suporte a modo portátil e atalhos na Área de Trabalho/Menu Iniciar).
- **Rationale**:
  - O formato NSIS é o padrão de ouro para distribuição de software desktop no ecossistema Windows (Windows 10 e 11).
  - Permite configurar instalação no escopo do usuário atual (`perMachine: false`), eliminando a necessidade de permissões de Administrador (UAC) para instalar, em estrita conformidade com o Princípio IV da Constituição.
  - Oferece empacotamento em ASAR compacto com descompactação automática das bibliotecas nativas e WebAssembly do SQLite.
- **Alternatives considered**:
  - *Inno Setup manual*: Requer scripts adicionais externos que complicam o pipeline automatizado de CI/CD.
  - *MSIX*: Exige assinatura digital e certificados corporativos pagos ou conta de desenvolvedor da Microsoft Store.

## 2. Ícone Profissional e Identidade Visual

- **Decision**: Geração de arquivo `.ico` multipágina (256x256, 128x128, 64x64, 48x48, 32x32, 16x16) e assets correspondentes para a bandeja do sistema (System Tray) e instalador.
- **Rationale**: Garante renderização nítida tanto no atalho da Área de Trabalho em telas 4K quanto no ícone minúsculo de 16x16 pixels na bandeja do relógio do Windows.

## 3. Arquitetura dos Múltiplos Gráficos Analíticos

- **Decision**: Componente modular multi-gráfico contendo:
  1. *Gráfico de Linha em Tempo Real:* Sondagem contínua de dupla camada (Gateway vs. Internet) com taxa de 60 FPS e buffer deslizante das últimas 30 amostras.
  2. *Gráfico de Estabilidade e Perda de Pacotes:* Histograma visual por faixas de qualidade (Conexão Ótima, Oscilação Leve, Instabilidade e Queda Total).
  3. *Gráfico de Histórico Diário:* Barras empilhadas dos últimos 7 dias comparando horas de Uptime do PC vs. minutos de Downtime do Provedor.
- **Rationale**: Atende diretamente à diretriz de dashboard robusto e analítico do usuário, permitindo comprovar a reincidência de falhas ao longo dos dias.
