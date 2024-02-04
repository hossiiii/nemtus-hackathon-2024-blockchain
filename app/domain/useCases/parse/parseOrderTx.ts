import { Account, AggregateTransaction, EncryptedMessage, PublicAccount, TransferTransaction } from 'symbol-sdk';
import { OrderInfo } from '../../entities/orderInfo/orderInfo';

export const parseOrderTx = async (
  aggTxInfo: AggregateTransaction,
  momijiSrcAccount:Account,
  momijiTargetPublicAccount: PublicAccount,
): Promise<OrderInfo> => {
  const parseOrderTx = aggTxInfo.innerTransactions[0] as TransferTransaction; //innerTxの1番目がorderTx
  const encryptedPayload = parseOrderTx.message.payload;
  const encryptedMessage = new EncryptedMessage(encryptedPayload);
  const decryptedMessage = momijiSrcAccount.decryptMessage(encryptedMessage, momijiTargetPublicAccount).payload;
  const orderInfo: OrderInfo = JSON.parse(decryptedMessage);
  return orderInfo;
};