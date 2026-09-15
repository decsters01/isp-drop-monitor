# Idea Research: Monitor Contínuo de Quedas e Auditoria de Conexão ISP

- **Slug**: isp-drop-monitor
- **Created**: 2026-09-15
- **Evidence confidence (overall)**: high

## Users & Demand

- **Consumidores em Trabalho Remoto (Home Office) e Educação a Distância:** Sofrem prejuízos diretos com quedas intermitentes durante reuniões de áudio/vídeo e acessos a VPNs corporativas, mas enfrentam suporte de primeiro nível do provedor que executa testes rápidos quando a conexão já voltou e encerra o chamado sem solução. — [source: Reclame Aqui / Fóruns de Telecomunicação | ASSUMPTION] (confidence: high)
- **Gamers e Transmissores de Conteúdo (Streamers):** Altamente sensíveis a jitter (variação de latência) e microquedas que desassociam sessões de jogos online, cuja instabilidade não é capturada por medidores comuns de velocidade pontual. — [source: Comunidades de jogos e redes | ASSUMPTION] (confidence: high)
- **Consumidores em Disputa com Órgãos Reguladores (Procon / Anatel):** Usuários que buscam rescisão contratual sem multa por quebra de SLA ou ressarcimento financeiro proporcional aos períodos de interrupção, necessitando de registros cronológicos irrefutáveis. — [source: Resolução nº 574/2011 e 632/2014 da Anatel | cited] (confidence: high)

## Prior Art

- **PingPlotter (Comercial / Proprietário):** Ferramenta referência para rastreamento contínuo de rotas e perda de pacotes. Possui recursos avançados de diagnóstico de rede, porém possui licença comercial cara, interface complexa voltada a engenheiros de rede e não gera laudos periciais simplificados voltados para o consumidor leigo apresentar ao Procon ou ISP. — [source: PingPlotter Documentation | cited]
- **WinMTR / MTR (Open Source):** Utilitário clássico de traceroute contínuo. Não possui persistência em banco de dados local para longo prazo (dias ou semanas), não registra ciclo de inicialização/desligamento da máquina (uptime) e não emite relatórios com valor documental. — [source: WinMTR GitHub / SourceForge | cited]
- **SmokePing (Linux / Servidores):** Solução robusta para medição de latência em servidores, mas inadequada para usuários finais em desktops Windows comuns devido à complexidade de instalação e ausência de cliente desktop nativo. — [source: SmokePing Project | cited]
- **Speedtest CLI / Ookla:** Focado exclusivamente em medição instantânea de largura de banda (upload/download). Executá-lo continuamente é inviável, pois consome centenas de gigabytes de tráfego, satura o link e mascara o uso normal da rede. — [source: Ookla Speedtest CLI | cited]

## Market & Context

- **Argumento Padrão das Operadoras de Telecom:** A justificativa mais comum dos ISPs para descartar reclamações de instabilidade é culpar o roteador Wi-Fi do cliente, a distância física do modem ou interferências no ambiente doméstico.
- **Isolamento de Causa Raiz como Diferencial Crítico:** Para que o laudo técnico seja incontestável, o software deve obrigatoriamente realizar sondagens simultâneas em duas camadas:
  1. *Camada Local:* Ping contínuo no Gateway Padrão (IP do roteador local, ex.: `192.168.1.1`). Se a latência estiver baixa (< 2ms) e sem perda de pacotes, fica tecnicamente comprovado que o Wi-Fi e a rede interna estão íntegros.
  2. *Camada Externa (Internet):* Ping contínuo em endereços de alta disponibilidade (ex.: `1.1.1.1` e `8.8.8.8`). Se a perda ocorrer no destino externo enquanto o gateway local responde perfeitamente, a queda está comprovadamente no link da operadora (fibra óptica, rota de trânsito ou cabo externo).
- **Custo da Inação:** O cliente continua pagando o valor integral da mensalidade por um serviço degradado, perde reuniões de trabalho e não possui base documental para exigir reparo ou isenção de multa rescisória.

