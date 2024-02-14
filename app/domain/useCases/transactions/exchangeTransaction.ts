// 用途：管理者からの取引用トランザクションを作成する
import { Account, Address, AggregateTransaction, Deadline, MosaicId, PublicAccount, TransactionGroup, TransferTransaction } from 'symbol-sdk';
import { setupBlockChain } from '../../utils/setupBlockChain';
import { firstValueFrom } from 'rxjs';
import { parsePaymentTx } from '../parse/parsePaymentTx';
import { transferTransactionWithMosaic } from '../../utils/transactions/transferTransactionWithMosaic';
import { transferTransactionWithMessage } from '../../utils/transactions/transferTransactionWithMessage';
import { fetchProductInfo } from '../fetches/fetchProductInfo';
import { ExchangeOverview } from '../../entities/exchangeHistoryInfo/exchangeOverview';
import { fetchPublicAccount } from '../../utils/fetches/fetchPublicAccount';

export const exchangeTransaction = async (
  momijiBlockChain: any,
  orderTxHash: string,
): Promise<AggregateTransaction> => { //TODO: 返り値の型を修正
  const momijiAdminAccount = Account.createFromPrivateKey(process.env.PRIVATE_KEY, momijiBlockChain.networkType);
  const orderTxInfo = await firstValueFrom(momijiBlockChain.txRepo.getTransaction(orderTxHash,TransactionGroup.Confirmed)) as AggregateTransaction;

  //パブリックアカウントの取得
  const orderTxInnerTxInfo = orderTxInfo.innerTransactions[0] as TransferTransaction; //0番目=販売者への注文情報送信用Tx, 1番目=管理者への支払い情報送信用Tx
  const momijiUserPublicAccount = await fetchPublicAccount(momijiBlockChain, orderTxInnerTxInfo.signer.address);
  const momijiSellerRawAddress = orderTxInnerTxInfo.recipientAddress.plain();
  const momijiSellerAddress = Address.createFromRawAddress(momijiSellerRawAddress);
  const momijiSellerPublicAccount = await fetchPublicAccount(momijiBlockChain, momijiSellerAddress); //UnresolvedAddressのため一旦Addressに変換してからPublicAccountを取得
  
  const paymentInfo = await parsePaymentTx(orderTxInfo, momijiAdminAccount, momijiUserPublicAccount);
  const mosaicId = paymentInfo.mosaicId;
  const amount = paymentInfo.amount;

  const sellerToUserTx = transferTransactionWithMosaic(
    momijiBlockChain,
    amount,
    new MosaicId(mosaicId),
    momijiUserPublicAccount.address
  );

  const userToSellerTx = transferTransactionWithMessage(
    momijiBlockChain,
    '受け取りました',
    momijiSellerPublicAccount.address,
  );

  const now = new Date();
  const createTimestamp = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

  const productInfo = await fetchProductInfo(new MosaicId(mosaicId));
  const productName = productInfo.productName;
  const price = productInfo.price;

  const exchangeOverview:ExchangeOverview = {
    orderTxHash: orderTxHash,
    productName: productName,
    amount: amount,
    price: price,
    depositAddress: productInfo.depositAddress,
    createTimestamp: createTimestamp,
  };

  const strExchangeOverview = JSON.stringify(exchangeOverview);
  
  const adminToAdminTx = transferTransactionWithMessage(
    momijiBlockChain,
    strExchangeOverview,
    momijiAdminAccount.address,
  );

  const momijiAggregateBondedTx = AggregateTransaction.createBonded(
    Deadline.create(momijiBlockChain.epochAdjustment),
    [
      sellerToUserTx.toAggregate(momijiSellerPublicAccount),
      userToSellerTx.toAggregate(momijiUserPublicAccount),
      adminToAdminTx.toAggregate(momijiAdminAccount.publicAccount),
    ],
    momijiBlockChain.networkType,
    [],
  ).setMaxFeeForAggregate(100, 2);

  return momijiAggregateBondedTx;
};
