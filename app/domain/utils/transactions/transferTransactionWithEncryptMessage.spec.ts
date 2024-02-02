import fetch from 'node-fetch';
global.fetch = fetch;

import { Account, PublicAccount, TransferTransaction } from 'symbol-sdk';
import { setupBlockChain } from '../setupBlockChain';
import { transferTransactionWithEncryptMessage } from './transferTransactionWithEncryptMessage';

describe('transferTransactionWithEncryptMessage.spec', () => {
  it('should create momiji transfer transaction', async () => {
    const momijiBlockChain = await setupBlockChain('momiji');
    const momijiTargetPublicAccount = PublicAccount.createFromPublicKey(
      '6CA56D1A4E909C7AE67FE56D4E1F94F8010891497DBB75031AC2991D5385E84C',momijiBlockChain.networkType
    );
    const momijiSrcAccount = Account.generateNewAccount(momijiBlockChain.networkType);

    const result = transferTransactionWithEncryptMessage(
      momijiBlockChain,
      "hello",
      momijiSrcAccount,
      momijiTargetPublicAccount,
    );
    
    expect(result).toBeInstanceOf(TransferTransaction);
  }, 10000); // 10 seconds
});
