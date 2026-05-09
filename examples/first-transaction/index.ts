import { Keypair } from '@stellar/stellar-sdk';
import axios from 'axios';
import { execSync } from 'child_process';

import { discoverAnchor } from './steps/01-discover';
import { authenticate } from './steps/02-auth';
import { ensureTrustline } from './steps/00-trustline';
import { initiateDeposit } from './steps/03-deposit';
import { pollTransaction } from './steps/04-poll';

const ANCHOR_DOMAIN = 'https://testanchor.stellar.org';
const ASSET_CODE = process.env.ASSET_CODE ?? 'USDC';

async function fundWithFriendbot(publicKey: string): Promise<void> {
  console.log('  Requesting funds from Friendbot...');
  await axios.get(`https://friendbot.stellar.org?addr=${publicKey}`);
  console.log('  Account funded on testnet.');
}

async function main(): Promise<void> {
  const secretKey = process.env.STELLAR_SECRET_KEY;
  const keypair = secretKey ? Keypair.fromSecret(secretKey) : Keypair.random();

  console.log('\n╔══════════════════════════════════════════╗');
  console.log('║   AnchorFlow — First Transaction PoC    ║');
  console.log('╚══════════════════════════════════════════╝\n');
  console.log(`Anchor  : ${ANCHOR_DOMAIN}`);
  console.log(`Asset   : ${ASSET_CODE}`);
  console.log(`Account : ${keypair.publicKey()}`);

  if (!secretKey) {
    console.log(`Secret  : ${keypair.secret()}  ← save this to reuse the account\n`);
    await fundWithFriendbot(keypair.publicKey());
  }

  // Step 1 — SEP-1
  console.log('\n[1/5] SEP-1 — Discovering anchor...');
  const config = await discoverAnchor(ANCHOR_DOMAIN);
  console.log(`  auth endpoint   : ${config.webAuthEndpoint}`);
  console.log(`  transfer server : ${config.transferServerSep24}`);
  console.log(`  network         : ${config.networkPassphrase}`);
  const assetIssuer = config.currencies[ASSET_CODE];
  if (assetIssuer) console.log(`  ${ASSET_CODE} issuer    : ${assetIssuer}`);

  // Step 2 — SEP-10
  console.log('\n[2/5] SEP-10 — Authenticating...');
  const token = await authenticate(config.webAuthEndpoint, config.networkPassphrase, keypair);
  console.log(`  JWT obtained    : ${token.slice(0, 32)}...`);

  // Step 3 — Trustline
  if (assetIssuer) {
    console.log(`\n[3/5] Trustline — Ensuring ${ASSET_CODE} trustline on account...`);
    await ensureTrustline(keypair, config.networkPassphrase, ASSET_CODE, assetIssuer);
  }

  // Step 4 — SEP-24
  console.log(`\n[4/5] SEP-24 — Initiating ${ASSET_CODE} deposit...`);
  const deposit = await initiateDeposit(
    config.transferServerSep24,
    token,
    keypair.publicKey(),
    ASSET_CODE,
    assetIssuer,
  );
  console.log(`  Transaction ID  : ${deposit.id}`);
  console.log(`  Interactive URL : ${deposit.url}`);

  console.log('\n>>> Opening deposit form in browser...');
  console.log(`>>> If it does not open automatically, visit:\n>>> ${deposit.url}\n`);
  try {
    execSync(`open "${deposit.url}"`);
  } catch {
    // User can open the URL manually
  }

  // Step 4 — Polling
  console.log('[5/5] Polling transaction status (Ctrl+C to stop)...');
  const result = await pollTransaction(config.transferServerSep24, token, deposit.id);

  console.log(`\nFinal status: ${result.status}`);
}

main().catch(err => {
  console.error('\nError:', (err as Error).message ?? err);
  process.exit(1);
});
