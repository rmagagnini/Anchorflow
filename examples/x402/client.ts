import * as dotenv from 'dotenv';
import { Keypair } from '@stellar/stellar-sdk';
import { wrapFetchWithPayment, x402Client } from '@x402/fetch';
import { createEd25519Signer, ExactStellarScheme } from '@x402/stellar';

dotenv.config();

const SERVER_URL = 'http://localhost:3001';
const ROUTE_PATH = '/api/data';
const STELLAR_SECRET = process.env['STELLAR_SECRET_KEY'] ?? '';

async function main(): Promise<void> {
  console.log('\n╔══════════════════════════════════════════════╗');
  console.log('║   AnchorFlow SDK — x402 Client               ║');
  console.log('╚══════════════════════════════════════════════╝\n');

  const keypair = Keypair.fromSecret(STELLAR_SECRET);
  console.log(`  Account : ${keypair.publicKey()}`);
  console.log(`  Target  : ${SERVER_URL}${ROUTE_PATH}\n`);

  console.log('  Fazendo requisição ao endpoint protegido...\n');

  try {
    const signer = createEd25519Signer(keypair.secret(), 'stellar:testnet');

    const stellarScheme = new (require('@x402/stellar/exact/client').ExactStellarScheme)({
      signer,
    });

    const client = x402Client.fromConfig({
      schemes: [
        {
          network: 'stellar:testnet',
          client: stellarScheme,
        },
      ],
    });

    const fetchWithPayment = wrapFetchWithPayment(globalThis.fetch, client);
    const response = await fetchWithPayment(`${SERVER_URL}${ROUTE_PATH}`);
    const data = await response.json();

    console.log('\n  ✅ Pagamento x402 efetuado com sucesso!');
    console.log('\n  Dados recebidos:');
    console.log(JSON.stringify(data, null, 2));

  } catch (err: any) {
    console.error('\n  ❌ Erro:', err.message);
    console.error('  Stack:', err.stack?.split('\n').slice(0, 5).join('\n'));
  }

  console.log('\nDone.');
}

main().catch((err: unknown) => {
  console.error('\nError:', err instanceof Error ? err.message : err);
  process.exit(1);
});