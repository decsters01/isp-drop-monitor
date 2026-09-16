# 🛡️ Monitor de Conexão ISP & Auditoria de Quedas de Rede

> **Software desktop para Windows que monitora silenciosamente sua internet, diferencia quedas da operadora de oscilações do Wi-Fi local e gera laudos técnicos periciais em PDF com Hash SHA-256 para anexar em reclamações na Anatel, Procon e Ouvidorias.**

[![Plataforma](https://img.shields.io/badge/Plataforma-Windows%2010%20%7C%2011%20(x64)-blue.svg?style=flat-square)](https://github.com/decsters01/isp-drop-monitor)
[![Tecnologia](https://img.shields.io/badge/Stack-Electron%20%7C%20TypeScript%20%7C%20React%20%7C%20Tailwind%20%7C%20SQLite-0B0F19.svg?style=flat-square)](https://github.com/decsters01/isp-drop-monitor)
[![Licença](https://img.shields.io/badge/Licença-MIT-green.svg?style=flat-square)](LICENSE)

---

## 🛑 Qual dor este projeto resolve?

Quem trabalha em home office, estuda a distância ou joga online conhece esta rotina frustrante:

1. **A internet cai várias vezes ao dia**, interrompendo chamadas no Teams/Google Meet, conexões VPN e transações.
2. Você abre um chamado no suporte do provedor (ISP).
3. O atendente te liga minutos depois, pede para você reiniciar o modem e executa um teste rápido de velocidade de 30 segundos.
4. Por azar ou coincidência, naquele minuto a conexão respondeu normalmente, e a resposta padrão do suporte é:
   > *"Aqui na nossa central o sinal está normal. O problema deve ser interferência no seu roteador Wi-Fi ou no seu aparelho."*
5. Você continua pagando a mensalidade cheia por um serviço instável e fica de mãos atadas por **falta de provas técnicas estruturadas**.

O **Monitor de Conexão ISP** foi criado especificamente para **acabar com a assimetria técnica entre o consumidor e a operadora**.

---

## ⚡ Como o software comprova a falha da operadora?

### 1. Sondagem em Dupla Camada (Dual-Layer Probing)
Para derrotar o argumento de *"a culpa é do seu Wi-Fi"*, o software monitora continuamente dois destinos em paralelo:
- **Camada Local:** O Gateway Padrão (roteador da sua casa, ex: `192.168.1.1`).
- **Camada Externa (Internet):** Destinos públicos de alta disponibilidade (`1.1.1.1` da Cloudflare e `8.8.8.8` do Google).

> **A Prova Técnica Irrefutável:**  
> Se o ping para o seu roteador local responder em menos de **2 milissegundos com 0% de perda de pacotes**, mas as consultas externas para a internet falharem simultaneamente, **está matematicamente comprovado que a sua rede Wi-Fi está 100% íntegra** e que a interrupção ocorreu no link de fibra/cabo fornecido pela operadora.

### 2. Auditoria Real do Ciclo de Vida do PC (Uptime do Windows)
Provedores frequentemente alegam: *"o cliente não navegou porque o computador estava desligado"*.
- O software grava um batimento contínuo (*heartbeat*) a cada 30 segundos em banco SQLite local.
- Identifica com precisão o momento do boot, desligamento e suspensão (Sleep/Resume) do Windows.
- O cálculo da taxa de disponibilidade (% de uptime da internet) é feito **estritamente em cima das horas em que o computador do usuário esteve ligado**, eliminando qualquer margem de contestação.

### 3. Resiliência com Fallback TCP Inteligente
Muitos roteadores residenciais vêm de fábrica com regras que descartam pacotes de ping (ICMP Echo). Nesses casos, o motor executa automaticamente um **handshake TCP nas portas 53 (DNS), 80 (HTTP) ou 443 (HTTPS)** do roteador, comprovando a integridade da comunicação local sem falsos alertas.

### 4. Laudo Pericial Oficial em PDF com Hash SHA-256
Com apenas um clique, o aplicativo gera um documento formal em PDF contendo:
- Dados cadastrais do assinante, operadora, número de contrato e protocolo contestado.
- Resumo executivo de horas de PC ligado vs. minutos de internet fora do ar.
- Comparativo com a meta regulatória oficial (**Resoluções 574 e 632 da Anatel**).
- Tabela cronológica com a data e o segundo exato de cada queda e a segregação de culpa.
- **Hash Criptográfico SHA-256** e ID Único de Emissão no rodapé, assegurando que o relatório não foi adulterado.

---

## ✨ Recursos da Aplicação

- **Dashboard Dark Profissional:** Interface moderna nas cores preto e azul escuro (`#070B14` e `#0B0F19`), com cards de métricas, efeitos interativos de hover e renderização a 60 FPS.
- **Múltiplos Gráficos Analíticos:**
  - *Tempo Real:* Gráfico comparando a latência do gateway local contra a internet externa.
  - *Estabilidade Diária:* Barras dos últimos 7 dias mostrando horas de uso do PC vs. minutos de queda do ISP.
  - *Distribuição de Qualidade:* Percentual de amostras entre conexões Ótimas, Normais, Instáveis e Quedas.
- **Tabela Interativa:** Busca instantânea por data/hora, paginação e filtros rápidos (*Apenas ISP*, *Apenas Local*, *Todos*).
- **Operação Silenciosa na Bandeja (System Tray):**
  - Ao fechar a janela no "X", o programa continua rodando minimizado junto ao relógio do Windows.
  - Notificações nativas na tela avisam quando uma queda de internet é confirmada.
- **Privacidade Total e Baixo Consumo:**
  - Banco de dados SQLite local em modo WAL.
  - 100% offline: nenhum dado pessoal ou de tráfego é enviado para servidores externos.
  - Consumo de CPU inferior a 1% e tráfego de sondagem de rede desprezível (< 2 KB/min).
  - Execução sob permissões normais de usuário (sem necessidade de privilégios de Administrador / UAC).

---

## 🚀 Como Usar

### Opção 1: Baixar o Executável para Windows (.exe)
Você pode baixar os binários prontos gerados na pasta `release/` ou na aba de [Releases](https://github.com/decsters01/isp-drop-monitor/releases):
- **`Monitor de Conexao ISP Setup 1.0.0.exe`**: Instalador oficial para Windows 10/11 x64 (instalação em 1 clique com atalhos).
- **`Monitor de Conexao ISP 1.0.0.exe`**: Versão portátil (*portable*), pronta para rodar sem necessidade de instalação.

---

### Opção 2: Rodar o Código em Desenvolvimento

#### Pré-Requisitos
- [Node.js](https://nodejs.org/) v20+ LTS instalado no computador.
- Windows 10 ou Windows 11.

#### Passo a Passo
```bash
# 1. Clone este repositório
git clone https://github.com/decsters01/isp-drop-monitor.git
cd isp-drop-monitor

# 2. Instale as dependências
npm install

# 3. Inicie em modo de desenvolvimento com hot-reload
npm run dev

# 4. Para rodar a suíte de testes unitários automatizados
npm test

# 5. Para compilar o instalador executável (.exe) na pasta release/
npm run build:exe
```

---

## 🏛️ Base Legal e Regulatória (Anatel)

O laudo gerado por esta ferramenta é fundamentado nas normas vigentes do setor de telecomunicações no Brasil:
- **Resolução nº 574/2011 da Anatel (R-QST):** Define os parâmetros de qualidade para redes de banda larga fixa, incluindo metas de disponibilidade e latência.
- **Resolução nº 632/2014 da Anatel (RGC):** Garante ao consumidor o **desconto proporcional na fatura** por períodos de interrupção de serviço, além de amparo para **rescisão contratual sem cobrança de multa de fidelidade** em caso de descumprimento contínuo da oferta contratada.

---

## 📜 Licença

Este projeto é disponibilizado sob a licença [MIT](LICENSE). Desenvolvido para proteger os direitos de consumidores e profissionais que dependem de estabilidade em sua conexão de internet.
