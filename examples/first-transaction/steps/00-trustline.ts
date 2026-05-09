import { Asset, Horizon, Keypair, Operation, TransactionBuilder } from '@stellar/stellar-sdk';

const HORIZON_URL = 'https://horizon-testnet.stellar.org';

export async function ensureTrustline(
  keypair: Keypair,
  networkPassphrase: string,
  assetCode: string,
  assetIssuer: string,
): Promise<void> {
  const server = new Horizon.Server(HORIZON_URL);
  const account = await server.loadAccount(keypair.publicKey());

  const hasTrustline = account.balances.some(
    b => 'asset_code' in b && b.asset_code === assetCode && b.asset_issuer === assetIssuer,
  );

  if (hasTrustline) {
    console.log(`  Trustline for ${assetCode} already exists.`);
    return;
  }

  const tx = new TransactionBuilder(account, { fee: '100', networkPassphrase })
    .addOperation(Operation.changeTrust({ asset: new Asset(assetCode, assetIssuer) }))
    .setTimeout(30)
    .build();

  tx.sign(keypair);

  try {
    await server.submitTransaction(tx);
    console.log(`  Trustline for ${assetCode} created.`);
  } catch (err) {
    const e = err as { response?: { data?: unknown } };
    throw new Error(`Trustline failed: ${JSON.stringify(e.response?.data ?? err)}`);
  }
}
