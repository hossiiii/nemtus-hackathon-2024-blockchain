import { Account, AggregateTransaction, MosaicId, ReceiptType, TransactionGroup, TransactionStatement, TransferTransaction, UInt64 } from 'symbol-sdk';
import { ExchangeInfo, ExchangeStatus } from '../../entities/exchangeInfo/exchangeInfo';
import { firstValueFrom } from 'rxjs';
import { setupBlockChain } from '../../utils/setupBlockChain';
import { fetchProductInfo } from './fetchProductInfo';
import { parseOrderTx } from '../parse/parseOrderTx';
import { parsePaymentTx } from '../parse/parsePaymentTx';
import { ZoneOffset } from '@js-joda/core';
import { ExchangeOverview, isExchangeOverview } from '../../entities/exchangeHistoryInfo/exchangeHistoryInfo';
import { determineExchangeStatus } from '../determineExchangeStatus';

export const fetchExchangeInfo = async (
  exchangeTxHash: string,
  account: Account,
  type: 'user' | 'seller' | 'admin',
): Promise<ExchangeInfo> => {
  const momijiBlockChain = await setupBlockChain('momiji');
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

  // ブロック高の取得
  const momijiAggregateBondedTxHeight = momijiAggregateBondedTxInfo.transactionInfo.height.compact();

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
  const orderPaymentInfoTxHash = exchangeOverview.oerderPaymentTxHash;
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

  // 取引状態の確認
  const status = await determineExchangeStatus( expiredAt,cosignaturePublicKeys,sellerPublicAccount,exchangeOverview.secletLockTxTargetAddress,momijiAggregateBondedTxHeight)

  // ExchangeInfoの生成
  const exchangeInfo: ExchangeInfo = {
    oerderPaymentTxHash: exchangeOverview.oerderPaymentTxHash,
    status: status,
    cosignaturePublicKeys: cosignaturePublicKeys,
    orderInfo: orderInfo,
    paymentInfo: paymentInfo,
    productInfo: productInfo,
    secletLockTxHash: exchangeOverview.secletLockTxHash,
    secletLockTxSeclet: exchangeOverview.secletLockTxSeclet,
    createTimestamp: exchangeOverview.createTimestamp,
    expiredAt: expiredAt,
  };

  return exchangeInfo;
};