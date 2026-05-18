# ⚓ AnchorFlow SDK

> Uma integração. Qualquer anchor. O mundo inteiro.

SDK que conecta aplicações financeiras aos anchors da rede Stellar —
cobrindo autenticação, KYC, depósito, saque e remessa internacional
com uma única integração.

---

## 🚀 O que é

O AnchorFlow SDK é uma camada de abstração que elimina a complexidade
de integrar anchors Stellar. Em vez de reescrever autenticação, KYC e
gestão de estados para cada provedor, você integra uma vez e o SDK
resolve o resto.

---

## 💡 Por que usar

| Sem AnchorFlow SDK | Com AnchorFlow SDK |
|---|---|
| Semanas por anchor | Horas por integração |
| KYC repetido a cada anchor | KYC reutilizado automaticamente |
| Polling manual de estados | Monitoramento em background |
| Código específico por provedor | Interface única padronizada |
| Zero observabilidade | Erros normalizados e rastreáveis |

---

## ✅ Diferenciais

- **Normalização entre anchors** — interface única independente do provedor
- **KYC reutilizável** — dados verificados uma vez, usados sempre
- **Roteamento automático** — detecta e escolhe entre SEP-6 e SEP-24
- **Polling automático** — estados monitorados em background
- **Zero lock-in** — funciona com qualquer anchor SEP-compatível
- **Sem custo por transação** — open protocol, sem dependência de fornecedor

---

## 🔧 Protocolos cobertos

| Protocolo | Função |
|---|---|
| SEP-1 | Descoberta do anchor via stellar.toml |
| SEP-10 | Autenticação e geração de JWT |
| SEP-12 | KYC e verificação de identidade |
| SEP-6 | Depósito e saque via API |
| SEP-24 | Fluxo interativo via interface do anchor |
| SEP-31 | Pagamentos cross-border entre anchors |

---

## 🏗️ Arquitetura
_______________________________________________________

##Aplicação cliente


## ⚡ Início rápido

```bash
npm install @anchorflow/sdk
```

```typescript
import { AnchorFlow } from "@anchorflow/sdk";

const sdk = new AnchorFlow({
  network: "testnet",
  anchorDomain: "testanchor.stellar.org",
});

// Descoberta automática do anchor
const anchor = await sdk.discover();

// Autenticação SEP-10
const token = await sdk.authenticate(keypair);

// Depósito via SEP-24
const deposit = await sdk.deposit({
  asset: "SRT",
  amount: "100",
});
```

---

## 🌐 Ambiente de testes

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/anchorflow-sdk

# Entre na pasta
cd AnchorFlowSDK

# Instale as dependências
npm install

# Configure o ambiente
cp .env.example .env

# Crie sua conta na Testnet
npm run setup

# Teste a conexão com o anchor
npm run dev
```

---

## 🗺️ Roadmap

- [x] Ambiente de testes configurado
- [x] Conexão com anchor de referência da SDF
- [ ] Integração com anchor real — Brasil (PIX · SEP-24)
- [ ] Integração com anchor real — EUA (SEP-6)
- [ ] Integração com anchor real — Filipinas (SEP-31)
- [ ] Beta fechado com apps parceiras
- [ ] Lançamento público

---

## 👥 Equipe

| Nome | Função |
|---|---|
| Robson Maia Nascimento | Líder do Projeto |
| Leonardo Marques da Silva | Desenvolvedor |
| Herick Danilo da Rocha Guimarães | Desenvolvedor |
| Renan Cantidório Magagnini | Desenvolvedor |

---

## 🏆 Programa

Desenvolvido no **Stellar37°** — programa de aceleração
**nearx × Stellar Foundation** · Rio de Janeiro · mai–jun 2025

---

## 📄 Licença

MIT License — livre para uso pessoal e comercial.

---

> **AnchorFlow SDK** · Stellar Network · SEP Protocol · anchorflow.dev



