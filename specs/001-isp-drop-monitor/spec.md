# Feature Specification: Monitor Contínuo de Quedas e Auditoria de Conexão ISP

**Feature Branch**: `001-isp-drop-monitor`

**Created**: 2026-09-15

**Status**: Draft

**Input**: User description: "Criar um programa desktop que acompanhe rotineiramente todo o período com o computador ligado, pingando a internet periodicamente para auditar a estabilidade da conexão, registrando os horários em que o computador foi ligado e desligado, e coletando dados necessários para comprovar tecnicamente que eventuais quedas abruptas decorrem de falha do provedor de internet (ISP), gerando laudos periciais palpáveis para contestação."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Auditoria Contínua de Conectividade em Dupla Camada (Priority: P1)

Como consumidor de internet residencial ou comercial em trabalho/estudo, quero que o software monitore a conexão silenciosamente em segundo plano enquanto meu computador estiver ligado, testando simultaneamente a comunicação com o roteador local e com a internet, para que eu tenha certeza exata de quando a internet caiu e se o problema ocorreu dentro da minha casa ou na rede externa da operadora.

**Why this priority**: É o núcleo funcional de valor do produto. Sem a coleta contínua e a distinção entre a rede interna e o link externo, não existe base fática para contestar a operadora.

**Independent Test**: Pode ser testado desconectando o cabo de fibra/linha externa do modem mantendo o Wi-Fi ativo: o sistema deve registrar conectividade local perfeita (0% de perda no roteador) e interrupção na internet (100% de perda externa), computando o início e fim da queda com precisão de segundos.

**Acceptance Scenarios**:

1. **Given** que o computador está ligado e a conexão com a internet está ativa, **When** ocorre uma perda de comunicação com os servidores de internet mas o roteador local responde normalmente, **Then** o sistema registra um evento de queda com a classificação "Falha Externa do Provedor (ISP)" e grava o carimbo exato de data e hora de início.
2. **Given** que uma queda de conexão externa está em andamento, **When** a resposta de pacotes aos servidores de internet é restabelecida, **Then** o sistema encerra o evento de queda, calcula a duração total da indisponibilidade em segundos e atualiza o histórico local.
3. **Given** que a placa de rede do computador é desconectada ou o roteador é desligado, **When** ambos os testes (local e externo) falham, **Then** o sistema classifica o evento como "Falha de Conexão Local / Roteador" para não atribuir indevidamente a culpa ao link externo.

---

### User Story 2 - Registro Preciso de Ciclo de Vida da Máquina (Priority: P2)

Como usuário que desliga o computador à noite ou durante períodos fora de casa, quero que o sistema audite os horários em que o computador foi ligado e desligado, para que a taxa de disponibilidade da internet (% de uptime) seja calculada estritamente com base no tempo em que meu equipamento esteve operacional, evitando distorções.

**Why this priority**: Evita a principal brecha de defesa do suporte da operadora ("seu computador estava desligado e por isso não navegava") e estabelece a base de cálculo para descontos proporcionais na fatura previstos pela regulação de telecomunicações.

**Independent Test**: Ligar o computador, usar por 1 hora, reiniciar a máquina e verificar o histórico: o sistema deve registrar com precisão os horários de início e encerramento de sessão, comprovando que o período desligado não foi registrado como queda de internet.

**Acceptance Scenarios**:

1. **Given** que o computador inicia uma nova sessão de uso, **When** o serviço de monitoramento inicializa, **Then** o sistema registra uma nova sessão operacional com o timestamp de boot.
2. **Given** que o usuário solicita o desligamento ou reinicialização do sistema operacional, **When** o evento de shutdown é disparado, **Then** o sistema fecha a sessão operacional aberta gravando o timestamp de encerramento com motivo "Desligamento Normal".
3. **Given** que o computador sofre uma queda súbita de energia ou travamento, **When** a máquina é ligada novamente, **Then** o sistema detecta o encerramento anômalo através do último batimento (heartbeat) registrado e classifica a sessão anterior como "Desligamento Inesperado/Queda de Energia".

---

### User Story 3 - Geração e Exportação de Laudo Técnico Pericial em PDF (Priority: P3)

Como titular da assinatura de internet em disputa com o provedor, Procon ou Anatel, quero gerar com um único clique um laudo pericial formal em PDF, contendo meus dados de contrato, resumo executivo de disponibilidade, linha do tempo gráfica e tabela detalhada de todas as quedas, para anexar como prova irrefutável em reclamações e pedidos de ressarcimento ou cancelamento sem multa.

**Why this priority**: É a entrega tangível que materializa o objetivo do usuário. Transforma métricas técnicas brutas em uma peça documental compreensível para atendentes, ouvidorias e juizados de defesa do consumidor.

