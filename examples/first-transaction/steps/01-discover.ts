import axios from 'axios';

export interface AnchorConfig {
  webAuthEndpoint: string;
  transferServerSep24: string;
  networkPassphrase: string;
  currencies: Record<string, string>; // assetCode → issuer
}

function extractTomlString(toml: string, key: string): string | undefined {
  const match = new RegExp(`^${key}\\s*=\\s*"([^"]*)"`, 'm').exec(toml);
  return match?.[1];
}

function extractCurrencies(toml: string): Record<string, string> {
  const currencies: Record<string, string> = {};
  for (const section of toml.split('[[CURRENCIES]]').slice(1)) {
    const codeMatch = /^\s*code\s*=\s*"([^"]*)"/m.exec(section);
    const issuerMatch = /^\s*issuer\s*=\s*"([^"]*)"/m.exec(section);
    if (codeMatch && issuerMatch) {
      currencies[codeMatch[1]] = issuerMatch[1];
    }
  }
  return currencies;
}

export async function discoverAnchor(anchorDomain: string): Promise<AnchorConfig> {
  const url = `${anchorDomain}/.well-known/stellar.toml`;
  console.log(`  Fetching ${url}`);

  const { data: toml } = await axios.get<string>(url, { responseType: 'text' });

  const webAuthEndpoint = extractTomlString(toml, 'WEB_AUTH_ENDPOINT');
  const transferServerSep24 = extractTomlString(toml, 'TRANSFER_SERVER_SEP0024');
  const networkPassphrase = extractTomlString(toml, 'NETWORK_PASSPHRASE');

  if (!webAuthEndpoint) throw new Error('WEB_AUTH_ENDPOINT not found in stellar.toml');
  if (!transferServerSep24) throw new Error('TRANSFER_SERVER_SEP0024 not found in stellar.toml');
  if (!networkPassphrase) throw new Error('NETWORK_PASSPHRASE not found in stellar.toml');

  return { webAuthEndpoint, transferServerSep24, networkPassphrase, currencies: extractCurrencies(toml) };
}
