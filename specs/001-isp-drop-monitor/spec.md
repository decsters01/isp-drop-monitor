# Feature Specification: Monitor Contínuo de Quedas e Auditoria de Conexão ISP

**Feature Branch**: `001-isp-drop-monitor`

**Created**: 2026-09-15

**Status**: Draft

**Input**: User description: "Criar um programa desktop que acompanhe rotineiramente todo o período com o computador ligado, pingando a internet periodicamente para auditar a estabilidade da conexão, registrando os horários em que o computador foi ligado e desligado, e coletando dados necessários para comprovar tecnicamente que eventuais quedas abruptas decorrem de falha do provedor de internet (ISP), gerando laudos periciais palpáveis para contestação."

## Clarifications

### Session 2026-09-15

- Q: Qual deve ser o tempo mínimo de perda contínua de resposta aos servidores externos para registrar formalmente um "Evento de Queda" no laudo? → A: 5 segundos contínuos (sensibilidade otimizada para detecção de quebra de reuniões em tempo real e chamadas de vídeo).
- Q: Como o sistema deve rastrear os períodos em que o computador esteve ligado/desligado para manter operação sem privilégios de Administrador? → A: Abordagem Híbrida: Heartbeat contínuo em SQLite local a cada 30 segundos como mecanismo primário não-elevado + leitura complementar do Windows Event Log (IDs 6005/6006/41) quando disponível.
- Q: Qual formato de comprovação de integridade técnica deve ser embutido no Laudo Pericial em PDF? → A: Documento PDF estruturado com Hash Criptográfico SHA-256 e Identificador Único de Emissão no rodapé, permitindo auditoria pericial e conferência de autenticidade no Procon e Anatel.
- Q: Como o motor de auditoria deve verificar a comunicação com o roteador local se o equipamento bloquear pacotes ICMP (ping)? → A: Fallback inteligente para conexão TCP (SYN) nas portas de serviço padrão do roteador (53 - DNS local, 80/443 - interface de gerência web), confirmando a integridade do enlace local mesmo sob bloqueio de ICMP.
- Q: Como o sistema deve registrar oscilações rápidas repetitivas de rede (flapping) no histórico e no laudo pericial? → A: Agrupamento em Janela de Instabilidade: microquedas sequenciais que ocorram em um intervalo inferior a 60 segundos são consolidadas em um único registro de "Instabilidade Severa com Perda Intermitente de Pacotes", totalizando duração da janela e percentual médio de pacotes descartados.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Auditoria Contínua de Conectividade em Dupla Camada (Priority: P1)

Como consumidor de internet residencial ou comercial em trabalho/estudo, quero que o software monitore a conexão silenciosamente em segundo plano enquanto meu computador estiver ligado, testando simultaneamente a comunicação com o roteador local e com a internet, para que eu tenha certeza exata de quando a internet caiu e se o problema ocorreu dentro da minha casa ou na rede externa da operadora.

**Why this priority**: É o núcleo funcional de valor do produto. Sem a coleta contínua e a distinção entre a rede interna e o link externo, não existe base fática para contestar a operadora.

**Independent Test**: Pode ser testado desconectando o cabo de fibra/linha externa do modem mantendo o Wi-Fi ativo: o sistema deve registrar conectividade local perfeita (0% de perda no roteador) e interrupção na internet (100% de perda externa após 5 segundos contínuos), computando o início e fim da queda com precisão de segundos.

**Acceptance Scenarios**:

1. **Given** que o computador está ligado e a conexão com a internet está ativa, **When** ocorre uma perda de comunicação com os servidores de internet por mais de 5 segundos consecutivos mas o roteador local responde normalmente (por ICMP ou fallback TCP), **Then** o sistema registra um evento de queda com a classificação "Falha Externa do Provedor (ISP)" e grava o carimbo exato de data e hora de início.
2. **Given** que uma queda de conexão externa está em andamento, **When** a resposta de pacotes aos servidores de internet é restabelecida, **Then** o sistema encerra o evento de queda, calcula a duração total da indisponibilidade em segundos e atualiza o histórico local.
3. **Given** que a placa de rede do computador é desconectada ou o roteador é desligado, **When** ambos os testes (local e externo) falham, **Then** o sistema classifica o evento como "Falha de Conexão Local / Roteador" para não atribuir indevidamente a culpa ao link externo.

---

