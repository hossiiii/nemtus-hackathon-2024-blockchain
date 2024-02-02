import fetch from 'node-fetch';
global.fetch = fetch;

import { Account } from 'symbol-sdk';
import { encryptedAccount } from './encryptedAccount';
import { setupBlockChain } from '../setupBlockChain';

describe('encryptedAccount', () => {
  it('test', async () => {
    const momijiBlockChain = await setupBlockChain('momiji');
    const momijiNewAccount = Account.generateNewAccount(momijiBlockChain.networkType);
    const password = 'testPassword';
    const result = encryptedAccount(momijiBlockChain, momijiNewAccount, password);
    console.log(result);
    expect(result).toContain('ciphertext');
  }, 10000); // 10 seconds
});
