import fetch from 'node-fetch';
global.fetch = fetch;

import { Address, MosaicId, TransferTransaction } from 'symbol-sdk';
import { setupBlockChain } from '../setupBlockChain';
import { transferTransactionWithMosaic } from './transferTransactionWithMosaic';

describe('transferTransactionWithMosaic.spec', () => {
  it('should create symbol transfer transaction', async () => {
    const symbolBlockChain = await setupBlockChain('symbol');
    const symbolAddress = Address.createFromRawAddress(
      'TCCICCG6YKZZWAM2XDNXAJM2PNE6MWBU2GDIJ2A',
    );

    const result = transferTransactionWithMosaic(
      symbolBlockChain,
      100*1000000,
      new MosaicId(symbolBlockChain.currencyMosaicId) ,
      symbolAddress,
    );
    
    expect(result).toBeInstanceOf(TransferTransaction);
  }, 10000); // 10 seconds
});
