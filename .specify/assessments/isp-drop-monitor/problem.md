# Problem Definition: Monitor Contínuo de Quedas e Auditoria de Conexão ISP

- **Slug**: isp-drop-monitor
- **Created**: 2026-09-15
- **Inputs used**: intake.md | research.md

## Problem Statement

Consumidores de internet residencial e comercial sofrem com quedas intermitentes e instabilidades contínuas ao longo do dia, mas não possuem meios técnicos objetivos para contestar o suporte das operadoras (ISPs), que realizam testes pontuais superficiais, culpam a rede Wi-Fi do cliente e encerram os chamados sem solucionar o problema ou conceder abatimentos previstos em lei.

## Affected Users & Stakeholders

- **Users (Trabalhadores Remotos e Estudantes):** Sofrem desconexões em videoconferências, VPNs e sistemas em nuvem, perdendo produtividade e credibilidade profissional sem conseguir provar a culpa do provedor.
- **Users (Gamers e Streamers):** Enfrentam perda de pacotes e desconexões repetitivas em tempo real que inviabilizam suas atividades, sem respaldo nos medidores de velocidade tradicionais.
- **Stakeholders (Provedores de Internet - ISPs):** Precisam de dados objetivos para encaminhar equipes técnicas a falhas reais na infraestrutura de fibra/cabo e evitar reaberturas sucessivas de chamados.
- **Stakeholders (Órgãos de Proteção e Regulação - Procon e Anatel):** Necessitam de laudos periciais e históricos cronológicos consistentes para avaliar reclamações de quebra de contrato e aplicar sanções ou cancelamentos sem multa.

## Goals

- **Auditoria Contínua Ininterrupta:** Monitorar e registrar em tempo real a conectividade externa durante todo o tempo em que o computador estiver em operação.
- **Isolamento de Causa Raiz:** Diferenciar matematicamente se cada evento de queda se deu no segmento interno do cliente (Wi-Fi / cabo para o roteador) ou no link externo do provedor (roteador para a internet).
- **Correlação Precisa com o Ciclo da Máquina:** Mapear os horários de inicialização e desligamento do sistema operacional para calcular a disponibilidade percentual da internet estritamente baseada no tempo em que o PC esteve operacional.
- **Geração de Laudos Técnicos Auditáveis:** Produzir relatórios formais com carimbo temporal, gráficos de eventos, duração exata das interrupções e resumo executivo apto a instruir protocolos e processos de defesa do consumidor.
- **Impacto Nulo no Desempenho:** Operar em segundo plano com consumo irrelevante de processamento (< 1% CPU) e pacotes mínimos de rede (< 2 KB/min).

## Non-Goals

- **Não é uma ferramenta de reparo de hardware ou roteadores:** Não reconfigurará fisicamente modems, firmwares ou canais de rádio do roteador do usuário.
- **Não realizará testes contínuos de banda máxima (Speedtest Contínuo):** Não consumirá a franquia de dados do usuário saturando o link com downloads massivos contínuos para aferição de velocidade máxima.
- **Não monitorará a rede com o computador desligado:** Não opera como sonda de hardware independente (como Raspberry Pi); a abrangência de auditoria limita-se ao período operacional da máquina monitorada.
- **Não substituirá plataformas corporativas de monitoramento de servidores:** O foco é a relação contratual e a experiência de conectividade do usuário de desktop, não topologias complexas de data center.

## Success Metrics

- **Confiabilidade no Diagnóstico de Origem:** Mais de 99% de acurácia na separação de incidentes locais (falha de comunicação com o roteador) vs. externos (falha de rota externa com roteador comunicante).
- **Integridade Temporal do Registro:** 100% dos eventos de inicialização e desligamento do sistema operacional auditados e correlacionados aos registros de conectividade.
- **Rapidez na Emissão do Laudo:** Emissão do laudo técnico pericial consolidado em menos de 5 segundos para históricos de até 30 dias.
- **Pegada Operacional:** Uso de CPU inferior a 1% em repouso e consumo de tráfego de sondagem inferior a 2 KB por minuto.

## Cost of Inaction

Sem essa solução, os consumidores continuam pagando mensalidades integrais por serviços intermitentes, perdem horas em ligações inócuas para centrais de atendimento, permanecem vulneráveis às justificativas padrão das operadoras e ficam impossibilitados de rescindir contratos com fidelidade sem pagar multas indevidas.

## Open Questions

- [NEEDS CLARIFICATION: Qual o limiar de tempo para diferenciar uma oscilação momentânea (ex.: 2 segundos) de uma microqueda formal (ex.: 5 a 15 segundos) e de uma interrupção crítica (> 60 segundos)?]
- [NEEDS CLARIFICATION: O laudo pericial deve incluir campos para dados cadastrais do cliente (número de contrato, protocolo do ISP, titular da conta) no cabeçalho do documento?]
- [NEEDS CLARIFICATION: Como tratar períodos de suspensão/hibernação do Windows para não computá-los erroneamente como queda de conexão?]
