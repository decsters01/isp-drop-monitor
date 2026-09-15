# Idea Intake: Monitor Contínuo de Quedas e Auditoria de Conexão ISP

- **Slug**: isp-drop-monitor
- **Created**: 2026-09-15
- **Source**: pasted text
- **Type**: new-capability

## Idea (as captured)

> "A ideia principal vai consistir em resolver o seguinte problema quando a sua internet cai durante o dia O técnico te liga faz alguns testes com você junto com o roteador e tudo funciona bem porém durante o dia inúmeras quedas de internet E et cetera a ideia é a seguinte É criar um programa que acompanhe rotineiramente todo o período com o computador está ligado E com isso ele fica pingando a internet a cada x tempo Para poder provar que aquela velocidade está certa que a internet está com boa conexão ele registra também o horário o computador do usuário foi ligado o horário o computador do usuário foi desligado e registra outros inúmeros dados importantes que realmente são necessárias para poder aprovar que o defeito está na Conexão da empresa Porque toda vez que você liga para para a empresa e pede ela para poder monitorar sua rede eles dizem que está tudo bem porém precisamos arranjar uma forma técnica com laudos e prováveis e palpáveis de que isso realmente não está acontecendo e que existe sim uma queda de conexão abrupta o tempo inteiro na rede Wi-Fi da sua casa Logo dos dados que eles te entregam O nosso software aqui vai visar resolver esse tipo de problema"

## Restated

Desenvolver um software desktop contínuo para Windows que audite a estabilidade da conexão de internet ao longo do período de funcionamento do computador. A aplicação registra uptime do sistema (horários de ligar/desligar), executa sondagens de conectividade (ping periódico e telemetria de rede) e gera laudos técnicos com dados auditáveis para comprovar quedas intermitentes e falhas na prestação de serviço do provedor de internet (ISP).

## Origin & Context

- **Raised by**: Cliente/usuário de provedor de banda larga doméstica ou corporativa.
- **Trigger**: Quedas intermitentes de conexão não identificadas pelo suporte do provedor em testes pontuais, gerando a necessidade de laudos técnicos incontestáveis baseados em telemetria contínua.

## First-Glance Unknowns

- [NEEDS CLARIFICATION: Qual o intervalo padrão de sondagem (ping) e quais destinos devem ser consultados simultaneamente (ex.: roteador local/gateway padrão vs. DNS externo 1.1.1.1/8.8.8.8) para isolar falha no Wi-Fi local de falha externa do link do provedor?]
- [NEEDS CLARIFICATION: Qual o mecanismo recomendado para capturar e persistir o ciclo de vida da máquina no Windows (ex.: leitura do Windows Event Log - Event IDs 6005/6006/41 ou heartbeat contínuo)?]
- [NEEDS CLARIFICATION: Qual o formato exigido para os relatórios técnicos comprobatórios (PDF com gráficos temporais e carimbo de data/hora, exportação CSV/JSON, ou visualização interativa)?]
- [NEEDS CLARIFICATION: Testes de velocidade de download/upload devem ser automáticos (sob agendamento controlado) ou sob demanda para evitar esgotamento da franquia ou saturação da banda do usuário?]
- [NEEDS CLARIFICATION: Qual a tecnologia desktop alvo (ex.: Electron/React, .NET WPF/WinUI, Tauri ou Python GUI) e como o agente em background deve operar (serviço Windows ou aplicativo de bandeja de sistema / System Tray)?]
