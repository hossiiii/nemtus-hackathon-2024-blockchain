import fetch from 'node-fetch';
global.fetch = fetch;

import { decryptedAccount } from './decryptedAccount';
import { Account, PublicAccount } from 'symbol-sdk';
import { setupBlockChain } from '../setupBlockChain';
import { encryptedAccount } from './encryptedAccount';
import { fetchAccountMetaData } from '../fetches/fetchAccountMetaData';
import { symbolAccountMetaDataKey } from '../../../consts/consts';

describe('decryptedAccount', () => {
  it('should return an Account object', async () => {
    const momijiBlockChain = await setupBlockChain('momiji');
    const momijiNewAccount = Account.generateNewAccount(momijiBlockChain.networkType);
    const password = 'pass';
    const strSignerQR = encryptedAccount(momijiBlockChain, momijiNewAccount, password);
    console.log(strSignerQR);
    const result = decryptedAccount(momijiBlockChain, strSignerQR, password);
    expect(result).toBeInstanceOf(Account);
  }, 10000); // 10 seconds

  test.skip('should return an specific account object', async () => {
    const symbolBlockChain = await setupBlockChain('symbol');
    const symbolTargetPublicAccount = PublicAccount.createFromPublicKey(
      '2CADE9448E21329DEB84D1A3D61DCAC0A061E27054007F52F8CEEEDA0044817D',
      symbolBlockChain.networkType,
    );
    const strSignerQR = await fetchAccountMetaData(
      symbolBlockChain,
      symbolAccountMetaDataKey,
      symbolTargetPublicAccount.address,
    );
    console.log(strSignerQR);
    const momijiBlockChain = await setupBlockChain('momiji');
    const password = 'pass';
    const result = decryptedAccount(momijiBlockChain, strSignerQR, password);
    console.log(result.address.plain());
    console.log(result.privateKey)
    expect(result).toBeInstanceOf(Account);
  }, 10000); // 10 seconds
});
