# Decision: Monitor Contínuo de Quedas e Auditoria de Conexão ISP

- **Slug**: isp-drop-monitor
- **Decided**: 2026-09-15
- **Verdict**: go
- **Artifacts reviewed**: intake.md | research.md | problem.md | concept.md

## Scorecard

| Criterion | Rating | Justification |
|-----------|--------|---------------|
| Problem validity | strong | Problema crônico vivenciado por milhões de consumidores onde o suporte do ISP descarta instabilidade com testes pontuais. |
| Evidence strength | strong | Fundamentado em resoluções da Anatel (R-QST), práticas de ICMP e APIs nativas do Windows Event Log. |
| Value vs. inaction | strong | Transforma uma disputa subjetiva em um laudo probatório incontestável com dados cronológicos consolidados. |
| Feasibility / appetite | strong | A Opção B (desktop com bandeja e exportação de PDF) cabe no apetite de 3–4 semanas com tecnologia madura. |
| Strategic fit | strong | Em estrita conformidade com os princípios da Constituição do projeto (integração nativa no Windows, baixo impacto e arquitetura desacoplada). |
| Risk posture | strong | Riscos de alegações de falha de Wi-Fi neutralizados pela amostragem simultânea no gateway local e na internet. |

## Verdict & Rationale

**Veredito: GO.** A proposta é aprovada integralmente para a fase de especificação formal. A solução ataca diretamente a assimetria de informação entre o consumidor e a operadora de telecomunicações. A escolha da Opção B (Aplicação Desktop Integrada) viabiliza um produto leve, intuitivo para o usuário leigo, que roda discretamente na bandeja do Windows e entrega laudos periciais em PDF com valor probatório.

## If go — Handoff to `/speckit-specify`

- **Problem**: Consumidores de internet sofrem com quedas intermitentes diárias e carecem de comprovação técnica para contestar testes superficiais das operadoras e pleitear ressarcimentos.
- **Chosen approach**: Opção B — Aplicação Desktop Integrada (Dashboard + Bandeja do Sistema + Gerador de Laudos Periciais em PDF).
- **In scope / out of scope**:
  - *In Scope*: Sondagem dupla simultânea (Gateway local + 2 DNS externos públicos), leitura de uptime do Windows (Event Log / Heartbeat), registro em SQLite local, alertas na bandeja do sistema, dashboard em tempo real e exportador de laudos formais em PDF com carimbo de tempo.
  - *Out of Scope*: Modificação/reparo de modems da operadora, testes massivos contínuos de velocidade que consumam franquia (speedtests 24/7) e monitoramento com o computador desligado.
- **Success metrics**: > 99% de acurácia no isolamento de causa raiz (falha local vs. falha do ISP), 100% de precisão no mapeamento de uptime da máquina, emissão de PDF em < 5 segundos e consumo de CPU < 1%.
- **Carried-forward open questions**:
  1. Parametrização dos intervalos de sondagem (ex.: padrão de 3 a 5 segundos).
  2. Inclusão opcional de campos cadastrais (protocolo, contrato, endereço do titular) no cabeçalho do laudo pericial.
  3. Tratamento de eventos de suspensão/hibernação (Sleep/Resume) do Windows para evitar falsos positivos de queda de rede.
