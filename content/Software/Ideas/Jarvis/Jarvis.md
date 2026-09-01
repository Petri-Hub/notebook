---
title: Jarvis
status: descontinuado
período: abril de 2026
---

Assistente de IA por voz, sempre ligado, rodando local. A ideia era um sistema ambiente que escuta o contexto, entende as ferramentas do usuário e age em nome dele — criar ticket, escrever código, abrir pull request, buscar na base de código.

Descontinuado por tamanho de escopo, somado à demanda do trabalho na época. O código foi descartado; o que valia era o desenho.

## O que ficou

- [[Vision and Architecture]] — visão, quatro zonas, local bridge pattern, modelo de sessão, camada de transporte, pipeline de áudio, orquestração com LangGraph, sistema de ferramentas, memória e contexto, modelo de dados e roadmap em quatro fases
- [[Desktop Client]] — o cliente desktop
- **Architecture Rules** — regras de arquitetura escritas para agente seguir, em Clean Architecture sobre NestJS. Cada regra traz propósito, inegociáveis e padrões marcados como certo e errado. O `AGENTS.md` é a versão compilada; os arquivos `.mdc` são as regras individuais, prontas para reuso em outro projeto

## Por que guardar

O desenho e as regras são reaproveitáveis. As regras de arquitetura, em especial, funcionam como ponto de partida para qualquer projeto NestJS com Clean Architecture, e são a versão anterior do que hoje vive no sistema de agentes.
