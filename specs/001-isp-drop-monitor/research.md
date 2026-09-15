# Technical Research & Architecture Decisions: Monitor Contínuo de Quedas e Auditoria ISP

**Feature**: `001-isp-drop-monitor` | **Date**: 2026-09-15

## 1. Engine Desktop e Runtime

- **Decision**: Electron com TypeScript (Node.js 22 LTS no Main Process + React no Renderer Process).
- **Rationale**:
  - O Node.js fornece acesso nativo ao sistema operacional Windows (sockets TCP nativos para fallback, subprocessos assíncronos não-bloqueantes para execução otimizada de ping do Windows, APIs de gerenciamento de energia `powerMonitor` para detecção de Sleep/Resume e Tray nativo do Windows).
  - A interface com React + Tailwind CSS viabiliza a construção ágil do dashboard responsivo com paleta Preto e Azul profissional, cards de métricas, gráficos interativos e tabela de histórico com filtros.
  - Total conformidade com as regras de TypeScript do projeto (importações no topo, tratamento exaustivo com `never` em switch statements).
- **Alternatives considered**:
  - *.NET WPF/WinUI*: Excelente integração Windows, porém desenvolvimento de gráficos dinâmicos modernos e design web sofisticado é mais custoso e rígido.
  - *Python com PyQt6*: Boa portabilidade, mas o empacotamento de executáveis via PyInstaller frequentemente gera falsos positivos em antivírus do Windows e tamanho excessivo.
  - *Tauri (Rust)*: Muito leve, mas adicionaria complexidade de compilação em Rust no ambiente Windows sem necessidade prévia.

## 2. Motor de Sondagem de Rede e Detecção de Quedas (Dual-Layer Engine)

- **Decision**: Módulo assíncrono em Node.js com execução periódica de ICMP e Fallback TCP (`net.Socket`).
  - *Alvo 1 (Local):* Gateway padrão obtido dinamicamente via comando nativo do Windows (`Get-NetRoute` ou `route print`). É testado via ping ICMP e, se falhar ou houver bloqueio de ping, testa conexão TCP SYN nas portas 53 (DNS), 80 (HTTP) ou 443 (HTTPS) com timeout estrito de 1000ms.
  - *Alvos 2 e 3 (Internet):* Cloudflare (`1.1.1.1`) e Google (`8.8.8.8`).
- **Rationale**:
  - O uso de `net.Socket` no Node.js dispensa privilégios de Administrador (raw sockets exigiriam elevação UAC no Windows).
  - Permite classificar instantaneamente se o problema está na rede interna (Wi-Fi/modem) ou no link da operadora.
  - Um loop assíncrono isolado em thread de worker/background assegura impacto nulo na interface gráfica (< 1% CPU).
- **Alternatives considered**:
  - *Raw Socket ICMP*: Requer privilégios de Administrador no Windows, violando o Princípio IV da Constituição.
  - *HTTP Fetch em sites comuns*: Adiciona overhead de HTTP/TLS e depende da disponibilidade de aplicações web de terceiros, enquanto DNS público responde com latência pura de rede.

## 3. Estratégia Híbrida de Ciclo de Vida do PC (Uptime/Downtime)

- **Decision**: Heartbeat contínuo persistido em SQLite a cada 30 segundos + eventos de `powerMonitor` do Electron (`suspend`, `resume`, `shutdown`) + leitura do log de eventos do Windows (IDs 6005/6006) via PowerShell assíncrono.
- **Rationale**:
  - O heartbeat de 30s garante que qualquer queda súbita de energia (corte de força / tela azul) seja detectada na inicialização seguinte pela discrepância entre o último heartbeat e o horário atual da máquina.
  - Os eventos de `suspend` e `resume` do `powerMonitor` do Electron eliminam falsos positivos durante o modo de suspensão/hibernação do Windows.
- **Alternatives considered**:
  - *Apenas Windows Event Log*: Pode falhar ou ter acesso negado em ambientes corporativos ou contas restritas de usuário padrão.

## 4. Persistência de Dados Local

- **Decision**: SQLite embutido em modo WAL (Write-Ahead Logging).
- **Rationale**:
  - O SQLite é leve, transacional, altamente confiável contra falhas de energia (ACID) e não requer servidor externo instalado.
  - Permite consultas analíticas rápidas de agregados temporais (disponibilidade semanal, média de latência diária) em frações de milissegundo.
- **Alternatives considered**:
  - *Arquivos JSON*: Ineficiente para milhares de amostras diárias e sujeito a corrupção em desligamentos repentinos.
  - *PostgreSQL/MySQL*: Inviável para aplicação desktop local voltada a usuários finais.

## 5. Geração de Laudos Periciais em PDF e Garantia de Integridade

- **Decision**: Geração local de PDF com PDFKit + Cálculo de Hash Criptográfico SHA-256 do conteúdo analítico.
- **Rationale**:
  - O PDFKit gera documentos vetoriais leves, rápidos e com controle visual milimétrico (cabeçalho, tabelas zebradas, caixas de destaque de disponibilidade e carimbo de tempo).
  - O Hash SHA-256 é gerado a partir do consolidado canônico dos eventos de queda e impresso no rodapé do laudo, fornecendo autenticidade pericial para contestação perante o Procon ou Anatel.
- **Alternatives considered**:
  - *Impressão HTML para PDF via Chromium*: Mais pesada, propensa a quebras de página desconfiguradas e sem controle pericial estrito de margens e metadados.

## 6. Interface do Usuário (Dashboard)

- **Decision**: Interface em React + Tailwind CSS com paleta Preto e Azul profissional (#0B0F19 background escuro, #1E293B cartões, #3B82F6 azul primário e acentos de status).
  - Cards de Resumo: Status Atual da Conexão, Taxa de Disponibilidade (%), Tempo Total Fora do Ar e Latência Média.
  - Gráficos: Linha do tempo de latência em tempo real e distribuição de estabilidade.
  - Tabela Interativa: Lista de quedas registradas com filtros por data, tipo de falha e duração, além de botão de exportação rápida de laudo.
- **Rationale**: Atende rigorosamente às diretrizes visuais do usuário e aos princípios de desempenho da Constituição (60 FPS e desacoplamento de UI).
