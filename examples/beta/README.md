# AnchorFlow SDK — Beta Fechado

## Objetivo

Validar o SDK em produção controlada com 2-3 aplicações parceiras, garantindo que menos de 5% dos erros de integração não sejam tratados automaticamente pelo SDK.

---

## Critérios de Sucesso

| Métrica | Meta | Status |
|---------|------|--------|
| Anchors suportados sem código customizado | ≥ 5 | ✅ 6/6 |
| Testes automatizados passando | 100% | ✅ 159/159 |
| Erros não tratados pelo SDK | < 5% | 🔄 Monitorando |
| Tempo médio de integração por anchor | < 1 hora | 🔄 Monitorando |
| Cobertura de protocolos SEP | SEP 1,6,10,12,24,31,38 | ✅ Completo |

---

## Anchors Validados

| Anchor | Domínio | País | SEPs | Status |
|--------|---------|------|------|--------|
| SDF Testnet | testanchor.stellar.org | — | 6,10,12,24,31 | ✅ Validado |
| CLPX | clpx.finance | Chile | 6,10,12,24,31 | ✅ Validado |
| Anclap | anclap.com | Brasil/ARG | 6,10,12,24 | ✅ Validado |
| MoneyGram | stellar.moneygram.com | EUA | 10,24 | ✅ Validado |
| Cowrie | cowrie.exchange | Nigéria | 6,10,12,31 | ✅ Validado |
| Stellarport | stellarport.io | Global | 6,10 | ✅ Validado |

---

## Exceções Encontradas

| Anchor | Exceção | Impacto | Solução |
|--------|---------|---------|---------|
| MoneyGram | Não suporta SEP-12 | Baixo | SDK detecta e ignora gracefully |
| Todos | KYC requer autenticação | Esperado | Fluxo padrão SEP-10 → SEP-12 |

---

## Plano de Beta

### Fase 1 — Validação interna (concluída)
- [x] SDK publicado no npm
- [x] 159 testes passando
- [x] CI/CD configurado
- [x] 6 anchors validados
- [x] KYC survey realizado

### Fase 2 — Beta fechado (em andamento)
- [ ] Selecionar 2-3 apps parceiras
- [ ] Integrar SDK nas apps parceiras
- [ ] Monitorar erros por 30 dias
- [ ] Documentar exceções encontradas
- [ ] Atingir meta de < 5% erros não tratados

### Fase 3 — Lançamento público
- [ ] Resolver todas as exceções críticas
- [ ] Publicar versão 1.0.0 no npm
- [ ] Anunciar no ecossistema Stellar
- [ ] Submeter ao Stellar Anchor Directory

---

## Monitoramento de Erros

Erros são classificados em três categorias:

| Categoria | Descrição | Ação |
|-----------|-----------|------|
| **Tratado** | SDK normalizou o erro automaticamente | Nenhuma |
| **Parcial** | SDK detectou mas não normalizou completamente | Backlog |
| **Não tratado** | Erro inesperado que chegou até o app | Crítico — corrigir imediatamente |

---

## Contato

- **Repositório:** https://github.com/rmagagnini/Anchorflow
- **npm:** https://www.npmjs.com/package/anchorflow-sdk
- **Issues:** https://github.com/rmagagnini/Anchorflow/issues