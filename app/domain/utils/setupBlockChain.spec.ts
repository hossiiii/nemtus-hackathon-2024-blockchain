import fetch from 'node-fetch';
global.fetch = fetch;

import { setupBlockChain } from './setupBlockChain';

describe('setupBlockChain', () => {
  it('should return an object with expected properties', async () => {
    const result = await setupBlockChain('symbol');
    expect(result).toHaveProperty('txRepo');
    expect(result).toHaveProperty('tsRepo');
    expect(result).toHaveProperty('accountRepo');
    expect(result).toHaveProperty('metaRepo');
    expect(result).toHaveProperty('metaService');
    expect(result).toHaveProperty('listener');
    expect(result).toHaveProperty('networkType');
    expect(result).toHaveProperty('epochAdjustment');
    expect(result).toHaveProperty('generationHash');
    expect(result).toHaveProperty('currencyMosaicId');
    expect(result).toHaveProperty('explorerUrl');
  });
});
