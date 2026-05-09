import axios, { AxiosError } from 'axios';

export interface DepositResult {
  id: string;
  url: string;
}

interface DepositResponse {
  id: string;
  url: string;
  type: string;
}

export async function initiateDeposit(
  transferServer: string,
  token: string,
  account: string,
  assetCode: string,
  assetIssuer?: string,
): Promise<DepositResult> {
  const form = new FormData();
  form.append('asset_code', assetCode);
  form.append('account', account);
  if (assetIssuer) form.append('asset_issuer', assetIssuer);

  try {
    const { data } = await axios.post<DepositResponse>(
      `${transferServer}/transactions/deposit/interactive`,
      form,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    if (data.type !== 'interactive_customer_info_needed') {
      throw new Error(`Unexpected response type: ${data.type}`);
    }

    return { id: data.id, url: data.url };
  } catch (err) {
    const axiosErr = err as AxiosError;
    if (axiosErr.response) {
      throw new Error(
        `Deposit failed (${axiosErr.response.status}): ${JSON.stringify(axiosErr.response.data)}`,
      );
    }
    throw err;
  }
}
