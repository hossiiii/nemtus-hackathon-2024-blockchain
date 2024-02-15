import fetch from 'node-fetch';
global.fetch = fetch;

import { Account, Address, AggregateTransaction, Crypto, PublicAccount, TransactionGroup, TransactionStatus, TransferTransaction } from 'symbol-sdk';
import { setupBlockChain } from '../../utils/setupBlockChain';
import { firstValueFrom } from 'rxjs';
import { fetchTransactionStatus } from '../../utils/fetches/fetchTransactionStatus';
import { fetchAccountMetaData } from '../../utils/fetches/fetchAccountMetaData';
import { symbolAccountMetaDataKey, serviceName, serviceVersion } from '../../../consts/consts';
import { ProductInfo } from '../../entities/productInfo/productInfo';
import { decryptedAccount } from '../../utils/accounts/decryptedAccount';
import { PaymentInfo } from '../../entities/paymentInfo/paymentInfo';
import { OrderInfo } from '../../entities/orderInfo/orderInfo';
import { orderTransaction } from './orderTransaction';
import { sha3_256 } from 'js-sha3';
import { secretLockTransaction } from '../../utils/transactions/secretLockTransaction';

describe('orderTransaction', () => {
  it('should return a new Transactions', async () => {
    const symbolBlockChain = await setupBlockChain('symbol');
    const symbolUserPublicAccount = PublicAccount.createFromPublicKey(
      'AA16B49128A49D323C91D2BFE1EEDC9C7CE8C39BC5B1F2C74EB059AE5539625A',
      symbolBlockChain.networkType,
    );
    const password = 'pass';
    const productInfo: ProductInfo = {
      productName: 'productName',
      sellerName: 'sellerName',
      description: 'description',
      category: ['category1', 'category2'],
      metalIds: ['metalId1', 'metalId2'],
      ownerAddress: "TATBCPOTCYDG6YJD66YCZ765GGPUQ67VR54HSXY",
      depositAddress: "TB22KPDYEOWXK2BSSEC7MATPBPVX4SLDR5SMMDY",
      price: 200,
      serviceName: serviceName,
      servieVersion: serviceVersion,
    };
    const paymentInfo: PaymentInfo = {
      proof: "proof",
      mosaicId: "mosaicId",
      amount: 2,
      secretLockTxHash: "secretLockTxHash",
      secretLockTxSecret: "",
      serviceName: serviceName,
      servieVersion: serviceVersion,
    };
    const orderTransactionInfo: OrderInfo = {
      name: 'productName',
      tel: '080-1234-5678',
      address: "住所情報",
      mosaicId: "mosaicId",
      amount: 2,
      notes: "備考",
      serviceName: serviceName,
      servieVersion: serviceVersion,
    };

    const result = await orderTransaction(symbolUserPublicAccount, password, productInfo, paymentInfo, orderTransactionInfo);
    expect(result).toBeInstanceOf(AggregateTransaction);
  }, 10000); // 10 seconds

  it('orderTransaction role play', async () => {
    const symbolBlockChain = await setupBlockChain('symbol');

    //secretLockTx作成
    const random = Crypto.randomBytes(20);
    const secretHash = sha3_256.create();
    const secret = secretHash.update(random).hex();
    const proof = random.toString('hex');

    console.log(secret);
    console.log(proof);

    const symbolUserAccount = Account.createFromPrivateKey("FF83D96E7AFC2E18115A46389633506DCFA1E749AAD95DED8FACD184FB53689B",symbolBlockChain.networkType)
    const symbolSellerAddress = Address.createFromRawAddress("TB22KPDYEOWXK2BSSEC7MATPBPVX4SLDR5SMMDY");
    const secretTx = secretLockTransaction(symbolBlockChain, 1, secret, symbolSellerAddress);

    //署名　& 送信
    const symbolSignedSecretLockTx = symbolUserAccount.sign(
      secretTx,
      symbolBlockChain.generationHash,
    );
    const symbolSignedSecretLockTxHash = symbolSignedSecretLockTx.hash;
    await firstValueFrom(symbolBlockChain.txRepo.announce(symbolSignedSecretLockTx));
    const symbolSignedSecretLockTxResult = await fetchTransactionStatus(
      symbolBlockChain,
      symbolSignedSecretLockTxHash,
      symbolUserAccount.address,
    );

    // 注文情報作成
    const productInfo: ProductInfo = {
      productName: 'productName',
      sellerName: 'sellerName',
      description: 'description',
      category: ['category1', 'category2'],
      metalIds: ['metalId1', 'metalId2'],
      ownerAddress: "TATBCPOTCYDG6YJD66YCZ765GGPUQ67VR54HSXY",
      depositAddress: "TB22KPDYEOWXK2BSSEC7MATPBPVX4SLDR5SMMDY",
      price: 200,
      serviceName: serviceName,
      servieVersion: serviceVersion,
    };
    const paymentInfo: PaymentInfo = {
      proof: proof,
      mosaicId: "3EF678B48A785AF0",
      amount: 2,
      secretLockTxHash: symbolSignedSecretLockTxHash,
      secretLockTxSecret: secret,
      serviceName: serviceName,
      servieVersion: serviceVersion,
    };
    const orderTransactionInfo: OrderInfo = {
      name: 'productName',
      tel: '080-1234-5678',
      address: "住所情報",
      mosaicId: "3EF678B48A785AF0",
      amount: 2,
      notes: "備考",
      serviceName: serviceName,
      servieVersion: serviceVersion,
    };

    const password = 'pass';
    const momijiAggregateTx = await orderTransaction(symbolUserAccount.publicAccount, password, productInfo, paymentInfo, orderTransactionInfo);

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
