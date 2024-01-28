import fetch from 'node-fetch';
global.fetch = fetch;

import { fetchAccountMetaData } from './fetchAccountMetaData';
import { Address } from 'symbol-sdk';
import { setupBlockChain } from '../setupBlockChain';
import { accountMetaDataKey } from '../../../consts/consts';

describe('fetchAccountMetaData', () => {
  it('should return a metadata value', async () => {
    const blockChain = await setupBlockChain('symbol');
    const targetAddress = Address.createFromRawAddress('TAOCE6CWZUXHVECOBPDUUGSZF34URRXJMQYHVCQ');
    const result = await fetchAccountMetaData(blockChain, accountMetaDataKey, targetAddress);
    console.log(result);
    expect(result).toContain('ciphertext');
  });
});