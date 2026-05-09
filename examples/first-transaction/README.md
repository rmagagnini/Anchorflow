# First Transaction — AnchorFlow PoC

End-to-end deposit flow against the SDF test anchor (`testanchor.stellar.org`) using SEP-1, SEP-10, and SEP-24.

## Steps

| File | Protocol | What it does |
|------|----------|-------------|
| `steps/01-discover.ts` | SEP-1 | Fetches `stellar.toml` and extracts endpoints |
| `steps/02-auth.ts` | SEP-10 | Challenge/response → JWT |
| `steps/03-deposit.ts` | SEP-24 | Starts interactive deposit, returns URL + transaction ID |
| `steps/04-poll.ts` | SEP-24 | Polls `/transaction` until a terminal status is reached |

## Run

```bash
# From the repo root
npm install
npm run example
```

The script generates a fresh keypair on first run and funds it via Friendbot.  
To reuse an existing account, set the environment variable before running:

```bash
STELLAR_SECRET_KEY=S... npm run example
```

To change the asset (default is `USDC`):

```bash
ASSET_CODE=SRT npm run example
```

## Interactive step

After step 3, a browser window opens with the anchor's deposit form.  
Complete the form while the script polls for status updates.

## Future SDK mapping

| Step | AnchorFlow module |
|------|------------------|
| `01-discover.ts` | `AnchorDiscovery` |
| `02-auth.ts` | `AuthManager` + `TokenStore` |
| `03-deposit.ts` | `TransferService` |
| `04-poll.ts` | `TransactionMonitor` |
