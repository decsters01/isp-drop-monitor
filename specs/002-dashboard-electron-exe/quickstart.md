# Quickstart & Build Guide: Dashboard Dark e Executável Electron

**Feature**: `002-dashboard-electron-exe` | **Date**: 2026-09-15

## 1. Execução em Modo de Desenvolvimento
Para testar o dashboard dark interativo em tempo real:
```bash
npm run dev
```
O Vite iniciará o servidor de desenvolvimento e o Electron abrirá a janela desktop com suporte a hot-reload imediato.

## 2. Compilação e Geração do Executável Windows (.exe)
Para empacotar a aplicação em um instalador autônomo `.exe` para Windows:
```bash
npm run build:exe
```
O `electron-builder` executará o empacotamento e gerará o instalador executável na pasta `release/`:
- `release/Monitor-Conexao-ISP-Setup-1.0.0.exe` (Instalador NSIS oficial)
- `release/Monitor-Conexao-ISP-1.0.0-portable.exe` (Versão portátil sem instalação)

## 3. Validação do Instalador Executável
1. Copiar o arquivo `Monitor-Conexao-ISP-Setup-1.0.0.exe` ou dar duplo clique.
2. O assistente instalará em segundos sem solicitar permissão de Administrador.
3. O software criará o atalho e inicializará na bandeja do sistema (System Tray) com o tema dark carregado.
