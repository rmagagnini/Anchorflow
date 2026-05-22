import * as dotenv from 'dotenv';
import { AnchorFlow } from 'anchorflow-sdk';

dotenv.config();

const ANCHORS = [
  { name: 'SDF Testnet',      domain: 'testanchor.stellar.org' },
  { name: 'CLPX (Chile)',     domain: 'clpx.finance' },
  { name: 'Stellarport',      domain: 'stellarport.io' },
  { name: 'Anclap (Brasil)',  domain: 'anclap.com' },
  { name: 'MoneyGram',        domain: 'stellar.moneygram.com' },
  { name: 'Cowrie (Nigéria)', domain: 'cowrie.exchange' },
];

async function discoverAnchor(sdk: AnchorFlow, name: string, domain: string): Promise<void> {
  console.log(`\n${'─'.repeat(50)}`);
  console.log(`Anchor : ${name}`);
  console.log(`Domain : ${domain}`);

  try {
    const info = await sdk.getAnchorInfo(domain) as any;
    const caps = info.capabilities;
    const toml = info.toml;

    console.log(`Status : ✅ Online`);
    console.log(`SEPs   : ${[
      caps.sep6  && 'SEP-6',
      caps.sep10 && 'SEP-10',
      caps.sep12 && 'SEP-12',
      caps.sep24 && 'SEP-24',
      caps.sep31 && 'SEP-31',
    ].filter(Boolean).join(', ')}`);

    if (toml?.CURRENCIES?.length) {
      console.log(`Assets : ${toml.CURRENCIES.map((c: any) => c.code).join(', ')}`);
    }

    if (toml?.WEB_AUTH_ENDPOINT)       console.log(`Auth   : ${toml.WEB_AUTH_ENDPOINT}`);
    if (toml?.TRANSFER_SERVER_SEP0024) console.log(`SEP-24 : ${toml.TRANSFER_SERVER_SEP0024}`);
    if (toml?.TRANSFER_SERVER)         console.log(`SEP-6  : ${toml.TRANSFER_SERVER}`);
    if (toml?.DIRECT_PAYMENT_SERVER)   console.log(`SEP-31 : ${toml.DIRECT_PAYMENT_SERVER}`);

  } catch (err: any) {
    console.log(`Status : ❌ Error — ${err.message}`);
  }
}

async function main(): Promise<void> {
  console.log('\n╔══════════════════════════════════════════════╗');
  console.log('║   AnchorFlow SDK — Multi-Anchor Discovery    ║');
  console.log('╚══════════════════════════════════════════════╝');

  const sdk = new AnchorFlow({ network: 'testnet' });

  for (const anchor of ANCHORS) {
    await discoverAnchor(sdk, anchor.name, anchor.domain);
  }

  console.log(`\n${'─'.repeat(50)}`);
  console.log('\nDone.');
}

main().catch((err: unknown) => {
  console.error('\nError:', err instanceof Error ? err.message : err);
  process.exit(1);
});