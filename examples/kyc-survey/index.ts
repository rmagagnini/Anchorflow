import * as dotenv from 'dotenv';
import { AnchorFlow } from 'anchorflow-sdk';
import axios from 'axios';

dotenv.config();

const ANCHORS = [
  { name: 'SDF Testnet',     domain: 'testanchor.stellar.org' },
  { name: 'CLPX (Chile)',    domain: 'clpx.finance' },
  { name: 'Anclap (Brasil)', domain: 'anclap.com' },
  { name: 'MoneyGram',       domain: 'stellar.moneygram.com' },
  { name: 'Cowrie (NG)',     domain: 'cowrie.exchange' },
];

// SEP-12 standard fields defined in SEP-9
const SEP9_STANDARD_FIELDS = new Set([
  'account_number', 'bank_account_number', 'bank_account_type',
  'bank_number', 'bank_branch_number', 'bank_phone_number',
  'clabe_number', 'cbu_number', 'cbu_alias',
  'crypto_address', 'crypto_memo',
  'first_name', 'last_name', 'additional_name',
  'address_country_code', 'state_or_province', 'city',
  'postal_code', 'address', 'mobile_number',
  'email_address', 'birth_date', 'birth_place',
  'birth_country_code', 'bank_account_number_2',
  'tax_id', 'tax_id_name', 'occupation',
  'employer_name', 'employer_address',
  'language_code', 'id_type', 'id_country_code',
  'id_issue_date', 'id_expiration_date', 'id_number',
  'photo_id_front', 'photo_id_back', 'notary_approval_of_photo_id',
  'ip_address', 'photo_proof_residence',
  'sex', 'proof_of_income', 'proof_of_liveness',
  'referral_id',
]);

interface KycField {
  optional?: boolean;
  description?: string;
}

async function surveyAnchorKyc(sdk: AnchorFlow, name: string, domain: string): Promise<void> {
  console.log(`\n${'─'.repeat(50)}`);
  console.log(`Anchor : ${name} (${domain})`);

  try {
    const info = await sdk.getAnchorInfo(domain) as any;

    if (!info.capabilities?.sep12) {
      console.log(`KYC    : ❌ SEP-12 not supported`);
      return;
    }

    const kycServer = info.toml?.KYC_SERVER;
    if (!kycServer) {
      console.log(`KYC    : ❌ KYC_SERVER not found in stellar.toml`);
      return;
    }

    console.log(`KYC    : ✅ ${kycServer}`);

    // Try to fetch KYC fields without auth (some anchors return field list publicly)
    try {
      const { data } = await axios.get(`${kycServer}/customer`, { timeout: 5000 });
      const fields = data?.fields ?? {};
      const fieldNames = Object.keys(fields);

      const standard: string[] = [];
      const custom: string[] = [];

      fieldNames.forEach((f: string) => {
        if (SEP9_STANDARD_FIELDS.has(f)) {
          standard.push(f);
        } else {
          custom.push(f);
        }
      });

      console.log(`Fields : ${fieldNames.length} total`);
      console.log(`  ✅ Standard SEP-9 : ${standard.length > 0 ? standard.join(', ') : 'none'}`);
      console.log(`  ⚠️  Custom fields  : ${custom.length > 0 ? custom.join(', ') : 'none'}`);

    } catch {
      console.log(`Fields : ⚠️  Requires authentication to list fields (expected)`);
    }

  } catch (err: any) {
    console.log(`Status : ❌ Error — ${err.message}`);
  }
}

async function main(): Promise<void> {
  console.log('\n╔══════════════════════════════════════════════╗');
  console.log('║   AnchorFlow SDK — KYC Schema Survey         ║');
  console.log('╚══════════════════════════════════════════════╝');

  const sdk = new AnchorFlow({ network: 'testnet' });

  for (const anchor of ANCHORS) {
    await surveyAnchorKyc(sdk, anchor.name, anchor.domain);
  }

  console.log(`\n${'─'.repeat(50)}`);
  console.log('\nDone.');
}

main().catch((err: unknown) => {
  console.error('\nError:', err instanceof Error ? err.message : err);
  process.exit(1);
});