**Independent Test**: Selecionar um período de amostragem (ex.: últimos 7 dias) e acionar "Gerar Laudo": um arquivo PDF profissional deve ser produzido em menos de 5 segundos, exibindo o cabeçalho oficial, taxa de disponibilidade em percentual, tempo total fora do ar e a lista cronológica de incidentes com a distinção de culpa.

**Acceptance Scenarios**:

1. **Given** um histórico de monitoramento acumulado com múltiplas ocorrências de indisponibilidade, **When** o usuário define o período desejado e solicita a geração do laudo, **Then** o sistema compila e exporta um documento PDF diagramado com carimbo de emissão, resumo quantitativo e listagem de eventos.
2. **Given** a geração do laudo, **When** o documento é visualizado, **Then** ele apresenta claramente a segregação entre falhas no link da operadora e eventuais falhas na rede interna do cliente, destacando a conformidade ou violação das metas de disponibilidade.

---

### User Story 4 - Visualização em Tempo Real e Indicadores na Bandeja do Sistema (Priority: P4)

Como usuário diário que quer acompanhar visualmente o estado da rede sem ser interrompido, quero um ícone discreto na bandeja do sistema (System Tray) e um painel visual limpo que me informe a latência atual, se estou em Wi-Fi ou Cabo e se a conexão está estável, alertando-me no momento em que uma queda acontecer.

**Why this priority**: Oferece visibilidade imediata e tranquilidade no dia a dia, permitindo ao usuário saber instantaneamente se uma falha em uma chamada de vídeo decorre da internet ou de outro motivo.

**Independent Test**: Clicar no ícone da bandeja para abrir o painel: o usuário deve visualizar em tempo real a latência em milissegundos para o roteador e para a internet, a indicação do tipo de interface conectada e o status geral ("Conexão Estável" ou "Queda Detectada").

**Acceptance Scenarios**:

1. **Given** o aplicativo em execução em segundo plano, **When** uma queda de conexão externa ocorre, **Then** o ícone da bandeja altera visualmente seu estado e emite uma notificação discreta informando a interrupção.
2. **Given** o painel principal aberto, **When** a rede opera normalmente, **Then** o usuário visualiza gráficos dinâmicos de latência para a rede local e para a internet, atualizados continuamente com baixo consumo de processamento.

---

### Edge Cases

- **Suspensão ou Hibernação do Sistema (Sleep/Resume):** Quando o computador entra em modo de suspensão, o sistema operacional pausa o monitoramento. Ao acordar, o sistema DEVE reconhecer o intervalo de suspensão por meio da discrepância de relógio e NÃO registrá-lo como uma interrupção da operadora.
- **Troca Dinâmica de Adaptador (ex.: desconectar o Wi-Fi e plugar o cabo de rede Ethernet):** O sistema DEVE identificar a alteração de interface e gateway padrão imediatamente, sem interromper o serviço nem emitir falso alerta de queda.
- **Flapping / Oscilações Ultra Rápidas de Rede:** Se a conexão falhar e voltar repetidamente a cada segundo (flapping), o sistema DEVE agrupar essas oscilações em um único incidente de "Instabilidade Severa com Perda Intermitente de Pacotes", evitando gerar centenas de microeventos fragmentados.
- **Roteadores com Bloqueio de ICMP Interno:** Caso o roteador da operadora tenha regras que não respondam a ping direto no gateway local, o sistema DEVE identificar a ausência contínua de resposta ao gateway e alertar o usuário para selecionar validação por resolução de nome local ou porta de serviço.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE executar sondagens periódicas simultâneas em dois alvos distintos: o Gateway Padrão local (roteador) e pelo menos dois destinos externos de referência pública de alta disponibilidade.
- **FR-002**: O sistema DEVE classificar um evento de indisponibilidade como "Queda Externa do Provedor" somente quando os destinos externos deixarem de responder simultaneamente enquanto o Gateway Padrão local permanecer respondendo com sucesso.
- **FR-003**: O sistema DEVE classificar a perda de pacotes como "Falha Local / Roteador" quando o Gateway Padrão local e os destinos externos ficarem inacessíveis ao mesmo tempo.
- **FR-004**: O sistema DEVE permitir a configuração personalizada da frequência de sondagem, adotando o padrão seguro de 3 a 5 segundos por amostragem.
- **FR-005**: O sistema DEVE registrar automaticamente os horários de inicialização (boot) e encerramento (shutdown) de cada sessão operacional da máquina.
- **FR-006**: O sistema DEVE manter um registro contínuo de batimento (heartbeat) periódico para identificar desligamentos abruptos por corte de energia ou travamento do sistema operacional.
- **FR-007**: O sistema DEVE persistir todas as amostras, métricas de latência, perdas de pacotes e eventos de queda em armazenamento estruturado local de alta performance.
- **FR-008**: O sistema DEVE identificar e registrar o tipo de adaptador de rede em uso (Cabo Ethernet ou Conexão Sem Fio Wi-Fi) para cada amostra coletada.
- **FR-009**: O sistema DEVE calcular a taxa percentual de disponibilidade da internet estritamente proporcional ao tempo total em que o computador esteve operacional no período analisado.
- **FR-010**: O sistema DEVE gerar um documento formal de Laudo Técnico Pericial em formato PDF, contendo carimbo de data/hora, resumo executivo, percentual de disponibilidade, duração acumulada de indisponibilidade e histórico cronológico individualizado de cada queda.
- **FR-011**: O sistema DEVE permitir que o usuário inclua no laudo seus dados cadastrais (nome do titular, nome da operadora, número do contrato ou protocolo de atendimento).
- **FR-012**: O sistema DEVE rodar em segundo plano minimizado na bandeja do sistema (System Tray), exibindo o status de conexão por meio de indicadores visuais.
- **FR-013**: O sistema DEVE exibir um painel interativo (Dashboard) com resumo em tempo real da latência local, latência externa e histórico das últimas ocorrências.
- **FR-014**: O sistema DEVE detectar estados de suspensão e hibernação da máquina, suspendendo as amostras e retomando a contabilidade sem registrar falsas quedas de internet.
- **FR-015**: O sistema DEVE operar sem exigir que o usuário execute a aplicação com privilégios de administrador.

