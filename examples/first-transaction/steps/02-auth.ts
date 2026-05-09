import axios from 'axios';
import { Keypair, Transaction, FeeBumpTransaction } from '@stellar/stellar-sdk';

interface ChallengeResponse {
  transaction: string;
  network_passphrase: string;
}

interface TokenResponse {
  token: string;
}

export async function authenticate(
  webAuthEndpoint: string,
  networkPassphrase: string,
  keypair: Keypair,
): Promise<string> {
  console.log(`  Requesting challenge for ${keypair.publicKey()}`);

  const { data: challenge } = await axios.get<ChallengeResponse>(webAuthEndpoint, {
    params: { account: keypair.publicKey() },
  });

  // Resolve the transaction to sign — may be wrapped in a FeeBump envelope
  let txToSign: Transaction;
  try {
    txToSign = new Transaction(challenge.transaction, networkPassphrase);
  } catch {
    const feeBump = new FeeBumpTransaction(challenge.transaction, networkPassphrase);
    txToSign = feeBump.innerTransaction;
  }

  txToSign.sign(keypair);

  const signedXdr = Buffer.from(txToSign.toEnvelope().toXDR()).toString('base64');

  console.log('  Submitting signed challenge');
  const { data } = await axios.post<TokenResponse>(webAuthEndpoint, {
    transaction: signedXdr,
  });

  return data.token;
}