### User Story 2 - Registro Preciso de Ciclo de Vida da Máquina (Priority: P2)

Como usuário que desliga o computador à noite ou durante períodos fora de casa, quero que o sistema audite os horários em que o computador foi ligado e desligado, para que a taxa de disponibilidade da internet (% de uptime) seja calculada estritamente com base no tempo em que meu equipamento esteve operacional, evitando distorções.

**Why this priority**: Evita a principal brecha de defesa do suporte da operadora ("seu computador estava desligado e por isso não navegava") e estabelece a base de cálculo para descontos proporcionais na fatura previstos pela regulação de telecomunicações.

**Independent Test**: Ligar o computador, usar por 1 hora, reiniciar a máquina e verificar o histórico: o sistema deve demonstrar uma sessão contínua via heartbeat a cada 30 segundos, comprovando que o período desligado não foi computado como queda de internet.

**Acceptance Scenarios**:

1. **Given** que o computador inicia uma nova sessão de uso, **When** a aplicação inicializa, **Then** o sistema grava imediatamente o início da sessão operacional e mantém batimentos (heartbeat) a cada 30 segundos em SQLite local.
2. **Given** que o usuário solicita o desligamento ou reinicialização do Windows, **When** os sinais de encerramento do sistema são recebidos, **Then** o sistema fecha a sessão operacional aberta gravando o timestamp exato de encerramento com motivo "Desligamento Normal".
3. **Given** que o computador sofre uma interrupção súbita de energia ou tela azul (BSOD), **When** a máquina inicializa novamente, **Then** o sistema audita a discrepância entre o último batimento e a inicialização atual, encerrando a sessão anterior como "Desligamento Inesperado/Queda de Energia".

---

### User Story 3 - Geração e Exportação de Laudo Técnico Pericial em PDF (Priority: P3)

Como titular da assinatura de internet em disputa com o provedor, Procon ou Anatel, quero gerar com um único clique um laudo pericial formal em PDF, contendo meus dados de contrato, resumo executivo de disponibilidade, linha do tempo gráfica, tabela detalhada de todas as quedas e hash criptográfico de integridade, para anexar como prova irrefutável em reclamações e pedidos de ressarcimento ou cancelamento sem multa.

**Why this priority**: É a entrega tangível que materializa o objetivo do usuário. Transforma métricas técnicas brutas em uma peça documental juridicamente respaldada para atendentes, ouvidorias e órgãos de defesa do consumidor.

**Independent Test**: Selecionar um período de amostragem (ex.: últimos 7 dias) e acionar "Gerar Laudo": um arquivo PDF profissional deve ser produzido em menos de 5 segundos, exibindo o cabeçalho oficial, código SHA-256 de autenticidade no rodapé, taxa de disponibilidade em percentual e a lista cronológica de incidentes com a segregação de culpa.

**Acceptance Scenarios**:

1. **Given** um histórico de monitoramento acumulado com múltiplas ocorrências de indisponibilidade, **When** o usuário define o período desejado e solicita a geração do laudo, **Then** o sistema compila e exporta um documento PDF com carimbo de emissão, resumo executivo e Hash SHA-256 de verificação de autenticidade.
2. **Given** a geração do laudo, **When** o documento é visualizado, **Then** ele apresenta claramente a segregação entre falhas no link da operadora e falhas na rede interna do cliente, destacando períodos de instabilidade agrupada (flapping) e violações de disponibilidade contratual.

---

### User Story 4 - Visualização em Tempo Real e Indicadores na Bandeja do Sistema (Priority: P4)

Como usuário diário que quer acompanhar visualmente o estado da rede sem ser interrompido, quero um ícone discreto na bandeja do sistema (System Tray) e um painel visual limpo que me informe a latência atual, se estou em Wi-Fi ou Cabo e se a conexão está estável, alertando-me no momento em que uma queda acontecer.

**Why this priority**: Oferece visibilidade imediata e tranquilidade no dia a dia, permitindo ao usuário saber instantaneamente se uma falha em uma chamada de vídeo decorre da internet ou de outro motivo.

**Independent Test**: Clicar no ícone da bandeja para abrir o painel: o usuário visualiza em tempo real a latência em milissegundos para o roteador e para a internet, o tipo de interface ativa (Wi-Fi ou Ethernet) e o status consolidado de estabilidade da rede.

**Acceptance Scenarios**:

