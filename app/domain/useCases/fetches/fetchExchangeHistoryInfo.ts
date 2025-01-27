import { Address, AggregateTransaction, Order, TransactionGroup, TransactionType, TransferTransaction } from 'symbol-sdk';
import { firstValueFrom } from 'rxjs';
import { ExchangeHistoryInfo } from '../../entities/exchangeHistoryInfo/exchangeHistoryInfo';
import { ZoneOffset } from '@js-joda/core';
import { determineExchangeStatus } from '../determineExchangeStatus';
import { ExchangeOverview, isExchangeOverview } from '../../entities/exchangeHistoryInfo/exchangeOverview';
import { fetchAccountMetaData } from '../../utils/fetches/fetchAccountMetaData';

export const fetchExchangeHistoryInfo = async (
  momijiBlockChain: any,
  address: Address
): Promise<ExchangeHistoryInfo[]> => {
  const exchangeHistoryInfoList : ExchangeHistoryInfo[] = [];

  for (const transactionGroup of [TransactionGroup.Partial, TransactionGroup.Confirmed, TransactionGroup.Unconfirmed]) {
    const resultSearch = await firstValueFrom(
      momijiBlockChain.txRepo.search({
        type: [TransactionType.AGGREGATE_BONDED],
        group: transactionGroup as TransactionGroup,
        address: address,
        order: Order.Desc,
        pageSize: 100,
      })
    );
  
    for (const tx of (resultSearch as any).data) {
      let exchangeHistoryInfo: ExchangeHistoryInfo;
      let exchangeOverview: ExchangeOverview;

      const exchangeTxHash = tx.transactionInfo.hash;
      const momijiAggregateBondedTxInfo = await firstValueFrom(momijiBlockChain.txRepo.getTransaction(exchangeTxHash, transactionGroup as TransactionGroup)) as AggregateTransaction;
      const sellerToUserTx = momijiAggregateBondedTxInfo.innerTransactions[0] as TransferTransaction;
      const userToSellerTx = momijiAggregateBondedTxInfo.innerTransactions[1] as TransferTransaction;
      const adminToAdminTx = momijiAggregateBondedTxInfo.innerTransactions[2] as TransferTransaction;
      
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

      // 管理者のメタデータからproof記録時のheightを取得
      const proofTxHeight = await fetchAccountMetaData(momijiBlockChain, exchangeTxHash, adminPublicAccount.address);

      try {
        // exchangeOverviewの取得
        exchangeOverview = JSON.parse(adminToAdminTx.message.payload);
        if (!isExchangeOverview(exchangeOverview)) {
          throw new Error('Failed to parse ExchangeOverview object');
        }

        // 取引状態の確認
        const status = await determineExchangeStatus( expiredAt,cosignaturePublicKeys,sellerPublicAccount, exchangeOverview.depositAddress, proofTxHeight, exchangeOverview.price*exchangeOverview.amount)

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