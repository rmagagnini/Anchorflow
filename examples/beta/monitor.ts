import * as dotenv from 'dotenv';
import { AnchorFlow } from 'anchorflow-sdk';
import * as fs from 'fs';

dotenv.config();

const ANCHORS = [
  { name: 'SDF Testnet',     domain: 'testanchor.stellar.org' },
  { name: 'CLPX (Chile)',    domain: 'clpx.finance' },
  { name: 'Anclap (Brasil)', domain: 'anclap.com' },
  { name: 'MoneyGram',       domain: 'stellar.moneygram.com' },
  { name: 'Cowrie (NG)',     domain: 'cowrie.exchange' },
  { name: 'Stellarport',     domain: 'stellarport.io' },
];

interface MonitorResult {
  anchor: string;
  domain: string;
  status: 'ok' | 'error';
  sep1: boolean;
  sep6: boolean;
  sep10: boolean;
  sep12: boolean;
  sep24: boolean;
  sep31: boolean;
  error?: string;
  timestamp: string;
}

async function checkAnchor(sdk: AnchorFlow, name: string, domain: string): Promise<MonitorResult> {
  const timestamp = new Date().toISOString();

  try {
    const info = await sdk.getAnchorInfo(domain) as any;
    const caps = info.capabilities ?? {};

    const result: MonitorResult = {
      anchor: name,
      domain,
      status: 'ok',
      sep1: true,
      sep6:  caps.sep6  ?? false,
      sep10: caps.sep10 ?? false,
      sep12: caps.sep12 ?? false,
      sep24: caps.sep24 ?? false,
      sep31: caps.sep31 ?? false,
      timestamp,
    };

    const seps = [
      result.sep6  && 'SEP-6',
      result.sep10 && 'SEP-10',
      result.sep12 && 'SEP-12',
      result.sep24 && 'SEP-24',
      result.sep31 && 'SEP-31',
    ].filter(Boolean).join(', ');

    console.log(`  ✅ ${name.padEnd(20)} ${seps}`);
    return result;

  } catch (err: any) {
    console.log(`  ❌ ${name.padEnd(20)} Error: ${err.message}`);
    return {
      anchor: name,
      domain,
      status: 'error',
      sep1: false,
      sep6: false,
      sep10: false,
      sep12: false,
      sep24: false,
      sep31: false,
      error: err.message,
      timestamp,
    };
  }
}

async function main(): Promise<void> {
  console.log('\n╔══════════════════════════════════════════════╗');
  console.log('║   AnchorFlow SDK — Beta Monitor              ║');
  console.log('╚══════════════════════════════════════════════╝');
  console.log(`\nTimestamp: ${new Date().toISOString()}\n`);

  const sdk = new AnchorFlow({ network: 'testnet' });
  const results: MonitorResult[] = [];

  for (const anchor of ANCHORS) {
    const result = await checkAnchor(sdk, anchor.name, anchor.domain);
    results.push(result);
  }

  const total   = results.length;
  const ok      = results.filter(r => r.status === 'ok').length;
  const errors  = results.filter(r => r.status === 'error').length;
  const errorRate = ((errors / total) * 100).toFixed(1);

  console.log('\n─────────────────────────────────────────────────');
  console.log(`Total    : ${total} anchors`);
  console.log(`Online   : ${ok} ✅`);
  console.log(`Offline  : ${errors} ❌`);
  console.log(`Error rate: ${errorRate}% ${parseFloat(errorRate) < 5 ? '✅ abaixo da meta (< 5%)' : '❌ acima da meta'}`);

  // Save report
  const report = {
    timestamp: new Date().toISOString(),
    summary: { total, ok, errors, errorRate: `${errorRate}%` },
    results,
  };

  fs.writeFileSync('examples/beta/report.json', JSON.stringify(report, null, 2));
  console.log('\n📄 Relatório salvo em examples/beta/report.json');
  console.log('\nDone.');
}

main().catch((err: unknown) => {
  console.error('\nError:', err instanceof Error ? err.message : err);
  process.exit(1);
});