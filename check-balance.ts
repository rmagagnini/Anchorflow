import { Horizon } from '@stellar/stellar-sdk';

const server = new Horizon.Server('https://horizon-testnet.stellar.org');

server.loadAccount('GALFWMPBKRATZOOQV5SYJEASCQJIJAE3IXNMCZL7G57SLX72YNKPRG6H').then(account => {
  console.log('Saldos da conta:');
  account.balances.forEach((b: any) => {
    console.log(' -', b.asset_type === 'native' ? 'XLM' : b.asset_code, ':', b.balance);
  });
});