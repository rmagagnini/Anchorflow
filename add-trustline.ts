import { Horizon, Keypair, Asset, TransactionBuilder, Operation, Networks } from '@stellar/stellar-sdk';
import * as dotenv from 'dotenv';
dotenv.config();

const secret = process.env.STELLAR_SECRET_KEY ?? '';
const keypair = Keypair.fromSecret(secret);
const server = new Horizon.Server('https://horizon-testnet.stellar.org');

async function addTrustline() {
  const account = await server.loadAccount(keypair.publicKey());
  const asset = new Asset('SRT', 'GCDNJUBQSX7AJWLJACMJ7I4BC3Z47BQUTMHEICZLE6MU4KQBRYG5JY6B');
  
  const tx = new TransactionBuilder(account, {
    fee: '100',
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(Operation.changeTrust({ asset }))
    .setTimeout(30)
    .build();

  tx.sign(keypair);
  const result = await server.submitTransaction(tx);
  console.log('Trustline SRT criada! Hash:', result.hash);
}

addTrustline().catch(e => console.error('Erro:', e.message));