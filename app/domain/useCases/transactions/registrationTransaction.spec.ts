import fetch from 'node-fetch';
global.fetch = fetch;

import { AggregateTransaction, PublicAccount, TransactionStatus } from 'symbol-sdk';
import { setupBlockChain } from '../../utils/setupBlockChain';
import { firstValueFrom } from 'rxjs';
import { fetchTransactionStatus } from '../../utils/fetches/fetchTransactionStatus';
import { fetchAccountMetaData } from '../../utils/fetches/fetchAccountMetaData';
import { symbolAccountMetaDataKey, serviceName, serviceVersion } from '../../../consts/consts';
import { registrationTransaction } from './registrationTransaction';
import { ProductInfo } from '../../entities/productInfo/productInfo';
import { decryptedAccount } from '../../utils/accounts/decryptedAccount';

describe('registrationTransaction', () => {
  it('should return a new AggegateTransaction', async () => {
    const symbolBlockChain = await setupBlockChain('symbol');
    const symbolSellerPublicAccount = PublicAccount.createFromPublicKey(
      '2CADE9448E21329DEB84D1A3D61DCAC0A061E27054007F52F8CEEEDA0044817D',
      symbolBlockChain.networkType,
    );
    const password = 'pass';
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
    const result = await registrationTransaction(symbolSellerPublicAccount, password, productInfo, amount);
    expect(result).toBeInstanceOf(AggregateTransaction);
  }, 10000); // 10 seconds

  it('registrationTransaction role play', async () => {
    const symbolBlockChain = await setupBlockChain('symbol');
    const symbolSellerPublicAccount = PublicAccount.createFromPublicKey('2CADE9448E21329DEB84D1A3D61DCAC0A061E27054007F52F8CEEEDA0044817D',symbolBlockChain.networkType);
    const password = 'pass';
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
    const momijiAggregateTx = await registrationTransaction(symbolSellerPublicAccount,password,productInfo,amount);

    // momijiアカウントの作成
    const momijiBlockChain = await setupBlockChain('momiji');
    const strSignerQR = await fetchAccountMetaData(
      symbolBlockChain,
      symbolAccountMetaDataKey,
      symbolSellerPublicAccount.address,
    );
    const momijiSellerAccount = decryptedAccount(momijiBlockChain, strSignerQR, password);
    
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
