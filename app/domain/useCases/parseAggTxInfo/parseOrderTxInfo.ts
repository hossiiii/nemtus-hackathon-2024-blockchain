import { Account, AggregateTransaction, EncryptedMessage, PublicAccount, TransferTransaction } from 'symbol-sdk';
import { OrderInfo } from '../../entities/orderInfo/orderInfo';

export const parseOrderTxInfo = async (
  aggTxInfo: AggregateTransaction,
  momijiSrcAccount:Account,
  momijiTargetPublicAccount: PublicAccount,
): Promise<OrderInfo> => {
  const orderTxInfo = aggTxInfo.innerTransactions[0] as TransferTransaction; //innerTxの1番目がorderTx
  const encryptedPayload = orderTxInfo.message.payload;
  const encryptedMessage = new EncryptedMessage(encryptedPayload);
  const decryptedMessage = momijiSrcAccount.decryptMessage(encryptedMessage, momijiTargetPublicAccount).payload;
  const orderInfo: OrderInfo = JSON.parse(decryptedMessage);
  return orderInfo;
};