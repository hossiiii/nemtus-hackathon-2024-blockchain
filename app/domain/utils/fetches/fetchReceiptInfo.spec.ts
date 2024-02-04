import fetch from 'node-fetch';
global.fetch = fetch;

import { Address } from 'symbol-sdk';
import { setupBlockChain } from '../setupBlockChain';
import { fetchReceiptInfo } from './fetchReceiptInfo';

describe('fetchReceiptInfo', () => {
  it('should return an receiptInfo object', async () => {
    const symbolBlockChain = await setupBlockChain('symbol');
    const symbolAddress = Address.createFromRawAddress(
      'TAOCE6CWZUXHVECOBPDUUGSZF34URRXJMQYHVCQ',
    );
    const height = 1173023;
    const result = await fetchReceiptInfo(symbolBlockChain, symbolAddress, height);
    console.log(result);
    expect(result).toBeInstanceOf(Array);
  }, 10000); // 10 seconds
});
