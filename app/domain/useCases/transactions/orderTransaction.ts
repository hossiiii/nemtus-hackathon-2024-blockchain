// 用途：注文を行うビジネスロジック
import { Address, AggregateTransaction, Deadline, PublicAccount } from 'symbol-sdk';
import { setupBlockChain } from '../../utils/setupBlockChain';
import { transferTransactionWithEncryptMessage } from '../../utils/transactions/transferTransactionWithEncryptMessage';
import { fetchPublicAccount } from '../../utils/fetches/fetchPublicAccount';
import { PaymentInfo } from '../../entities/paymentInfo/paymentInfo';
import { OrderInfo } from '../../entities/orderInfo/orderInfo';
import { fetchAccountMetaData } from '../../utils/fetches/fetchAccountMetaData';
import { symbolAccountMetaDataKey } from '../../../consts/consts';
import { decryptedAccount } from '../../utils/accounts/decryptedAccount';
import { ProductInfo } from '../../entities/productInfo/productInfo';

export const orderTransaction = async (
  symbolUserPublicAccount: PublicAccount,
  password: string,
  productInfo: ProductInfo,
  paymentInfo:PaymentInfo,
  orderInfo: OrderInfo,
): Promise<AggregateTransaction> => {
  const momijiBlockChain = await setupBlockChain('momiji');
  const symbolBlockChain = await setupBlockChain('symbol');

  // プライベートチェーンのアカウントを参照
  const strQr = await fetchAccountMetaData(
    symbolBlockChain,
    symbolAccountMetaDataKey,
    symbolUserPublicAccount.address,
  );
  const momijiUserAccount = decryptedAccount(momijiBlockChain, strQr, password);

  // 販売者向けの注文情報送信用Txを作成
  const strOrderInfo = JSON.stringify(orderInfo);
  const momijiSellerAddress = Address.createFromRawAddress(productInfo.orderAddress);
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

  const agregateTx = AggregateTransaction.createComplete(
    Deadline.create(momijiBlockChain.epochAdjustment),
    [
      orderInfoTx.toAggregate(momijiUserAccount.publicAccount),
      paymentInfoTx.toAggregate(momijiUserAccount.publicAccount)
    ],
    momijiBlockChain.networkType,
    [],
  ).setMaxFeeForAggregate(100, 0);

  return agregateTx;
};