### Key Entities *(include if feature involves data)*

- **SessaoOperacional**: Representa o período contínuo em que o computador permaneceu ligado. Atributos: Identificador, Data/Hora de Início (Boot), Data/Hora de Término (Shutdown), Tipo de Encerramento (Normal, Queda de Energia/Inesperado, Suspensão), Tempo Total Ativo.
- **AmostraConectividade**: Registro instantâneo de uma verificação de rede. Atributos: Timestamp, Latência para Gateway Local (ms), Perda no Gateway (%), Latência para Internet Externa (ms), Perda Externa (%), Tipo de Interface Ativa (Ethernet / Wi-Fi), Nome do Adaptador.
- **EventoQueda**: Registro consolidado de uma interrupção de serviço. Atributos: Identificador, Timestamp de Início, Timestamp de Término, Duração Total (segundos), Categoria da Falha (Externa/ISP vs. Local/Wi-Fi/Roteador), Percentual Médio de Perda de Pacotes, Sessão Operacional Vinculada.
- **LaudoAuditoria**: Documento formal compilado para fins comprobatórios. Atributos: Período Abrangido (Início e Fim), Dados Cadastrais do Usuário/Contrato, Tempo Total de PC Operacional, Tempo Total de Indisponibilidade do ISP, Percentual Efetivo de Disponibilidade, Quantidade de Quedas Registradas, Carimbo Criptográfico/Integridade de Emissão.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: O sistema atinge mais de 99% de acurácia na segregação entre falhas locais (rede interna) e falhas externas do link de telecomunicação da operadora.
- **SC-002**: A geração e renderização do Laudo Pericial em PDF para um histórico de até 30 dias de medições é concluída em menos de 5 segundos.
- **SC-003**: O impacto operacional da aplicação em segundo plano mantém uso de processador abaixo de 1% em regime contínuo de repouso.
- **SC-004**: O consumo de banda gerado pelas sondagens periódicas de conectividade não ultrapassa 2 KB por minuto.
- **SC-005**: 100% dos eventos de suspensão/hibernação do computador são desconsiderados no cálculo de quedas, eliminando falsos positivos gerados por inatividade da máquina.
- **SC-006**: Usuários sem conhecimento técnico conseguem exportar o laudo probatório completo em até 3 cliques a partir da tela inicial.

## Assumptions

- O usuário possui pelo menos uma interface de rede ativa conectada a um roteador ou modem doméstico/corporativo.
- O roteador local disponibiliza um endereço de Gateway Padrão IPv4 ou IPv6 acessível para consultas de latência.
- Os servidores públicos de DNS de alta disponibilidade (como Cloudflare 1.1.1.1 e Google 8.8.8.8) mantêm resposta contínua a pacotes de eco ICMP.
- A auditoria da estabilidade e disponibilidade da internet cobre exclusivamente o tempo em que o computador monitorado está ligado.
- Relatórios em formato PDF com dados cronológicos estruturados e carimbo de tempo atendem aos requisitos documentais solicitados pelas ouvidorias de ISPs, Procon e Anatel Consumidor.
