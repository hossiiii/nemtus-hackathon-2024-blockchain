import fetch from 'node-fetch';
global.fetch = fetch;

import { MosaicId, MosaicSupplyChangeTransaction } from 'symbol-sdk';
import { setupBlockChain } from '../setupBlockChain';
import { mosaicSupplyChangeTransaction } from './mosaicSupplyChangeTransaction';

describe('mosaicSupplyChangeTransaction.spec', () => {
  it('should create momiji mosaic suppy change transaction', async () => {
    const momijiBlockChain = await setupBlockChain('momiji');

    const result = mosaicSupplyChangeTransaction(
      momijiBlockChain,
      100,
      new MosaicId("6C00E8BB527946B9"),      
    );
    
    expect(result).toBeInstanceOf(MosaicSupplyChangeTransaction);
  }, 10000); // 10 seconds
});
