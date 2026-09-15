# Feature Specification: Dashboard Dark Profissional e Empacotamento Executável Electron

**Feature Branch**: `002-dashboard-electron-exe`

**Created**: 2026-09-15

**Status**: Draft

**Input**: User description: "implementar nesse sistema uma dashboard com paleta de cores dark intuitiva e um programa executável profissional de electron com ele desenvolvido"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Experiência Visual no Dashboard Dark com Paleta Preto e Azul (Priority: P1)

Como usuário e auditor da minha própria conexão de internet, quero navegar em um dashboard desktop escuro, intuitivo e moderno (paleta preto e azul de alto contraste), com cards de resumo dinâmicos, múltiplos gráficos analíticos e tabela com filtros instantâneos, para que eu visualize com clareza imediata a saúde da minha rede sem cansaço visual.

**Why this priority**: É a interface primária de interação do usuário. Um design refinado em tema Dark (#070B14 / #0B0F19 com acentos #3B82F6) eleva a percepção de produto profissional e facilita a leitura contínua de métricas.

**Independent Test**: Abrir o aplicativo desktop: o usuário deve visualizar imediatamente o dashboard no tema dark responsivo, interagir com os cards de métricas (hover effects), alternar filtros na tabela e visualizar os múltiplos gráficos atualizando suavemente a 60 FPS.

**Acceptance Scenarios**:

1. **Given** que o usuário abre o dashboard, **When** a interface é renderizada, **Then** todos os elementos seguem a paleta Preto e Azul escuro, sem flashes brancos ou elementos descompassados, com contraste legível conforme normas de acessibilidade.
2. **Given** que o mouse passa sobre qualquer card de resumo ou linha da tabela, **When** ocorre o evento de hover, **Then** o elemento reage com elevação suave, realce de borda azul e sombra projetada.
3. **Given** a exibição de gráficos de monitoramento, **When** novos dados de telemetria chegam a cada ciclo, **Then** o gráfico de latência em tempo real e o gráfico de distribuição de estabilidade atualizam de forma fluida sem engasgos de interface.

---

### User Story 2 - Construção do Executável Profissional Windows (.exe) (Priority: P2)

Como usuário final ou técnico que deseja instalar a ferramenta no computador sem configurar ambientes de desenvolvimento ou terminal, quero executar um arquivo instalador oficial `.exe` (ou executável portátil) que configure o aplicativo no Windows com um clique, adicionando ícone profissional e atalhos na Área de Trabalho e Menu Iniciar.

**Why this priority**: Permite que o software seja distribuído para qualquer usuário final do Windows de forma autônoma e profissional, sem necessidade de Node.js instalado na máquina do cliente.

**Independent Test**: Rodar o comando de empacotamento no projeto: o sistema deve produzir um instalador executável `.exe` assinado/empacotado na pasta `release/`, que pode ser instalado e aberto normalmente no Windows 10/11.

**Acceptance Scenarios**:

1. **Given** o comando de build e empacotamento executado, **When** o processo é concluído, **Then** é gerado um instalador executável para Windows (`.exe`) contendo todos os binários do Electron, Node e assets embutidos.
2. **Given** a execução do instalador gerado em uma máquina Windows limpa, **When** o usuário avança a instalação, **Then** o aplicativo é instalado no diretório padrão de programas do usuário, cria o atalho no Menu Iniciar e abre diretamente o dashboard operacional.

---

### User Story 3 - Painel Analítico Multi-Gráficos e Controles Rápidos (Priority: P3)

Como cliente preparando uma contestação perante o ISP, quero visualizar múltiplos gráficos comparativos (gráfico de linha de latência dupla camada e gráfico em barras de histórico diário de quedas), com controles rápidos para pausar/retomar monitoramento e exportar laudo pericial, para ter uma visão analítica abrangente da degradação da minha conexão.

**Why this priority**: Enriquece o valor diagnóstico além do tempo real pontual, demonstrando o padrão de degradação da conexão ao longo dos dias.

**Independent Test**: Alternar períodos de visualização no painel: os múltiplos gráficos devem recalcular e apresentar a distribuição histórica de perdas e médias de latência instantaneamente.

**Acceptance Scenarios**:

1. **Given** múltiplos dias de dados gravados, **When** o usuário consulta o painel analítico, **Then** o sistema renderiza simultaneamente o gráfico de tempo real e o gráfico consolidado diário de indisponibilidade.
2. **Given** o clique no botão de exportação rápida, **When** o modal abre, **Then** a interface apresenta um formulário escuro estilizado com feedback de geração e cálculo do Hash SHA-256 em tempo real.

---

### Edge Cases

- **Telas com Resoluções Menores (Laptops 1366x768) ou Monitores UltraWide:** O layout DEVE ser responsivo com grade adaptável (grid flexível) para que nenhum card de métrica ou tabela fique truncado ou sobreposto.
- **Execução em Modo Portátil sem Instalação:** O aplicativo empacotado DEVE ser capaz de rodar também em versão executável portátil (standalone `.exe`), salvando o banco SQLite no `%APPDATA%` local sem exigir permissões de escrita em `C:\Program Files`.
- **Desconexão Total de Interfaces de Rede:** Caso o computador não tenha nenhum cabo ou Wi-Fi conectado, o dashboard DEVE exibir estado vazio inteligente ("Nenhum adaptador ativo detectado") sem emitir erros no console nem travar a UI.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-017**: O sistema DEVE adotar layout desktop com tema Dark profissional e paleta de cores Preto e Azul (#070B14 fundo base, #0B0F19 painéis, #0F172A cartões e acentos #3B82F6/#60A5FA).
- **FR-018**: O dashboard DEVE fornecer cards de resumo métrico com efeitos interativos de hover (elevação, iluminação de borda e sombra azul suave).
- **FR-019**: O sistema DEVE apresentar múltiplos gráficos no painel:
  - Gráfico de linha em tempo real de latência de dupla camada (Gateway Local vs. Internet Externa).
  - Gráfico comparativo de distribuição de perdas de pacotes e estabilidade diária.
- **FR-020**: A tabela interativa DEVE incluir busca em tempo real, ordenação dinâmica por colunas (data, duração, causa e perda), filtros de categoria e paginação limpa.
- **FR-021**: O sistema DEVE disponibilizar scripts e configuração automatizada de empacotamento com `electron-builder` para gerar arquivo executável instalador (`.exe` NSIS) e versão portátil para Windows de 64 bits.
- **FR-022**: O pacote executável DEVE embutir todos os módulos necessários (incluindo SQLite e motor de PDF), operando de forma autônoma sem requerer runtime ou ferramentas pré-instaladas no Windows do usuário.
- **FR-023**: O aplicativo empacotado DEVE manter integração nativa com o System Tray do Windows, permitindo minimizar para a bandeja e executar em segundo plano com ícone personalizado.
- **FR-024**: O modal de laudo pericial DEVE seguir o padrão visual Dark e fornecer opções de seleção rápida de período (24h, 7 dias e 30 dias) com indicação visual de progresso.

### Key Entities *(include if feature involves data)*

- **DashboardThemeConfig**: Configuração de tema visual (paleta Dark Black & Blue, fontes, transições e efeitos de iluminação).
- **DailyStabilitySummary**: Agregação diária de métricas para o gráfico analítico (Data, Uptime do PC em minutos, Downtime do ISP em minutos, Quantidade de Quedas, Taxa Percentual de Disponibilidade).
- **DistributionMetric**: Distribuição de latência e faixas de qualidade (Ótima: < 20ms, Regular: 20-50ms, Degradada: > 50ms, Queda: 100% perda).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-008**: O layout dark responde a redimensionamentos de janela de 900x600 até 4K sem quebra de elementos visuais nem rolagem horizontal indesejada.
- **SC-009**: A renderização dos gráficos interativos no dashboard mantém taxa de atualização suave de 60 FPS com consumo de CPU do processo renderizador abaixo de 1.5%.
- **SC-010**: O build de produção com `electron-builder` gera um arquivo executável `.exe` válido e autônomo na pasta `release/` em menos de 180 segundos.
- **SC-011**: O executável gerado inicializa em menos de 2 segundos a partir do clique duplo no Windows 10/11.
- **SC-012**: 100% dos botões de ação e cards oferecem feedback visual de estado (hover, active e disabled) e acessibilidade com contraste mínimo de 4.5:1.

## Assumptions

- O ambiente de compilação dispõe do Node.js LTS para acionar a esteira de build do Electron Builder.
- O executável de destino é focado na arquitetura x64 do Windows (Windows 10 e Windows 11).
- O usuário final pode executar o arquivo `.exe` sem necessidade de direitos de administrador (instalador no escopo de usuário padrão).
