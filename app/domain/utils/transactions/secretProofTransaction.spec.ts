import fetch from 'node-fetch';
global.fetch = fetch;

import { Address, SecretProofTransaction } from 'symbol-sdk';
import { setupBlockChain } from '../setupBlockChain';
import { secretProofTransaction } from './secretProofTransaction';

describe('secretProofTransaction.spec', () => {
  it('should create symbol seclet transaction', async () => {
    const symbolBlockChain = await setupBlockChain('symbol');
    const symbolAddress = Address.createFromRawAddress(
      'TB22KPDYEOWXK2BSSEC7MATPBPVX4SLDR5SMMDY',
    );

    const secret = '552c7746241aa7c3ea93f4162e930d41192ad547177b550fc8a5a431a1a25c6f';
    const proof = '63261be68ff2625b963c3c6116671738fb8e8074';
    
    const result = secretProofTransaction(
      symbolBlockChain,
      secret,
      proof,
      symbolAddress,
    );
    
    expect(result).toBeInstanceOf(SecretProofTransaction);
  }, 10000); // 10 seconds
});
