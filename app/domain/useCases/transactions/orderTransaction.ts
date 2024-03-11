// 用途：注文を行うビジネスロジック
import { Account, Address, AggregateTransaction, Deadline, PublicAccount } from 'symbol-sdk';
import { transferTransactionWithEncryptMessage } from '../../utils/transactions/transferTransactionWithEncryptMessage';
import { fetchPublicAccount } from '../../utils/fetches/fetchPublicAccount';
import { PaymentInfo } from '../../entities/paymentInfo/paymentInfo';
import { OrderInfo } from '../../entities/orderInfo/orderInfo';
import { ProductInfo } from '../../entities/productInfo/productInfo';
import { transferTransactionWithMessage } from '../../utils/transactions/transferTransactionWithMessage';

export const orderTransaction = async (
  momijiBlockChain: any,
  momijiUserAccount: Account,
  productInfo: ProductInfo,
  paymentInfo:PaymentInfo,
  orderInfo: OrderInfo,
  hash: string
): Promise<AggregateTransaction> => {
  // 販売者向けの注文情報送信用Txを作成
  const strOrderInfo = JSON.stringify(orderInfo);
  const momijiSellerAddress = Address.createFromRawAddress(productInfo.ownerAddress);
  const momijiSellerPublicAccount = await fetchPublicAccount(momijiBlockChain, momijiSellerAddress);
  const orderInfoTx = transferTransactionWithEncryptMessage(
    momijiBlockChain,
    strOrderInfo,
    momijiUserAccount,
    momijiSellerPublicAccount
  );

  // 管理者向けの支払い情報送信用Txを作成:注文情報のhashを使うので、注文情報を作成した後に作成する
  const strPaymentInfo = JSON.stringify(paymentInfo);
  const momijiAdminPublicAccount = PublicAccount.createFromPublicKey(process.env.NEXT_PUBLIC_ADMIN_PUBLIC_KEY, momijiBlockChain.networkType);
  const paymentInfoTx = transferTransactionWithEncryptMessage(
    momijiBlockChain,
    strPaymentInfo,
    momijiUserAccount,
    momijiAdminPublicAccount
  );

  const secretLockHashTx = transferTransactionWithMessage(
    momijiBlockChain,
    hash,
    momijiSellerPublicAccount.address
  )

  const agregateTx = AggregateTransaction.createComplete(
    Deadline.create(momijiBlockChain.epochAdjustment),
    [
      orderInfoTx.toAggregate(momijiUserAccount.publicAccount),
      paymentInfoTx.toAggregate(momijiUserAccount.publicAccount),
      secretLockHashTx.toAggregate(momijiUserAccount.publicAccount)
    ],
    momijiBlockChain.networkType,
    [],
  ).setMaxFeeForAggregate(100, 0);

  return agregateTx;
};
