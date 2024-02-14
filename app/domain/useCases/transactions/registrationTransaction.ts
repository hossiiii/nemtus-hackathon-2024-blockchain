// 用途：商品登録を行う
import { Account, Address, AggregateTransaction, Deadline } from 'symbol-sdk';
import { setupBlockChain } from '../../utils/setupBlockChain';
import { mosaicDefinitionTransaction } from '../../utils/transactions/mosaicDefinitionTransaction';
import { mosaicSupplyChangeTransaction } from '../../utils/transactions/mosaicSupplyChangeTransaction';
import { mosaicMetaDataTransaction } from '../../utils/transactions/mosaicMetaDataTransaction';
import { ProductInfo } from '../../entities/productInfo/productInfo';

export const registrationTransaction = async (
  momijiBlockChain: any,
  momijiSellerAccount: Account,
  productInfo: ProductInfo,
  amount: number,
): Promise<AggregateTransaction> => {

  // 商品用モザイクを作成するトランザクション
  const mosaicDefinitionTx = mosaicDefinitionTransaction(
    momijiBlockChain,
    momijiSellerAccount.address,
  );
  const mosaicSupplyChangeTx = mosaicSupplyChangeTransaction(
    momijiBlockChain,
    amount,
    mosaicDefinitionTx.mosaicId,
  );

  // 商品情報を修正
  productInfo.mosaicId = mosaicDefinitionTx.mosaicId.toHex();
  productInfo.ownerAddress = momijiSellerAccount.address.plain();
  const strProductInfo = JSON.stringify(productInfo);

  // 商品情報をメタデータに書き込むトランザクション  
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
