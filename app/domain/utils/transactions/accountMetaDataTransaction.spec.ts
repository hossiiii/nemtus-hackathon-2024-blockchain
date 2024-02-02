import fetch from 'node-fetch';
global.fetch = fetch;

import { AccountMetadataTransaction, Address } from 'symbol-sdk';
import { setupBlockChain } from '../setupBlockChain';
import { accountMetaDataTransaction } from './accountMetaDataTransaction';
import { symbolAccountMetaDataKey } from '../../../consts/consts';

describe('accountMetaDataTransaction.spec', () => {
  it('should create symbol account metadata transaction', async () => {
    const symbolBlockChain = await setupBlockChain('symbol');
    const symbolAddress = Address.createFromRawAddress(
      'TCCICCG6YKZZWAM2XDNXAJM2PNE6MWBU2GDIJ2A',
    );

    const result = await accountMetaDataTransaction(
      symbolBlockChain,
      symbolAccountMetaDataKey,
      'test',
      symbolAddress,
    );
    
    expect(result).toBeInstanceOf(AccountMetadataTransaction);
  }, 10000); // 10 seconds
});
