import fetch from 'node-fetch';
global.fetch = fetch;

import { Account, Address, AggregateTransaction, Crypto, PublicAccount, TransactionGroup, TransactionStatus, TransferTransaction } from 'symbol-sdk';
import { setupBlockChain } from '../utils/setupBlockChain';
import { firstValueFrom } from 'rxjs';
import { fetchTransactionStatus } from '../utils/fetches/fetchTransactionStatus';
import { fetchAccountMetaData } from '../utils/fetches/fetchAccountMetaData';
import { symbolAccountMetaDataKey, serviceName, serviceVersion } from '../../consts/consts';
import { ProductInfo } from '../entities/productInfo/productInfo';
import { decryptedAccount } from '../utils/accounts/decryptedAccount';
import { PaymentInfo } from '../entities/paymentInfo/paymentInfo';
import { OrderInfo } from '../entities/orderInfo/orderInfo';
import { order } from './order';
import { sha3_256 } from 'js-sha3';
import { secretLockTransaction } from '../utils/transactions/secretLockTransaction';

describe('order', () => {
  it('should return a new Transactions', async () => {
    const symbolBlockChain = await setupBlockChain('symbol');
    const symbolUserPublicAccount = PublicAccount.createFromPublicKey(
      '11BA500388574AA0376CE911EA43DA0EBFDC788869E81BB1CA2496F781F99B8A',
      symbolBlockChain.networkType,
    );
    const password = 'pass';
    const productInfo: ProductInfo = {
      productName: 'productName',
      sellerName: 'sellerName',
      description: 'description',
      category: ['category1', 'category2'],
      metalIds: ['metalId1', 'metalId2'],
      orderAddress: "TCC6FHMRFBI75XSH7QMVR64UQLM2CQIQGPVKNEQ",
      depositAddress: "TAOLQGT43Q4VYTFOWDUFHR3DY2ZAVO6NI24HBMQ",
      price: 200,
      serviceName: serviceName,
      servieVersion: serviceVersion,
    };
    const paymentInfo: PaymentInfo = {
      proof: "proof",
      mosaicId: "mosaicId",
      amount: 2,
      secletLockTxHash: "secletLockTxHash",
      serviceName: serviceName,
      servieVersion: serviceVersion,
    };
    const orderInfo: OrderInfo = {
      name: 'productName',
      tel: '080-1234-5678',
      address: "住所情報",
      mosaicId: "mosaicId",
      amount: 2,
      notes: "備考",
      secletLockTxHash: "secletLockTxHash",
      serviceName: serviceName,
      servieVersion: serviceVersion,
    };

    const result = await order(symbolUserPublicAccount, password, productInfo, paymentInfo, orderInfo);
    expect(result).toBeInstanceOf(AggregateTransaction);
  }, 10000); // 10 seconds

  it('order role play', async () => {
    const symbolBlockChain = await setupBlockChain('symbol');

    //secletLockTx作成
    const random = Crypto.randomBytes(20);
    const secretHash = sha3_256.create();
    const secret = secretHash.update(random).hex();
    const proof = random.toString('hex');

    console.log(secret);
    console.log(proof);

    const symbolUserAccount = Account.createFromPrivateKey("B05D3397F7A63B7437DDA11E8390E8EFDFCC90443B336DD5FD82C39266D606B4",symbolBlockChain.networkType)
    const symbolSellerAddress = Address.createFromRawAddress("TAOLQGT43Q4VYTFOWDUFHR3DY2ZAVO6NI24HBMQ");
    const secletTx = secretLockTransaction(symbolBlockChain, 1, secret, symbolSellerAddress);

    //署名　& 送信
    const symbolSignedSecletLockTx = symbolUserAccount.sign(
      secletTx,
      symbolBlockChain.generationHash,
    );
    const symbolSignedSecletLockTxHash = symbolSignedSecletLockTx.hash;
    await firstValueFrom(symbolBlockChain.txRepo.announce(symbolSignedSecletLockTx));
    await fetchTransactionStatus(
      symbolBlockChain,
      symbolSignedSecletLockTxHash,
      symbolUserAccount.address,
    );

    // 注文情報作成
    const productInfo: ProductInfo = {
      productName: 'productName',
      sellerName: 'sellerName',
      description: 'description',
      category: ['category1', 'category2'],
      metalIds: ['metalId1', 'metalId2'],
      orderAddress: "TCC6FHMRFBI75XSH7QMVR64UQLM2CQIQGPVKNEQ",
      depositAddress: "TAOLQGT43Q4VYTFOWDUFHR3DY2ZAVO6NI24HBMQ",
      price: 200,
      serviceName: serviceName,
      servieVersion: serviceVersion,
    };
    const paymentInfo: PaymentInfo = {
      proof: proof,
      mosaicId: "60CF4EF5A7133B40",
      amount: 2,
      secletLockTxHash: symbolSignedSecletLockTxHash,
      serviceName: serviceName,
      servieVersion: serviceVersion,
    };
    const orderInfo: OrderInfo = {
      name: 'productName',
      tel: '080-1234-5678',
      address: "住所情報",
      mosaicId: "60CF4EF5A7133B40",
      amount: 2,
      notes: "備考",
      secletLockTxHash: symbolSignedSecletLockTxHash,
      serviceName: serviceName,
      servieVersion: serviceVersion,
    };

    const password = 'pass';
    const momijiAggregateTx = await order(symbolUserAccount.publicAccount, password, productInfo, paymentInfo, orderInfo);

    // momijiアカウントの作成
    const momijiBlockChain = await setupBlockChain('momiji');
    const strSignerQR = await fetchAccountMetaData(
      symbolBlockChain,
      symbolAccountMetaDataKey,
      symbolUserAccount.address,
    );
    const momijiUserAccount = decryptedAccount(momijiBlockChain, strSignerQR, password);
    
    //署名　& 送信
    const momijiSignedTx = momijiUserAccount.sign(momijiAggregateTx, momijiBlockChain.generationHash);
    const momijiHash = momijiSignedTx.hash;
    await firstValueFrom(momijiBlockChain.txRepo.announce(momijiSignedTx));
  
    const result = await fetchTransactionStatus(
      momijiBlockChain,
      momijiHash,
      momijiUserAccount.address,
    );

    expect(result).toBeInstanceOf(TransactionStatus);
    expect(result.code).toEqual('Success');
    expect(result.group).toEqual('confirmed');

  }, 120000); // 120 seconds
});
