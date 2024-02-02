import fetch from 'node-fetch';
global.fetch = fetch;

import { Address, TransferTransaction } from 'symbol-sdk';
import { setupBlockChain } from '../setupBlockChain';
import { transferTransactionWithMessage } from './transferTransactionWithMessage';

describe('transferTransactionWithMessage.spec', () => {
  it('should create symbol transfer transaction', async () => {
    const symbolBlockChain = await setupBlockChain('symbol');
    const symbolAddress = Address.createFromRawAddress(
      'TCCICCG6YKZZWAM2XDNXAJM2PNE6MWBU2GDIJ2A',
    );

    const message = "hello";

    const result = transferTransactionWithMessage(
      symbolBlockChain,
      message,
      symbolAddress,
    );
    
    expect(result).toBeInstanceOf(TransferTransaction);
  }, 10000); // 10 seconds
});
