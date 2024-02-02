import fetch from 'node-fetch';
global.fetch = fetch;

import { fetchAccountMetaData } from './fetchAccountMetaData';
import { Address } from 'symbol-sdk';
import { setupBlockChain } from '../setupBlockChain';
import { symbolAccountMetaDataKey } from '../../../consts/consts';

describe('fetchAccountMetaData', () => {
  it('should return a metadata value', async () => {
    const symbolBlockChain = await setupBlockChain('symbol');
    const symbolAddress = Address.createFromRawAddress(
      'TAOCE6CWZUXHVECOBPDUUGSZF34URRXJMQYHVCQ',
    );
    const result = await fetchAccountMetaData(
      symbolBlockChain,
      symbolAccountMetaDataKey,
      symbolAddress,
    );
    console.log(result);
    expect(result).toContain('ciphertext');
  }, 10000); // 10 seconds
  it('should throw an error if metadataEntry is not found', async () => {
    const symbolBlockChain = await setupBlockChain('symbol');
    const symbolAddress = Address.createFromRawAddress(
      'TAOCE6CWZUXHVECOBPDUUGSZF34URRXJMQYHVCQ',
    );
    const result = await fetchAccountMetaData(
      symbolBlockChain,
      'notFoundKey',
      symbolAddress,
    );
    console.log(result);
    expect(result).toBeNull();
  });
});
