import fetch from 'node-fetch';
global.fetch = fetch;

import { Address, MosaicDefinitionTransaction } from 'symbol-sdk';
import { setupBlockChain } from '../setupBlockChain';
import { mosaicDefinitionTransaction } from './mosaicDefinitionTransaction';

describe('mosaicDefinitionTransaction.spec', () => {
  it('should create momiji mosaic definition transaction', async () => {
    const momijiBlockChain = await setupBlockChain('momiji');
    const momijiAddress = Address.createFromRawAddress(
      'TCCICCG6YKZZWAM2XDNXAJM2PNE6MWBU2GDIJ2A',
    );

    const result = mosaicDefinitionTransaction(
      momijiBlockChain,
      momijiAddress,
    );
    
    expect(result).toBeInstanceOf(MosaicDefinitionTransaction);
  }, 10000); // 10 seconds
});
