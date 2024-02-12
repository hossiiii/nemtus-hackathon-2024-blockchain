// 用途：商品登録を行う
import { Account, AggregateTransaction, Deadline } from 'symbol-sdk';
import { setupBlockChain } from '../../utils/setupBlockChain';
import { fetchAccountMetaData } from '../../utils/fetches/fetchAccountMetaData';
import { mosaicDefinitionTransaction } from '../../utils/transactions/mosaicDefinitionTransaction';
import { mosaicSupplyChangeTransaction } from '../../utils/transactions/mosaicSupplyChangeTransaction';
import { mosaicMetaDataTransaction } from '../../utils/transactions/mosaicMetaDataTransaction';
import { ProductInfo } from '../../entities/productInfo/productInfo';
import { symbolAccountMetaDataKey } from '../../../consts/consts';

export const registrationTransaction = async (
  momijiSellerAccount: Account,
  productInfo: ProductInfo,
  amount: number,
): Promise<AggregateTransaction> => {
  const momijiBlockChain = await setupBlockChain('momiji');

  // Metalトランザクションの作成 TODO
  const metalIds = ['astasdfasdfads', 'dftrgdgfdsfgsdfg', 'ddafadsfasdfda'];

  // momijiアカウントのメタデータ情報からSymbolのアドレスを取得
  const symbolSellerRawAddress = await fetchAccountMetaData(
    momijiBlockChain,
    symbolAccountMetaDataKey,
    momijiSellerAccount.address,
  );

  // 商品情報を修正
  productInfo.orderAddress = momijiSellerAccount.address.plain();
  productInfo.depositAddress = symbolSellerRawAddress;
  productInfo.metalIds = metalIds;

  const strProductInfo = JSON.stringify(productInfo);

  // 商品用モザイクの作成
  const mosaicDefinitionTx = mosaicDefinitionTransaction(
    momijiBlockChain,
    momijiSellerAccount.address,
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
    momijiSellerAccount.address,
  );

  // アグリゲートTxを作成
  const aggregateTx = AggregateTransaction.createComplete(
    Deadline.create(momijiBlockChain.epochAdjustment),
    [
      mosaicDefinitionTx.toAggregate(momijiSellerAccount.publicAccount),
      mosaicSupplyChangeTx.toAggregate(momijiSellerAccount.publicAccount),
      mosaicMetaDataTx.toAggregate(momijiSellerAccount.publicAccount),
    ],
    momijiBlockChain.networkType,
    [],
  ).setMaxFeeForAggregate(100, 0);

  return aggregateTx;
};
