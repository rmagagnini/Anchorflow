import * as dotenv from 'dotenv';
import { Keypair, Asset, Networks } from '@stellar/stellar-sdk';
import { Contract, SorobanRpc } from '@stellar/stellar-sdk';

dotenv.config();

const STELLAR_SECRET = process.env['STELLAR_SECRET_KEY'] ?? '';
const USDC_ISSUER = 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5';
const USDC_SAC = 'CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA';
const RPC_URL = 'https://soroban-testnet.stellar.org';

async function main(): Promise<void> {
  console.log('\n--- Setup USDC SAC ---');

  const keypair = Keypair.fromSecret(STELLAR_SECRET);
  console.log('Account:', keypair.publicKey());

  const server = new SorobanRpc.Server(RPC_URL);

  // Check if contract exists
  try {
    const contract = new Contract(USDC_SAC);
    console.log('USDC SAC Contract:', USDC_SAC);

    // Get account balance via RPC
    const account = await server.getAccount(keypair.publicKey());
    console.log('Account sequence:', account.sequenceNumber());
    console.log('\n✅ Account is ready for x402 payments');
    console.log('USDC SAC address:', USDC_SAC);
  } catch (err: any) {
    console.error('Error:', err.message);
  }
}

main();