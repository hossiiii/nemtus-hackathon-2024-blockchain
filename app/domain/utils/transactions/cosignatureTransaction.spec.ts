import fetch from 'node-fetch';
global.fetch = fetch;

import { Address, CosignatureTransaction, PublicAccount, TransactionStatus } from 'symbol-sdk';
import { setupBlockChain } from '../setupBlockChain';
import { cosignatureTransaction } from './cosignatureTransaction';
import { fetchAccountMetaData } from '../fetches/fetchAccountMetaData';
import { symbolAccountMetaDataKey } from '../../../consts/consts';
import { decryptedAccount } from '../accounts/decryptedAccount';
import { firstValueFrom } from 'rxjs';
import { fetchTransactionStatus } from '../fetches/fetchTransactionStatus';

describe('cosignatureTransaction.spec', () => {
  test.skip('should create momiji cosignatureTransaction', async () => {
    const momijiBlockChain = await setupBlockChain('momiji');
    const result = await cosignatureTransaction(
      momijiBlockChain,
      'F73D2C5D968B52F125CB9C4AC176F0B0C999AFF0CA035DBE97776CA544E87A17',
    );
    
    expect(result).toBeInstanceOf(CosignatureTransaction);
  }, 10000); // 10 seconds
  test.skip('cosignatureTransaction cosign role play', async () => {
    const symbolBlockChain = await setupBlockChain('symbol');
    const symbolAddress = Address.createFromRawAddress(
      'TB22KPDYEOWXK2BSSEC7MATPBPVX4SLDR5SMMDY',
    );
    const password = 'pass';

    // momijiアカウントの作成
    const momijiBlockChain = await setupBlockChain('momiji');
    const strSignerQR = await fetchAccountMetaData(
      symbolBlockChain,
      symbolAccountMetaDataKey,
      symbolAddress,
    );
    const momijiSellerAccount = decryptedAccount(momijiBlockChain, strSignerQR, password);

    const exchangeTxHash = 'F73D2C5D968B52F125CB9C4AC176F0B0C999AFF0CA035DBE97776CA544E87A17'

    const cosignatureTx = await cosignatureTransaction(
      momijiBlockChain,
      exchangeTxHash,
    );
    
    //署名　& 送信
    const signedCosTx = momijiSellerAccount.signCosignatureTransaction(cosignatureTx);
    await firstValueFrom(momijiBlockChain.txRepo.announceAggregateBondedCosignature(signedCosTx));
  
    const result = await fetchTransactionStatus(
      momijiBlockChain,
      exchangeTxHash,
      momijiSellerAccount.address,
    );
  
    expect(result).toBeInstanceOf(TransactionStatus);
    expect(result.code).toEqual('Success');
    expect(result.group).toEqual('partial');

  }, 10000); // 10 seconds
});
