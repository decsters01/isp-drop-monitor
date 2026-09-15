# Quickstart & Validation Guide: Monitor Contínuo de Quedas e Auditoria ISP

**Feature**: `001-isp-drop-monitor` | **Date**: 2026-09-15

Este guia descreve os cenários de validação de ponta a ponta para verificar a conformidade do software desktop com os requisitos de auditoria de rede e laudos periciais.

---

## 1. Pré-Requisitos do Ambiente

- **Sistema Operacional**: Windows 10 ou 11 (64-bit).
- **Runtime**: Node.js v20+ LTS instalado (`node -v`).
- **Permissões**: Conta de usuário padrão do Windows (sem necessidade de privilégios de Administrador / UAC).

---

## 2. Cenários de Validação de Ponta a Ponta

### Cenário 1: Inicialização Limpa e Operação Discreta na Bandeja
1. **Ação**: Iniciar a aplicação desktop em modo de monitoramento.
2. **Resultado Esperado**:
   - Ícone do monitor exibido na bandeja do sistema (System Tray) com tooltip indicando status: "Conexão Estável - 0% Perda".
   - Banco de dados SQLite criado localmente no diretório de dados da aplicação com modo WAL ativo.
   - Registro imediato da sessão operacional com `boot_time` e batimentos contínuos a cada 30 segundos.

### Cenário 2: Simulação de Queda Externa do ISP (Fibra Desconectada / Roteador Ativo)
1. **Condição Inicial**: Computador conectado ao Wi-Fi ou cabo Ethernet; internet navegando.
2. **Ação de Teste**: Desconectar o cabo de fibra/linha de dados externa do modem, mantendo a conexão Wi-Fi ativa com o roteador.
3. **Resultado Esperado**:
   - O ping para o gateway local (ex.: `192.168.1.1`) permanece com 0% de perda e latência normal (< 2ms).
   - As consultas para `1.1.1.1` e `8.8.8.8` falham consecutivamente.
   - Após 5 segundos contínuos sem resposta externa, o estado muda para `QUEDA_EXTERNA_ISP`.
   - Notificação discreta na bandeja informando início da queda atribuída ao provedor.
   - Ao reconectar a fibra, o evento de queda é fechado e gravado no histórico com duração exata em segundos e carimbo de início/fim.

### Cenário 3: Simulação de Queda Local / Roteador Desligado
1. **Ação de Teste**: Desativar a placa de rede do computador ou desligar o roteador da tomada.
2. **Resultado Esperado**:
   - Ambos os alvos (gateway local e internet externa) falham simultaneamente.
   - O evento é registrado como `FALHA_LOCAL_ROTEADOR`, evitando imputar indevidamente a falha à operadora.

### Cenário 4: Resiliência a Roteadores com Bloqueio de ICMP (Fallback TCP)
1. **Condição**: Roteador com descarte de pacotes ICMP Echo ativo.
2. **Resultado Esperado**:
   - O motor aciona automaticamente a checagem TCP SYN nas portas 53, 80 ou 443 do roteador.
   - A resposta TCP confirma a integridade do link local sem classificar falso positivo de rede local inoperante.

### Cenário 5: Emissão e Validação do Laudo Pericial em PDF
1. **Ação de Teste**: No Dashboard, acessar o painel "Gerar Laudo", informar os dados cadastrais (opcional) e clicar em "Exportar Laudo em PDF".
2. **Resultado Esperado**:
   - O documento em PDF é gerado em menos de 5 segundos.
   - O documento exibe cabeçalho oficial, taxa de disponibilidade percentual (proporcional às horas de PC ligado), tabela cronológica de todas as ocorrências de queda do ISP e o Hash SHA-256 com ID único de emissão no rodapé.
