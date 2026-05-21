import * as dotenv from 'dotenv';
import { Keypair } from '@stellar/stellar-sdk';
import { AnchorFlow } from 'anchorflow-sdk';
import { ensureTrustline } from './steps/00-trustline';
import { authenticate } from './steps/02-auth';
import { initiateDeposit } from './steps/03-deposit';
import { pollTransaction } from './steps/04-poll';
import * as fs from 'fs';

dotenv.config();

const ANCHOR_DOMAIN  = process.env['ANCHOR_DOMAIN']  ?? 'testanchor.stellar.org';
const ASSET_CODE     = process.env['ASSET_CODE']     ?? 'SRT';
const ASSET_ISSUER   = process.env['ASSET_ISSUER']   ?? '';
const STELLAR_SECRET = process.env['STELLAR_SECRET_KEY'] ?? '';

async function main(): Promise<void> {
  console.log('\n╔══════════════════════════════════════════════╗');
  console.log('║   AnchorFlow SDK — First Transaction         ║');
  console.log('╚══════════════════════════════════════════════╝\n');

  const keypair = Keypair.fromSecret(STELLAR_SECRET);
  const sdk = new AnchorFlow({ network: 'testnet' });

  console.log(`Anchor  : ${ANCHOR_DOMAIN}`);
  console.log(`Asset   : ${ASSET_CODE}`);
  console.log(`Account : ${keypair.publicKey()}\n`);

  // Step 1 — SEP-1
  console.log('[1/5] SEP-1 — Discovering anchor...');
  const info = await sdk.getAnchorInfo(ANCHOR_DOMAIN) as any;
  const webAuthEndpoint  = info.toml?.WEB_AUTH_ENDPOINT ?? '';
  const sep24Endpoint    = info.toml?.TRANSFER_SERVER_SEP0024 ?? '';
  const networkPassphrase = info.toml?.NETWORK_PASSPHRASE ?? 'Test SDF Network ; September 2015';
  console.log(`  Auth endpoint   : ${webAuthEndpoint}`);
  console.log(`  SEP-24 server   : ${sep24Endpoint}`);
  console.log(`  Protocols       : SEP-${Object.entries(info.capabilities).filter(([,v]) => v === true).map(([k]) => k.replace('sep','')).join(', SEP-')}`);

  // Step 2 — Trustline
  console.log('\n[2/5] Trustline — Ensuring trustline exists...');
  await ensureTrustline(keypair, networkPassphrase, ASSET_CODE, ASSET_ISSUER);

  // Step 3 — SEP-10
  console.log('\n[3/5] SEP-10 — Authenticating...');
  const token = await authenticate(webAuthEndpoint, networkPassphrase, keypair);
  console.log(`  JWT obtained    : ${token.slice(0, 40)}...`);
  fs.writeFileSync('.auth-token', token);

  // Step 4 — SEP-24 Deposit
  console.log('\n[4/5] SEP-24 — Initiating deposit...');
  const deposit = await initiateDeposit(sep24Endpoint, token, keypair.publicKey(), ASSET_CODE, ASSET_ISSUER);
  console.log(`  Transaction ID  : ${deposit.id}`);
  console.log(`  Deposit URL     : ${deposit.url}`);
  fs.writeFileSync('.transaction-id', deposit.id);

  console.log('\n>>> Abra a URL acima no navegador e complete o formulário.');
  console.log('>>> Pressione Enter quando estiver pronto...\n');
  await new Promise(resolve => process.stdin.once('data', resolve));

  // Step 5 — Polling
  console.log('[5/5] Polling — Monitoring transaction...');
  const result = await pollTransaction(sep24Endpoint, token, deposit.id);

  console.log('\n╔══════════════════════════════════════════════╗');
  console.log('║   Transaction Complete!                      ║');
  console.log('╚══════════════════════════════════════════════╝');
  console.log(`  Status     : ${result.status}`);
  if (result.amount_in)  console.log(`  Amount In  : ${result.amount_in} ${ASSET_CODE}`);
  if (result.amount_out) console.log(`  Amount Out : ${result.amount_out} ${ASSET_CODE}`);
  if (result.stellar_transaction_id) console.log(`  Stellar TX : ${result.stellar_transaction_id}`);
  console.log('\nDone.');
}

main().catch((err: unknown) => {
  console.error('\nError:', err instanceof Error ? err.message : err);
  process.exit(1);
});