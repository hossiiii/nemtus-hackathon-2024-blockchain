import fetch from 'node-fetch';
global.fetch = fetch;

import { Account, AggregateTransaction, PublicAccount, TransactionStatus } from 'symbol-sdk';
import { setupBlockChain } from '../../utils/setupBlockChain';
import { firstValueFrom } from 'rxjs';
import { fetchTransactionStatus } from '../../utils/fetches/fetchTransactionStatus';
import { fetchAccountMetaData } from '../../utils/fetches/fetchAccountMetaData';
import { symbolAccountMetaDataKey, serviceName, serviceVersion } from '../../../consts/consts';
import { registrationTransaction } from './registrationTransaction';
import { ProductInfo } from '../../entities/productInfo/productInfo';
import { decryptedAccount } from '../../utils/accounts/decryptedAccount';

describe('registrationTransaction', () => {
  test('should return a new AggegateTransaction', async () => {
    const momijiBlockChain = await setupBlockChain('momiji');
    const momijiSellerAccount = Account.createFromPrivateKey('ACE601DF0DE67888FC67FD7D800A3995AC3005C93F057D9BFFCDD94C5BF48F89', momijiBlockChain.networkType);
    const productInfo: ProductInfo = {
      productName: 'productName',
      sellerName: 'sellerName',
      description: 'description',
      category: ['category1', 'category2'],
      metalIds: null,
      orderAddress: null,
      depositAddress: null,
      price: 200,
      serviceName: serviceName,
      servieVersion: serviceVersion,
    };
    const amount = 100;
    const result = await registrationTransaction(momijiSellerAccount, productInfo, amount);
    expect(result).toBeInstanceOf(AggregateTransaction);
  }, 10000); // 10 seconds

  test.only('registrationTransaction role play', async () => {
    const symbolBlockChain = await setupBlockChain('symbol');
    const symbolSellerPublicAccount = PublicAccount.createFromPublicKey('2BC6CA5C514A9337D40C3F9BC6C0D273F410F4E7E303F0ED49D450C6F499BDB1',symbolBlockChain.networkType);

    // momijiアカウントの作成
    const momijiBlockChain = await setupBlockChain('momiji');
    const password = 'pass';
    const strSignerQR = await fetchAccountMetaData(
      symbolBlockChain,
      symbolAccountMetaDataKey,
      symbolSellerPublicAccount.address,
    );
    const momijiSellerAccount = decryptedAccount(momijiBlockChain, strSignerQR, password);
    
    const productInfo : ProductInfo = {
      productName: "productName",
      sellerName: "sellerName",
      description: "description",
      category: ["category1","category2"],
      metalIds: null,
      orderAddress: null,
      depositAddress: null,
      price: 200,
      serviceName: serviceName,
      servieVersion: serviceVersion,
    }
    const amount = 100;
    const momijiAggregateTx = await registrationTransaction(momijiSellerAccount,productInfo,amount);

    //署名　& 送信
    const momijiSignedTx = momijiSellerAccount.sign(momijiAggregateTx, momijiBlockChain.generationHash);
    const momijiHash = momijiSignedTx.hash;
    await firstValueFrom(momijiBlockChain.txRepo.announce(momijiSignedTx));
  
    const result = await fetchTransactionStatus(
      momijiBlockChain,
      momijiHash,
      momijiSellerAccount.address,
    );
  
    expect(result).toBeInstanceOf(TransactionStatus);
    expect(result.code).toEqual('Success');
    expect(result.group).toEqual('confirmed');

  }, 120000); // 120 seconds
});
