import axios from 'axios';

export interface AnchorConfig {
  webAuthEndpoint: string;
  transferServerSep24: string;
  networkPassphrase: string;
  currencies: Record<string, string>;
}

function extractTomlString(toml: string, key: string): string | undefined {
  const match = new RegExp(String.raw`^${key}\s*=\s*"([^"]*)"`, 'm').exec(toml);
  return match?.[1];
}

export async function discoverAnchor(domain: string): Promise<AnchorConfig> {
  const url = domain.startsWith('http')
    ? `${domain}/.well-known/stellar.toml`
    : `https://${domain}/.well-known/stellar.toml`;

  const { data: toml } = await axios.get<string>(url);

  const webAuthEndpoint = extractTomlString(toml, 'WEB_AUTH_ENDPOINT') ?? '';
  const transferServerSep24 = extractTomlString(toml, 'TRANSFER_SERVER_SEP0024') ?? '';
  const networkPassphrase = extractTomlString(toml, 'NETWORK_PASSPHRASE') ?? 'Test SDF Network ; September 2015';

  console.log('  web_auth_endpoint    :', webAuthEndpoint);
  console.log('  transfer_server_sep24:', transferServerSep24);

  const currencies: Record<string, string> = {};
const currencyRegex = /\[\[CURRENCIES\]\][\s\S]*?code\s*=\s*"([^"]+)"[\s\S]*?issuer\s*=\s*"([^"]+)"/g;
let match;
while ((match = currencyRegex.exec(toml)) !== null) {
  currencies[match[1]] = match[2];
}

return { webAuthEndpoint, transferServerSep24, networkPassphrase, currencies };
}