1. **Given** o aplicativo em execução em segundo plano, **When** uma queda de conexão de 5 segundos ocorre, **Then** o ícone da bandeja altera visualmente seu estado para alerta e emite uma notificação discreta informando a interrupção.
2. **Given** o painel principal aberto, **When** a rede opera normalmente, **Then** o usuário visualiza gráficos dinâmicos de latência para a rede local e para a internet, atualizados continuamente com baixo consumo de processamento.

---

### Edge Cases

- **Suspensão ou Hibernação do Sistema (Sleep/Resume):** Quando o computador entra em modo de suspensão, o sistema operacional pausa o monitoramento. Ao acordar, o sistema DEVE reconhecer o intervalo de suspensão por meio da discrepância de relógio entre o último heartbeat e o horário atual, NÃO registrando esse período como uma interrupção da operadora.
- **Troca Dinâmica de Adaptador (ex.: desconectar o Wi-Fi e plugar o cabo de rede Ethernet):** O sistema DEVE identificar a alteração de interface e o novo Gateway Padrão imediatamente, sem interromper o serviço nem emitir falso alerta de queda.
- **Roteadores com Bloqueio de ICMP Interno:** Se o roteador da operadora tiver bloqueio contra pacotes ICMP Echo na interface local, o sistema DEVE executar fallback automático via tentativa de conexão TCP nas portas padrão (53, 80 ou 443), atestando a integridade do enlace local sem gerar falsos diagnósticos de rede local caída.
- **Flapping e Oscilações Rápidas Subsequentes:** Se a conexão cair e voltar de forma intermitente com intervalos menores que 60 segundos entre as ocorrências, o sistema DEVE consolidar essas oscilações em um único incidente de "Instabilidade Severa com Perda Intermitente de Pacotes", detalhando a duração total da janela e a perda percentual média.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE executar sondagens periódicas simultâneas em dois alvos distintos: o Gateway Padrão local (roteador) e pelo menos dois destinos externos de referência pública de alta disponibilidade (ex.: Cloudflare 1.1.1.1 e Google 8.8.8.8).
- **FR-002**: O sistema DEVE classificar uma perda de conectividade como "Queda Externa do Provedor (ISP)" somente quando os destinos externos permanecerem inacessíveis por pelo menos 5 segundos contínuos enquanto a comunicação com o Gateway Padrão local estiver ativa e estável.
- **FR-003**: O sistema DEVE classificar a perda de pacotes como "Falha Local / Roteador" quando o Gateway Padrão local e os destinos externos ficarem inacessíveis simultaneamente.
- **FR-004**: O sistema DEVE implementar fallback automático para verificação TCP (portas 53, 80 ou 443) caso o Gateway Padrão local descarte pacotes ICMP Echo por política de segurança de fábrica.
- **FR-005**: O sistema DEVE permitir a configuração personalizada da frequência de sondagem, adotando como padrão 3 a 5 segundos entre cada ciclo de amostragem.
- **FR-006**: O sistema DEVE auditar os horários de início e término de operação do computador através de estratégia híbrida: Heartbeat contínuo gravado a cada 30 segundos em banco local (compatível com contas de usuário padrão sem elevação) complementado por leitura de eventos do sistema operacional (Event IDs 6005/6006/41) quando disponível.
- **FR-007**: O sistema DEVE consolidar oscilações repetitivas com intervalo inferior a 60 segundos (flapping) em um único evento unificado de instabilidade, registrando a taxa de perda e a duração da janela.
- **FR-008**: O sistema DEVE persistir todas as amostras de latência, perdas de pacotes e eventos de queda em armazenamento estruturado local (banco embutido de alta performance).
- **FR-009**: O sistema DEVE identificar e registrar o tipo de adaptador em uso (Cabo Ethernet ou Wi-Fi) para cada amostra coletada.
- **FR-010**: O sistema DEVE calcular a taxa percentual de disponibilidade da internet estritamente proporcional ao tempo total em que o computador esteve operacional no período analisado.
- **FR-011**: O sistema DEVE gerar um documento formal de Laudo Técnico Pericial em formato PDF, contendo cabeçalho institucional, carimbo de data/hora, resumo executivo, taxa percentual de disponibilidade, histórico cronológico de quedas e Hash SHA-256 com ID Único de Emissão no rodapé para validação pericial.
- **FR-012**: O sistema DEVE permitir a inclusão opcional de dados cadastrais no laudo (nome do titular, operadora, número do contrato e protocolos de atendimento anteriores).
- **FR-013**: O sistema DEVE operar em segundo plano minimizado na bandeja do sistema (System Tray), refletindo visualmente o status da rede e emitindo notificações discretas diante de quedas confirmadas.
- **FR-014**: O sistema DEVE disponibilizar um painel interativo (Dashboard) com gráficos de latência em tempo real, visualização de interfaces e atalho rápido para emissão do laudo.
- **FR-015**: O sistema DEVE detectar estados de suspensão e hibernação da máquina via discrepância temporal entre batimentos, suspendendo a contabilização sem gerar falsos registros de queda de rede.
- **FR-016**: O sistema DEVE funcionar em sua totalidade sob permissões normais de usuário do Windows, sem exigir privilégios de Administrador.

