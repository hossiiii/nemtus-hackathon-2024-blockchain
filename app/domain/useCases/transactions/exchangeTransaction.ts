// 用途：管理者からの取引用トランザクションを作成する
import { Account, AggregateTransaction, Deadline, MosaicId, PublicAccount, TransactionGroup } from 'symbol-sdk';
import { setupBlockChain } from '../../utils/setupBlockChain';
import { firstValueFrom } from 'rxjs';
import { parsePaymentTx } from '../parse/parsePaymentTx';
import { transferTransactionWithMosaic } from '../../utils/transactions/transferTransactionWithMosaic';
import { transferTransactionWithMessage } from '../../utils/transactions/transferTransactionWithMessage';
import { fetchProductInfo } from '../fetches/fetchProductInfo';
import { ExchangeOverview } from '../../entities/exchangeHistoryInfo/exchangeOverview';

export const exchangeTransaction = async (
  momijiUserPublicAccount: PublicAccount,
  momijiSellerPublicAccount: PublicAccount,
  momijiAggregateTxHash: string,
): Promise<AggregateTransaction> => { //TODO: 返り値の型を修正
  const momijiBlockChain = await setupBlockChain('momiji');
  const momijiAdminAccount = Account.createFromPrivateKey(process.env.PRIVATE_KEY, momijiBlockChain.networkType);
  const momijiAggregateTxInfo = await firstValueFrom(momijiBlockChain.txRepo.getTransaction(momijiAggregateTxHash,TransactionGroup.Confirmed)) as AggregateTransaction;

  const paymentInfo = await parsePaymentTx(momijiAggregateTxInfo, momijiAdminAccount, momijiUserPublicAccount); //TODO 複合の仕方を要調査
  const mosaicId = paymentInfo.mosaicId;
  const amount = paymentInfo.amount;
  const secletLockTxHash = paymentInfo.secletLockTxHash;
  const secletLockTxSeclet = paymentInfo.secletLockTxSeclet;

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
    oerderPaymentTxHash: momijiAggregateTxHash,
    productName: productName,
    amount: amount,
    price: price,
    secletLockTxHash: secletLockTxHash,
    secletLockTxSeclet: secletLockTxSeclet,
    secletLockTxTargetAddress: productInfo.depositAddress,
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
