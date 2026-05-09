# AnchorFlow — Contexto do Projeto

## O que é
SDK para abstrair a conexão com anchors da rede Stellar, encapsulando os protocolos SEP-1, SEP-10, SEP-12 e SEP-24.

## Objetivo imediato
Implementar em `examples/first-transaction/` um fluxo completo de transação na Testnet Stellar em TypeScript, de forma manual (sem o SDK ainda), que sirva como prova de conceito e referência para os módulos futuros.

---

## PoC concluída — Primeira transação executada com sucesso

### Conta usada na testnet
- **Chave pública:** `GB2MEOWHKT37IMKJYZEKR65I6YKAPRZOLEL2WCO4OTWCRKSQHQ5RMBCB`
- **Explorer:** https://stellar.expert/explorer/testnet/account/GB2MEOWHKT37IMKJYZEKR65I6YKAPRZOLEL2WCO4OTWCRKSQHQ5RMBCB

### Primeira transação
- **Hash:** `ecf29e6862502c261021c4ac318afecd612aa83ec32b68ed0c4c1a79c3a8cbe8`
- **Explorer:** https://stellar.expert/explorer/testnet/tx/ecf29e6862502c261021c4ac318afecd612aa83ec32b68ed0c4c1a79c3a8cbe8
- **Resultado:** depósito de 5 USDC → recebido 4.5 USDC (fee: 0.5 USDC)
- **Ledger:** 2471797 — `2026-05-09T22:53:05Z`

---

## Como rodar o exemplo

```bash
npm install
npm run example
```

Na primeira execução, gera um keypair novo e financia via Friendbot. Para reusar uma conta já existente:

```bash
STELLAR_SECRET_KEY=SA3I44... npm run example
```

Para trocar o ativo (padrão: USDC):

```bash
ASSET_CODE=SRT STELLAR_SECRET_KEY=SA3I44... npm run example
```

---

## Estrutura implementada

```
examples/
└── first-transaction/
    ├── index.ts              # Orquestrador dos 5 passos
    └── steps/
        ├── 00-trustline.ts   # Cria trustline on-chain para o ativo
        ├── 01-discover.ts    # SEP-1: lê stellar.toml
        ├── 02-auth.ts        # SEP-10: challenge + JWT
        ├── 03-deposit.ts     # SEP-24: inicia depósito interativo
        └── 04-poll.ts        # Polling de status da transação
```

---

## O que cada passo faz e por quê

### 00 — Trustline
Na Stellar, uma conta precisa declarar explicitamente que aceita receber um ativo não-nativo (como USDC). Isso é feito com uma operação `ChangeTrust` enviada à blockchain. Sem isso, qualquer pagamento de USDC para a conta é rejeitado pela rede.

**Aprendizado:** o anchor tenta enviar USDC após o usuário completar o formulário. Se a trustline não existir, a transação falha com `HostError: Error(Contract, #13) — trustline entry is missing`. Esse passo deve sempre anteceder qualquer depósito de ativo não-nativo.

### 01 — SEP-1 (Discover)
Busca o arquivo `/.well-known/stellar.toml` do anchor. Esse arquivo declara os endpoints (`WEB_AUTH_ENDPOINT`, `TRANSFER_SERVER_SEP0024`), a passphrase da rede e os ativos suportados com seus issuers.

**Por quê:** sem o TOML, o cliente não sabe nem para onde mandar as requisições. É a única fonte de verdade sobre a configuração do anchor.

### 02 — SEP-10 (Auth)
Fluxo de autenticação por assinatura criptográfica:
1. `GET /auth?account=<pubkey>` → o anchor devolve uma transação Stellar não submetida (o "challenge")
2. O cliente assina essa transação com sua chave privada
3. `POST /auth` com a transação assinada → o anchor verifica e devolve um JWT

**Por quê:** provar identidade na Stellar não usa senha — usa assinatura de keypair. O JWT obtido autoriza todas as chamadas seguintes ao anchor.

### 03 — SEP-24 (Deposit)
`POST /transactions/deposit/interactive` com o JWT, asset_code e asset_issuer. O anchor devolve um `id` e uma `url` para um formulário interativo onde o usuário preenche o valor e confirma o depósito.

**Por quê:** o SEP-24 é "interativo" porque o anchor precisa coletar dados do usuário (valor, às vezes KYC) via uma UI própria antes de executar a transação on-chain. O formato do body deve ser `multipart/form-data` — `application/x-www-form-urlencoded` é rejeitado pelo testanchor.

### 04 — Polling
`GET /transaction?id=<id>` repetido a cada 5 segundos. Os status transitórios são `incomplete → pending_user_transfer_start → pending_anchor`. O status `completed` indica que o USDC chegou na conta. O campo `stellar_transaction_id` presente no status final é o hash da transação on-chain.

**Por quê:** o depósito interativo é assíncrono — o anchor processa após o usuário submeter o formulário. O cliente precisa monitorar até um status terminal (`completed`, `error`, `refunded`, `expired`).

---

## Anchor alvo (Testnet)
https://testanchor.stellar.org

## Stack
- TypeScript + tsx (runtime)
- `@stellar/stellar-sdk` — keypair, transações, trustline, Horizon
- `axios` — chamadas HTTP aos endpoints SEP

---

## Mapeamento futuro SDK
| Passo | Módulo futuro |
|-------|--------------|
| Trustline | `AccountSetup` |
| SEP-1 fetch .toml | `AnchorDiscovery` |
| SEP-10 auth | `AuthManager` + `TokenStore` |
| SEP-24 deposit | `TransferService` |
| Polling | `TransactionMonitor` |