import { discoverAnchor } from './examples/first-transaction/steps/01-discover';

discoverAnchor('testanchor.stellar.org').then(config => {
  console.log('currencies:', JSON.stringify(config.currencies, null, 2));
});