### Key Entities *(include if feature involves data)*

- **SessaoOperacional**: Representa o período contínuo em que o computador permaneceu ligado. Atributos: Identificador, Data/Hora de Início (Boot), Data/Hora de Término (Shutdown), Tipo de Encerramento (Normal, Queda de Energia/Inesperado, Suspensão), Tempo Total Ativo.
- **AmostraConectividade**: Registro instantâneo de uma verificação de rede. Atributos: Timestamp, Latência para Gateway Local (ms), Perda no Gateway (%), Latência para Internet Externa (ms), Perda Externa (%), Tipo de Interface Ativa (Ethernet / Wi-Fi), Nome do Adaptador, Método Local (ICMP vs TCP Fallback).
- **EventoQueda**: Registro consolidado de uma interrupção de serviço. Atributos: Identificador, Timestamp de Início, Timestamp de Término, Duração Total (segundos), Categoria da Falha (Externa/ISP vs. Local/Wi-Fi/Roteador), Tipo de Evento (Queda Contínua vs. Instabilidade/Flapping Agrupado), Percentual Médio de Perda de Pacotes, Sessão Operacional Vinculada.
- **LaudoAuditoria**: Documento formal compilado para fins comprobatórios. Atributos: Identificador Único do Laudo, Hash Criptográfico SHA-256, Período Abrangido (Início e Fim), Dados Cadastrais do Usuário/Contrato, Tempo Total de PC Operacional, Tempo Total de Indisponibilidade do ISP, Percentual Efetivo de Disponibilidade, Quantidade de Quedas e Instabilidades Registradas, Carimbo de Emissão.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: O sistema atinge mais de 99% de acurácia na segregação entre falhas locais (rede interna) e falhas externas do link de telecomunicação da operadora.
- **SC-002**: A geração e renderização do Laudo Pericial em PDF com carimbo de integridade SHA-256 para históricos de até 30 dias é concluída em menos de 5 segundos.
- **SC-003**: O impacto operacional da aplicação em segundo plano mantém uso de processador abaixo de 1% em regime contínuo de repouso.
- **SC-004**: O consumo de banda gerado pelas sondagens periódicas de conectividade não ultrapassa 2 KB por minuto.
- **SC-005**: 100% dos eventos de suspensão/hibernação do computador são desconsiderados no cálculo de quedas, eliminando falsos positivos gerados por inatividade da máquina.
- **SC-006**: Roteadores com bloqueio de ICMP têm sua integridade local verificada com 100% de sucesso via fallback TCP sem emissão de falsos alarmes locais.
- **SC-007**: Usuários sem conhecimento técnico conseguem exportar o laudo probatório completo em até 3 cliques a partir da tela inicial.

## Assumptions

- O usuário possui pelo menos uma interface de rede ativa conectada a um roteador ou modem doméstico/corporativo.
- O roteador local disponibiliza um endereço de Gateway Padrão IPv4 ou IPv6 acessível para consultas de latência (via ICMP ou TCP nas portas 53/80/443).
- Os servidores públicos de DNS de alta disponibilidade (como Cloudflare 1.1.1.1 e Google 8.8.8.8) mantêm resposta contínua a pacotes de eco ICMP.
- A auditoria da estabilidade e disponibilidade da internet cobre exclusivamente o tempo em que o computador monitorado está ligado.
- Relatórios em formato PDF com dados cronológicos estruturados, carimbo de tempo e Hash SHA-256 de autenticidade atendem aos requisitos documentais solicitados pelas ouvidorias de ISPs, Procon e Anatel Consumidor.
