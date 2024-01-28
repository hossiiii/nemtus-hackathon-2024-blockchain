import fetch from 'node-fetch';
global.fetch = fetch;

import { decryptedAccount } from './decryptedAccount';
import { Account } from 'symbol-sdk';
import { setupBlockChain } from '../setupBlockChain';
import { encryptedAccount } from './encryptedAccount';

describe('decryptedAccount', () => {    
  it('should return an Account object', async () => {
    const blockChain = await setupBlockChain('momiji');
    const newAccount = Account.generateNewAccount(blockChain.networkType);
    const password = 'testPassword';
    const strSignerQR = encryptedAccount(blockChain, newAccount, password);
    const result = decryptedAccount(blockChain, strSignerQR, password);
    expect(result).toBeInstanceOf(Account);
    });
});