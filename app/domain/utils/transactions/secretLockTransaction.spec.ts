import fetch from 'node-fetch';
global.fetch = fetch;

import { Address, Crypto, SecretLockTransaction } from 'symbol-sdk';
import { setupBlockChain } from '../setupBlockChain';
import { secretLockTransaction } from './secretLockTransaction';
import { sha3_256 } from 'js-sha3';

describe('secretLockTransaction.spec', () => {
  it('should create symbol secret transaction', async () => {
    const symbolBlockChain = await setupBlockChain('symbol');
    const symbolAddress = Address.createFromRawAddress(
      'TCCICCG6YKZZWAM2XDNXAJM2PNE6MWBU2GDIJ2A',
    );

    const random = Crypto.randomBytes(20);
    const secretHash = sha3_256.create();
    const secret = secretHash.update(random).hex();

    const result = secretLockTransaction(
      symbolBlockChain,
      100,
      secret,
      symbolAddress,
    );
    
    expect(result).toBeInstanceOf(SecretLockTransaction);
  }, 10000); // 10 seconds
});
