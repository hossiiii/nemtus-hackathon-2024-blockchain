// 用途：商品登録を行う
import { Account, AggregateTransaction, Deadline, MosaicId, PublicAccount, TransactionGroup } from 'symbol-sdk';
import { setupBlockChain } from '../utils/setupBlockChain';
import { firstValueFrom } from 'rxjs';
import { parsePaymentTxInfo } from './parseAggTxInfo/parsePaymentTxInfo';
import { transferTransactionWithMosaic } from '../utils/transactions/transferTransactionWithMosaic';
import { transferTransactionWithMessage } from '../utils/transactions/transferTransactionWithMessage';

export const exchange = async (
  momijiUserPublicAccount: PublicAccount,
  momijiSellerPublicAccount: PublicAccount,
  momijiAggregateTxHash: string,
): Promise<AggregateTransaction> => { //TODO: 返り値の型を修正
  const momijiBlockChain = await setupBlockChain('momiji');
  const momijiAdminAccount = Account.createFromPrivateKey(process.env.PRIVATE_KEY, momijiBlockChain.networkType);
  const momijiAggregateTxInfo = await firstValueFrom(momijiBlockChain.txRepo.getTransaction(momijiAggregateTxHash,TransactionGroup.Confirmed)) as AggregateTransaction;
  const paymentInfo = await parsePaymentTxInfo(momijiAggregateTxInfo, momijiAdminAccount, momijiUserPublicAccount); //TODO 複合の仕方を要調査
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

  const adminToAdminTx = transferTransactionWithMessage(
    momijiBlockChain,
    momijiAggregateTxHash,
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
