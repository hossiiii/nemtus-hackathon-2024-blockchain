import fetch from 'node-fetch';
global.fetch = fetch;

import { Account } from 'symbol-sdk';
import { encryptedAccount } from './encryptedAccount';
import { setupBlockChain } from '../setupBlockChain';

describe('encryptedAccount', () => {
  it('test', async () => {
    const blockChain = await setupBlockChain('momiji');
    const newAccount = Account.generateNewAccount(blockChain.networkType);
    const password = 'testPassword';
    const result = encryptedAccount(blockChain, newAccount, password);
    console.log(result);
  });
});