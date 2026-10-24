---
title: Roblox para desenvolvedores — arquitetura, ferramentas e agentes
---

Kickstart para quem já desenvolve software e quer entender a arquitetura do Roblox, trabalhar pelo repositório e integrar agentes de IA ao fluxo. Recorte da documentação oficial, sem precisar começar por um curso introdutório inteiro.

## Ordem de leitura

| Ordem | Material | O que extrair |
| --- | --- | --- |
| 1 | [Client-server runtime](https://create.roblox.com/docs/projects/client-server) | Modelo de execução, autoridade do servidor e replicação do estado entre servidor e clientes. |
| 2 | [Script types and locations](https://create.roblox.com/docs/scripting/locations) | Onde o código executa: `Script`, `LocalScript`, `ModuleScript`, localização na hierarquia e `RunContext`. |
| 3 | [Remote events and callbacks](https://create.roblox.com/docs/scripting/events/remote) | Comunicação cliente-servidor: eventos sem espera por resposta e chamadas com retorno. |
| 4 | [Third-party tools](https://create.roblox.com/docs/projects/external-tools) | Fluxo baseado em arquivos: sincronização, Rojo e ferramentas externas para versionamento e automação. |
| 5 | [Data stores](https://create.roblox.com/docs/cloud-services/data-stores) | Persistência entre sessões, chaves, leitura, escrita e atualizações concorrentes. |

## Complementos

- [Securing the client-server boundary](https://create.roblox.com/docs/scripting/security/client-server-boundary) — validar no servidor os dados e as ações enviados pelo jogador.
- [Connect to the Roblox Studio MCP server](https://create.roblox.com/docs/studio/mcp) — conectar clientes de IA ao Studio para explorar o modelo, editar scripts e executar playtests; consultar também o suporte a múltiplas instâncias.

## Primeiro experimento

1. Gerar uma sala por código.
2. Permitir que o jogador interaja com um objeto.
3. Validar a ação no servidor.
4. Salvar o resultado com DataStore.

Ler as duas primeiras páginas e começar o protótipo; consultar as demais conforme a necessidade.

## Pontos para levar ao projeto

- **Repositório:** Rojo permite representar o projeto em arquivos locais e gerar um arquivo de jogo sem abrir o Studio. Executar e validar o comportamento na engine é outra etapa.
- **Persistência:** as chaves do DataStore são definidas pela aplicação; podem representar jogadores, guildas ou estado global. O acesso pelo Studio exige uma experiência publicada com acesso às APIs habilitado, preferencialmente em uma experiência de teste separada.
- **Agentes:** o MCP atua sobre uma sessão aberta do Studio. Para trabalho paralelo, usar branches ou worktrees separadas e isolar ou serializar as alterações e os testes no Studio.
- **Validação:** um agente jogar um playtest ajuda a investigar o comportamento, mas não equivale a uma suíte automatizada reproduzível com asserts.

---

Ver também: [[Client Server Architecture]] · [[Databases]]
