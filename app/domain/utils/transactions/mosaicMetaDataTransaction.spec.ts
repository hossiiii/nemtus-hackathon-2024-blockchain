import fetch from 'node-fetch';
global.fetch = fetch;

import { Address, MosaicId, MosaicMetadataTransaction } from 'symbol-sdk';
import { setupBlockChain } from '../setupBlockChain';
import { mosaicMetaDataTransaction } from './mosaicMetaDataTransaction';

describe('mosaicMetaDataTransaction.spec', () => {
  it('should create momiji mosaic metadata transaction', async () => {
    const momijiBlockChain = await setupBlockChain('momiji');
    const momijiAddress = Address.createFromRawAddress(
      'TCCICCG6YKZZWAM2XDNXAJM2PNE6MWBU2GDIJ2A',
    );

    const result = await mosaicMetaDataTransaction(
      momijiBlockChain,
      'test',
      'test',
      new MosaicId("6C00E8BB527946B9"),
      momijiAddress,
    );
    
    expect(result).toBeInstanceOf(MosaicMetadataTransaction);
  }, 10000); // 10 seconds
});
