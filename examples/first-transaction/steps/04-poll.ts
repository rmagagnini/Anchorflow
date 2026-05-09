import axios from 'axios';

const TERMINAL_STATUSES = new Set(['completed', 'error', 'refunded', 'expired']);
const POLL_INTERVAL_MS = 5_000;

interface SepTransaction {
  id: string;
  status: string;
  status_eta?: number;
  message?: string;
  stellar_transaction_id?: string;
  amount_in?: string;
  amount_out?: string;
  amount_fee?: string;
}

interface TransactionResponse {
  transaction: SepTransaction;
}

export async function pollTransaction(
  transferServer: string,
  token: string,
  transactionId: string,
): Promise<SepTransaction> {
  let lastStatus = '';

  for (;;) {
    const { data } = await axios.get<TransactionResponse>(`${transferServer}/transaction`, {
      params: { id: transactionId },
      headers: { Authorization: `Bearer ${token}` },
    });

    const tx = data.transaction;

    if (tx.status !== lastStatus) {
      lastStatus = tx.status;
      const eta = tx.status_eta != null ? ` (ETA: ${tx.status_eta}s)` : '';
      const msg = tx.message ? ` — ${tx.message}` : '';
      console.log(`  Status: ${tx.status}${eta}${msg}`);
    }

    if (TERMINAL_STATUSES.has(tx.status)) {
      if (tx.status === 'completed') {
        console.log(`\n  Amount in:  ${tx.amount_in ?? 'N/A'}`);
        console.log(`  Amount out: ${tx.amount_out ?? 'N/A'}`);
        console.log(`  Fee:        ${tx.amount_fee ?? 'N/A'}`);
        if (tx.stellar_transaction_id) {
          console.log(`  Stellar TX: ${tx.stellar_transaction_id}`);
        }
      }
      return tx;
    }

    await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL_MS));
  }
}
