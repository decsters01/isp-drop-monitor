# Concept: Monitor Contínuo de Quedas e Auditoria de Conexão ISP

- **Slug**: isp-drop-monitor
- **Created**: 2026-09-15
- **Recommended option**: Opção B — Aplicação Desktop Integrada (Dashboard Nativo + Tray + Laudos Periciais em PDF)

## Options

### Opção A — Utilitário Leve em Segundo Plano (CLI/Script + Exportação CSV/HTML)
- **Sketch**: Um processo de segundo plano iniciado via Agendador de Tarefas do Windows que monitora silenciosamente o gateway e destinos públicos, gravando dados em SQLite local. A interação é feita via linha de comando ou abrindo arquivos de relatório em formato CSV e HTML estático.
- **Appetite**: small (1 a 2 semanas)
- **Trade-offs**: Desenvolvimento ágil e consumo de memória extremamente reduzido. Em contrapartida, sacrifica totalmente a experiência de usuários leigos, não oferece feedback visual em tempo real e os relatórios em CSV exigem conhecimento prévio para formatação em disputas formais.
- **Rabbit holes**: Configuração de permissões no Agendador de Tarefas do Windows, dificuldades de suporte para usuários não técnicos e relatórios de baixa credibilidade visual perante ouvidorias.

### Opção B — Aplicação Desktop Integrada (Dashboard + Bandeja do Sistema + Gerador de Laudos em PDF) [RECOMENDADA]
- **Sketch**: Um aplicativo desktop completo e acessível que inicia com o Windows e opera minimizado na bandeja do sistema (System Tray). Oferece um painel visual responsivo com gráficos de latência em tempo real, status da conexão, indicação clara de interface (Wi-Fi vs. Cabo) e um fluxo simplificado para "Gerar Laudo Pericial de Conexão", produzindo um documento PDF oficial pronto para anexar em reclamações contra o ISP, Procon ou Anatel.
- **Appetite**: medium (3 a 4 semanas)
- **Trade-offs**: Equilibra alta fidelidade visual, facilidade de uso para qualquer perfil de usuário e robustez técnica probatória. Demanda empacotador desktop e biblioteca confiável de geração de PDF e gráficos vetoriais locais.
- **Rabbit holes**: Risco de inflar o escopo tentando incluir testes massivos de velocidade de upload/download contínuos ou recursos complexos de análise de pacotes (DPI) que fogem do propósito de auditoria de estabilidade.

### Opção C — Sonda Externa de Hardware Independente (Appliance Dedicado 24/7)
- **Sketch**: Um dispositivo dedicado (ex.: Raspberry Pi ou firmware customizado) conectado diretamente à porta LAN do modem para monitorar a conexão ininterruptamente 24 horas por dia, independente de o computador pessoal estar ligado.
- **Appetite**: large (meses)
- **Trade-offs**: Captura 100% dos eventos da madrugada e finais de semana sem depender da máquina do usuário. No entanto, introduz barreiras imensas de custo de hardware, distribuição física, instalação complexa na casa do cliente e manutenção remota.
- **Rabbit holes**: Dependência de suprimento de peças físicas, suporte a diferentes topologias de roteadores das operadoras e suporte ao usuário para ligar e configurar cabos físicos.

## Recommendation

Recomenda-se a **Opção B (Aplicação Desktop Integrada)**.
- **Justificativa alinhada às metas:** Resolve exatamente a dor do usuário final ao fornecer um aplicativo que funciona silenciosamente na bandeja do Windows enquanto o computador estiver em uso. Entrega o laudo pericial estruturado em PDF com carimbo de tempo e diferenciação clara entre rede interna e link externo — elemento decisivo para desarmar as alegações padrão do suporte técnico do provedor.
- **Equilíbrio de Custo/Benefício:** Não impõe barreiras de hardware (ao contrário da Opção C) e não exige conhecimentos técnicos avançados do usuário comum (ao contrário da Opção A).

## Out of Scope (for the recommended option)

- Monitoramento com o computador desligado ou em modo de suspensão sem energia.
- Inspeção profunda de pacotes (Deep Packet Inspection - DPI) ou monitoramento do tráfego de outros aparelhos celulares e smart TVs na rede.
- Testes repetitivos e contínuos de saturação de banda (speedtests a cada minuto) que possam esgotar a franquia do plano do cliente.
- Ações invasivas de reconfiguração de roteadores ou firewalls de terceiros.

## Assumptions to Validate

- A emissão de laudos em PDF com resumo cronológico e dados de perda de pacotes possui valor probatório e aceitação nas plataformas do Procon e Anatel Consumidor.
- É possível capturar com precisão os horários de início e encerramento de sessão do Windows (Event IDs 6005/6006/41 ou heartbeat em SQLite) mesmo em contas com privilégios normais de usuário.
- O ping ICMP simultâneo em dois servidores DNS públicos de alta disponibilidade (ex.: 1.1.1.1 e 8.8.8.8) com intervalo padrão de 3 a 5 segundos não é classificado como abuso por firewalls intermediários.
