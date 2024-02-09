import { Account, AggregateTransaction, Order, TransactionGroup, TransactionType, TransferTransaction } from 'symbol-sdk';
import { firstValueFrom } from 'rxjs';
import { setupBlockChain } from '../../utils/setupBlockChain';
import { ExchangeHistoryInfo, ExchangeOverview, isExchangeOverview } from '../../entities/exchangeHistoryInfo/exchangeHistoryInfo';
import { ZoneOffset } from '@js-joda/core';
import { ExchangeStatus } from '../../entities/exchangeInfo/exchangeInfo';
import { determineExchangeStatus } from '../determineExchangeStatus';

export const fetchExchangeHistoryInfo = async (
  account: Account
): Promise<ExchangeHistoryInfo[]> => {
  const momijiBlockChain = await setupBlockChain('momiji');
  const exchangeHistoryInfoList : ExchangeHistoryInfo[] = [];

  for (const transactionGroup of [TransactionGroup.Partial, TransactionGroup.Confirmed, TransactionGroup.Unconfirmed]) {
    const resultSearch = await firstValueFrom(
      momijiBlockChain.txRepo.search({
        type: [TransactionType.AGGREGATE_BONDED],
        group: transactionGroup as TransactionGroup,
        address: account.address,
        order: Order.Desc,
        pageSize: 100,
      })
    );
  
    for (const tx of resultSearch.data) {
      let exchangeHistoryInfo: ExchangeHistoryInfo;
      let exchangeOverview: ExchangeOverview;
      const momijiAggregateBondedTxInfo = await firstValueFrom(momijiBlockChain.txRepo.getTransaction(tx.transactionInfo.hash, transactionGroup as TransactionGroup)) as AggregateTransaction;
      const sellerToUserTx = momijiAggregateBondedTxInfo.innerTransactions[0] as TransferTransaction;
      const userToSellerTx = momijiAggregateBondedTxInfo.innerTransactions[1] as TransferTransaction;
      const adminToAdminTx = momijiAggregateBondedTxInfo.innerTransactions[2] as TransferTransaction;

      // ブロック高の取得
      const momijiAggregateBondedTxHeight = momijiAggregateBondedTxInfo.transactionInfo.height.compact();
      
      // publicAccountの取得
      const sellerPublicAccount = sellerToUserTx.signer;
      const userPublicAccount = userToSellerTx.signer;
      const adminPublicAccount = adminToAdminTx.signer;
  
      // cosignaturePublicKeysの取得
      const cosignaturePublicKeys = momijiAggregateBondedTxInfo.cosignatures.map((cosignature) => cosignature.signer.publicKey);
  
      // 取引有効期限を取得
      const deadline = momijiAggregateBondedTxInfo.deadline;
      const offset = ZoneOffset.of('+9'); // あなたの時間帯に合わせて調整してください
      const expiredAt = deadline.toLocalDateTime(momijiBlockChain.epochAdjustment).toEpochSecond(offset)*1000;
    
      try {
        // exchangeOverviewの取得
        exchangeOverview = JSON.parse(adminToAdminTx.message.payload);
        if (!isExchangeOverview(exchangeOverview)) {
          throw new Error('Failed to parse ExchangeOverview object');
        }

        // 取引状態の確認
        const status = await determineExchangeStatus( expiredAt,cosignaturePublicKeys,sellerPublicAccount, exchangeOverview.secletLockTxTargetAddress, momijiAggregateBondedTxHeight)

        exchangeHistoryInfo = {
          status: status,
          exchangeTxHash: tx.transactionInfo.hash,
          exchangeOverview:exchangeOverview,
          expiredAt: expiredAt,
        }
        exchangeHistoryInfoList.push(exchangeHistoryInfo);
      } catch (error) {
        continue;
      }
    } 
  }

  return exchangeHistoryInfoList;
};