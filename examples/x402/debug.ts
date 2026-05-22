import * as dotenv from 'dotenv';
import { Keypair } from '@stellar/stellar-sdk';
import { createEd25519Signer } from '@x402/stellar';
import { ExactStellarScheme } from '@x402/stellar/exact/client';

dotenv.config();

const STELLAR_SECRET = process.env['STELLAR_SECRET_KEY'] ?? '';

async function main(): Promise<void> {
  console.log('\n--- x402 Soroban Debug ---');

  const keypair = Keypair.fromSecret(STELLAR_SECRET);
  console.log('Account:', keypair.publicKey());

  const signer = createEd25519Signer(keypair.secret(), 'stellar:testnet');
  const scheme = new ExactStellarScheme({ signer });

  const x402Version = 2;
  const paymentRequirements = {
    scheme: 'exact' as const,
    network: 'stellar:testnet',
    amount: '100000',
    asset: 'CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA',
    payTo: keypair.publicKey(),
    maxTimeoutSeconds: 300,
    extra: { areFeesSponsored: true },
    resource: 'http://localhost:3001/api/data',
  };

  console.log('\nTentando criar payment payload...');

  try {
    const result = await (scheme as any).createPaymentPayload(x402Version, paymentRequirements);
    console.log('\n✅ Payment payload criado com sucesso!');
    console.log('Result:', JSON.stringify(result, null, 2));
  } catch (err: any) {
    console.error('\n❌ Erro:', err.message);
    console.error('Stack:', err.stack?.split('\n').slice(0, 8).join('\n'));
  }
}

main().catch(console.error);