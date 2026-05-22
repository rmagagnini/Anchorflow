import express from 'express';
import { paymentMiddlewareFromConfig } from '@x402/express';
import { HTTPFacilitatorClient } from '@x402/core/server';
import { ExactStellarScheme } from '@x402/stellar/exact/server';
import * as dotenv from 'dotenv';

dotenv.config();

const PORT = 3001;
const ROUTE_PATH = '/api/data';
const PRICE = '$0.01';
const NETWORK = 'stellar:testnet';
const FACILITATOR_URL = 'https://www.x402.org/facilitator';
const PAY_TO = process.env['STELLAR_PUBLIC_KEY'] ?? 'GALFWMPBKRATZOOQV5SYJEASCQJIJAE3IXNMCZL7G57SLX72YNKPRG6H';

const app = express();

app.get('/', (_req, res) => {
  res.json({ service: 'AnchorFlow x402 Demo Server', route: ROUTE_PATH, price: PRICE, network: NETWORK, payTo: PAY_TO });
});

app.use(
  paymentMiddlewareFromConfig(
    {
      [`GET ${ROUTE_PATH}`]: {
        accepts: { scheme: 'exact', price: PRICE, network: NETWORK, payTo: PAY_TO },
      },
    },
    new HTTPFacilitatorClient({ url: FACILITATOR_URL }),
    [{ network: NETWORK, server: new ExactStellarScheme() }],
  ),
);

app.get(ROUTE_PATH, (_req, res) => {
  res.json({
    message: 'Pagamento recebido!',
    data: { timestamp: new Date().toISOString(), content: 'Conteudo exclusivo AnchorFlow x402', network: NETWORK },
  });
});

app.listen(PORT, () => {
  console.log('\n╔══════════════════════════════════════════════╗');
  console.log('║   AnchorFlow SDK — x402 Server               ║');
  console.log('╚══════════════════════════════════════════════╝');
  console.log(`\n  Servidor : http://localhost:${PORT}`);
  console.log(`  Rota paga: http://localhost:${PORT}${ROUTE_PATH}`);
  console.log(`  Preco    : ${PRICE} USDC`);
  console.log(`  Pay to   : ${PAY_TO}`);
  console.log(`  Network  : ${NETWORK}\n`);
});