## Data & Constraints

- **Registro de Ciclo de Vida do Windows (Uptime/Downtime do PC):**
  - O software pode auditar o histórico de eventos nativos do Windows através do *Windows Event Log* (Log `System`):
    - *Event ID 6005:* Serviço de registro de eventos iniciado (indica inicialização do sistema).
    - *Event ID 6006:* Encerramento limpo do sistema operacional.
    - *Event ID 41:* Reinicialização inesperada ou queda de energia (Kernel-Power).
  - Complementado por um *Heartbeat* gravado a cada 30 ou 60 segundos em banco de dados SQLite local para garantir contabilidade precisa de minutos operacionais da máquina. — [source: Microsoft Windows Event Log Documentation | cited]
- **Consumo de Recursos e Sobrecarga de Rede:**
  - Pacotes ICMP Echo (ping) padrão possuem tamanho ínfimo (32 a 64 bytes).
  - Um ping disparado a cada 2 ou 5 segundos gera menos de 2 KB de tráfego por minuto, garantindo impacto nulo no consumo de banda do usuário e uso de CPU insignificante (< 0.5%).
- **Persistência de Dados Local e Privacidade:**
  - Todas as métricas devem ser gravadas em SQLite embutido, dispensando bancos de dados externos e garantindo privacidade total sem envio de dados a terceiros.

## Evidence Against the Idea

- **Contestação Técnica do ISP sobre Conexões Sem Fio (Wi-Fi):** Provedores de internet historicamente recusam laudos de testes feitos via Wi-Fi, alegando oscilação no canal de rádio (2.4 GHz / 5 GHz). O software DEVE identificar e carimbar se a interface em uso é `802.11 (Wi-Fi)` ou `Ethernet (Cabo)`, e emitir alerta explícito recomendando que testes oficiais para disputas legais priorizem cabo Ethernet, embora a correlação com o gateway local ajude a mitigar esse argumento.
- **Falsos Positivos por Bloqueio de ICMP / Rotas Temporárias:** Se um único servidor de DNS sofrer manutenção ou limitar pacotes ICMP, pode parecer que a internet caiu. O algoritmo DEVE utilizar pelo menos dois alvos públicos independentes (ex.: Cloudflare `1.1.1.1` e Google `8.8.8.8`) e considerar queda de internet somente quando ambos falharem simultaneamente com o gateway local ativo.
- **Necessidade de Manter o Computador Ligado:** O software só audita a conexão enquanto a máquina do usuário estiver em funcionamento. Se o usuário desliga o PC durante a noite, não há como auditar a rede nesse período sem um dispositivo dedicado (como um Raspberry Pi ou roteador customizado). O laudo deve deixar explícito que o cálculo de disponibilidade (% uptime da rede) é proporcional ao tempo em que o computador esteve operacional.

## Gaps & Open Questions

- [NEEDS CLARIFICATION: Qual o intervalo ótimo de amostragem padrão (ex.: 2 segundos durante instabilidade e 5 segundos em regime estável)?]
- [NEEDS CLARIFICATION: O software deve incluir testes pontuais de velocidade (Speedtest) sob demanda ou agendados, considerando o risco de consumo de banda?]
- [NEEDS CLARIFICATION: Como estruturar visualmente o PDF do laudo técnico para ter validade e clareza perante a Anatel e Procon (ex.: resumo executivo de horas de indisponibilidade, gráfico consolidado diário/semanal e lista das ocorrências com duração superior a X segundos)?]

## Sources

- `docs.google.com` (host: docs.google.com, policy: allowlisted) — Referências a normativas de qualidade da Anatel e histórico de SLAs de banda larga.
- `github.com` (host: github.com, policy: allowlisted) — Repositórios e padrões de medição de latência via ICMP e WinMTR.
- `stackoverflow.com` (host: stackoverflow.com, policy: allowlisted) — Práticas recomendadas para leitura de Event ID 6005/6006 no Windows e uso de `IcmpSendEcho`.
