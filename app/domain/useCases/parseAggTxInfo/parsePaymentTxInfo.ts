import { Account, AggregateTransaction, EncryptedMessage, PublicAccount, TransferTransaction } from 'symbol-sdk';
import { PaymentInfo } from '../../entities/paymentInfo/paymentInfo';

export const parsePaymentTxInfo = async (
  aggTxInfo: AggregateTransaction,
  momijiSrcAccount:Account,
  momijiTargetPublicAccount: PublicAccount,
): Promise<PaymentInfo> => {
  const paymentTxInfo = aggTxInfo.innerTransactions[1] as TransferTransaction; //innerTxの２番目がpaymentTx
  const encryptedPayload = paymentTxInfo.message.payload;
  const encryptedMessage = new EncryptedMessage(encryptedPayload);
  const decryptedMessage = momijiSrcAccount.decryptMessage(encryptedMessage, momijiTargetPublicAccount).payload;
  const paymentInfo: PaymentInfo = JSON.parse(decryptedMessage);
  return paymentInfo;
};