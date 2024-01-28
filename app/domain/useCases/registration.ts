// 用途：商品登録を行う
import { AggregateTransaction, Deadline, PublicAccount } from 'symbol-sdk';
import { setupBlockChain } from '../utils/setupBlockChain';
import { firstValueFrom } from 'rxjs';
import { fetchTransactionStatus } from '../utils/fetches/fetchTransactionStatus';
import { fetchAccountMetaData } from '../utils/fetches/fetchAccountMetaData';
import { decryptedAccount } from '../utils/accounts/decryptedAccount';
import { mosaicDefinitionTransaction } from '../utils/transactions/mosaicDefinitionTransaction';
import { mosaicSupplyChangeTransaction } from '../utils/transactions/mosaicSupplyChangeTransaction';
import { mosaicMetaDataTransaction } from '../utils/transactions/mosaicMetaDataTransaction';
import { ProductInfo } from '../entities/productInfo/productInfo';
import { accountMetaDataKey } from '../../consts/consts';

export const registration = async (
  password: string,
  productInfo: ProductInfo,
  amount: number,
): Promise<string> => {
  const momijiBlockChain = await setupBlockChain('momiji');
  const symbolBlockChain = await setupBlockChain('symbol');

  // SymbolアカウントのアドレスをaLiceから取得(TODO　bobSymbolPublicKeyを使用、実際にはAPIで取得する)
  const symbolTargetPublicKey = 'CE98705EBCAED8F6558897D0B3435A856A63B6CA8200593E3FBB33F61E86FC46';
  const symbolTargetPublicAccount = PublicAccount.createFromPublicKey(
    symbolTargetPublicKey,
    symbolBlockChain.networkType,
  );

  // プライベートチェーンのアカウントを参照
  const strQr = await fetchAccountMetaData(
    symbolBlockChain,
    accountMetaDataKey,
    symbolTargetPublicAccount.address,
  );
  const momijiTargetAccount = decryptedAccount(momijiBlockChain, strQr, password);

  // Metalトランザクションの作成 TODO
  const metalIds = [
    'astasdfasdfads',
    'dftrgdgfdsfgsdfg',
    'ddafadsfasdfda'
  ];

  // 商品情報を修正
  productInfo.depositAddress = symbolTargetPublicAccount.address.plain();
  productInfo.metalIds = metalIds;

  const strProductInfo = JSON.stringify(productInfo);

  // 商品用モザイクの作成
  const mosaicDefinitionTx = mosaicDefinitionTransaction(
    momijiBlockChain,
    momijiTargetAccount.address,
  );
  const mosaicSupplyChangeTx = mosaicSupplyChangeTransaction(
    momijiBlockChain,
    amount,
    mosaicDefinitionTx.mosaicId,
  );
  const mosaicMetaDataTx = await mosaicMetaDataTransaction(
    momijiBlockChain,
    'productInfo',
    strProductInfo,
    mosaicDefinitionTx.mosaicId,
    momijiTargetAccount.address,
  );

  // アグリゲートTxを作成
  const aggregateTx = AggregateTransaction.createComplete(
    Deadline.create(momijiBlockChain.epochAdjustment),
    [
      mosaicDefinitionTx.toAggregate(momijiTargetAccount.publicAccount),
      mosaicSupplyChangeTx.toAggregate(momijiTargetAccount.publicAccount),
      mosaicMetaDataTx.toAggregate(momijiTargetAccount.publicAccount),
    ],
    momijiBlockChain.networkType,
    [],
  ).setMaxFeeForAggregate(100, 0);

  const momijiSignedTx = momijiTargetAccount.sign(aggregateTx, momijiBlockChain.generationHash);

  // Momijiネットワークへのアナウンス
  const momijiHash = momijiSignedTx.hash;
  await firstValueFrom(momijiBlockChain.txRepo.announce(momijiSignedTx));

  const result = await fetchTransactionStatus(
    momijiBlockChain,
    momijiHash,
    momijiTargetAccount.address,
  );

  if(result.code === "Success"){
    return mosaicDefinitionTx.mosaicId.id.toHex();
  }else{
    throw new Error(JSON.stringify(result));
  }
};
