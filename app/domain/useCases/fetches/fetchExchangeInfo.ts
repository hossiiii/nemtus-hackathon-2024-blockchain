import { Account, AggregateTransaction, MosaicId, TransactionGroup, TransferTransaction } from 'symbol-sdk';
import { ExchangeInfo } from '../../entities/exchangeInfo/exchangeInfo';
import { firstValueFrom } from 'rxjs';
import { fetchProductInfo } from './fetchProductInfo';
import { parseOrderTx } from '../parse/parseOrderTx';
import { parsePaymentTx } from '../parse/parsePaymentTx';
import { ZoneOffset } from '@js-joda/core';
import { determineExchangeStatus } from '../determineExchangeStatus';
import { ExchangeOverview, isExchangeOverview } from '../../entities/exchangeHistoryInfo/exchangeOverview';
import { UserType } from '../../entities/userType/userType';
import { fetchAccountMetaData } from '../../utils/fetches/fetchAccountMetaData';

export const fetchExchangeInfo = async (
  momijiBlockChain: any,
  exchangeTxHash: string,
  account: Account,
): Promise<ExchangeInfo> => {
  let momijiAggregateBondedTxInfo: AggregateTransaction;
  try {
    // 最初にPartialトランザクションを試みます
    momijiAggregateBondedTxInfo = await firstValueFrom(momijiBlockChain.txRepo.getTransaction(exchangeTxHash, TransactionGroup.Partial)) as AggregateTransaction;
  } catch (error) {
    try {
      // Partialトランザクションの取得が失敗した場合、Confirmedトランザクションを試みます
      momijiAggregateBondedTxInfo = await firstValueFrom(momijiBlockChain.txRepo.getTransaction(exchangeTxHash, TransactionGroup.Confirmed)) as AggregateTransaction;
    } catch (error) {
      // Confirmedトランザクションの取得が失敗した場合、Unconfirmedトランザクションを試みます
      momijiAggregateBondedTxInfo = await firstValueFrom(momijiBlockChain.txRepo.getTransaction(exchangeTxHash, TransactionGroup.Unconfirmed)) as AggregateTransaction;
    }
  }

  // innerTransactionsの取得
  const sellerToUserTx = momijiAggregateBondedTxInfo.innerTransactions[0] as TransferTransaction;
  const userToSellerTx = momijiAggregateBondedTxInfo.innerTransactions[1] as TransferTransaction;
  const adminToAdminTx = momijiAggregateBondedTxInfo.innerTransactions[2] as TransferTransaction;

  let type : UserType;
  if (sellerToUserTx.signer.address.equals(account.address)) {
    type = 'seller';
  } else if (userToSellerTx.signer.address.equals(account.address)) {
    type = 'user';
  } else if (adminToAdminTx.signer.address.equals(account.address)) {
    type = 'admin';
  } else {
    throw new Error('Failed to determine user type');
  }

  // publicAccountの取得
  const sellerPublicAccount = sellerToUserTx.signer;
  const userPublicAccount = userToSellerTx.signer;
  const adminPublicAccount = adminToAdminTx.signer;

  // exchangeOverviewの取得
  let exchangeOverview : ExchangeOverview
  try {
    exchangeOverview = JSON.parse(adminToAdminTx.message.payload);
    if (!isExchangeOverview(exchangeOverview)) {
      throw new Error('Failed to parse ExchangeOverview object');
    }
  } catch (error) {
    throw new Error('Failed to parse ExchangeOverview object');
  }

  // cosignaturePublicKeysの取得
  const cosignaturePublicKeys = momijiAggregateBondedTxInfo.cosignatures.map((cosignature) => cosignature.signer.publicKey);
    
  // 取引有効期限を取得
  const deadline = momijiAggregateBondedTxInfo.deadline;
  const offset = ZoneOffset.of('+9'); // あなたの時間帯に合わせて調整してください
  const expiredAt = deadline.toLocalDateTime(momijiBlockChain.epochAdjustment).toEpochSecond(offset)*1000;

  // productInfoの取得
  const mosaicId = sellerToUserTx.mosaics[0].id as MosaicId;
  const productInfo = await fetchProductInfo(mosaicId);

  // adminToAdminTxからorderInfoTxとpaymentInfoTxを取得
  const orderPaymentInfoTxHash = exchangeOverview.orderTxHash;
  const momijiAggregateTxInfo = await firstValueFrom(momijiBlockChain.txRepo.getTransaction(orderPaymentInfoTxHash,TransactionGroup.Confirmed)) as AggregateTransaction;

  // orderInfoの取得
  let orderInfo = null;
  if (type === 'user' || type === 'seller') {
    orderInfo = await parseOrderTx(momijiAggregateTxInfo, account, (type==='user') ? sellerPublicAccount : userPublicAccount);
  }

  // paymentInfoの取得
  let paymentInfo = null;
  if (type === 'user' || type === 'admin') {
    paymentInfo = await parsePaymentTx(momijiAggregateTxInfo, account, (type==='user') ? adminPublicAccount : userPublicAccount);
  }

  // secretLockTxHashの取得
  let secretLockTxHash = null
  if(momijiAggregateTxInfo[2]){
    alert('momijiAggregateTxInfo[2] is not null')
    const secretLockHashTx = momijiAggregateTxInfo.innerTransactions[2] as TransferTransaction;
    alert(secretLockHashTx)
    secretLockTxHash = secretLockHashTx.message.payload;
    alert(secretLockTxHash)
  }

  // 管理者のメタデータからproof記録時のheightを取得
  const proofTxHeight = await fetchAccountMetaData(momijiBlockChain, exchangeTxHash, adminPublicAccount.address);
  
  // 取引状態の確認
  const status = await determineExchangeStatus( expiredAt,cosignaturePublicKeys,sellerPublicAccount,exchangeOverview.depositAddress,proofTxHeight,exchangeOverview.price*exchangeOverview.amount)

  // ExchangeInfoの生成
  const exchangeInfo: ExchangeInfo = {
    orderTxHash: exchangeOverview.orderTxHash,
    secretLockTxHash: secretLockTxHash,
    status: status,
    cosignaturePublicKeys: cosignaturePublicKeys,
    orderInfo: orderInfo,
    paymentInfo: paymentInfo,
    productInfo: productInfo,
    createTimestamp: exchangeOverview.createTimestamp,
    expiredAt: expiredAt,
  };

  return exchangeInfo;
};