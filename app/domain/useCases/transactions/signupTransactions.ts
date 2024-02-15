// 用途：新規登録を行う
import {
  Account,
  AggregateTransaction,
  Deadline,
  PublicAccount,
  SecretLockTransaction,
} from 'symbol-sdk';
import { accountMetaDataTransaction } from '../../utils/transactions/accountMetaDataTransaction';
import { momijiAccountMetaDataKey } from '../../../consts/consts';
import { fetchTransactionStatus } from '../../utils/fetches/fetchTransactionStatus';
import { firstValueFrom } from 'rxjs';

//オプションの引数としてsecretLockTxを受け取る（購入者が初めてアカウント登録をする場合は署名を1回にしたいため）
export const signupTransactions = async (momijiBlockChain:any, symbolBlockChain:any, symbolTargetPublicAccount:PublicAccount, momijiNewAccount: Account, momijiStrSignerQR: string, key: string, secretLockTx?: SecretLockTransaction ): Promise<AggregateTransaction> => {

  const momijiAccountMetaDataTx = await accountMetaDataTransaction(momijiBlockChain, momijiAccountMetaDataKey, symbolTargetPublicAccount.publicKey, momijiNewAccount.address)

  const momijiAggregateTx = AggregateTransaction.createComplete(
    Deadline.create(momijiBlockChain.epochAdjustment),
    [
      momijiAccountMetaDataTx.toAggregate(momijiNewAccount.publicAccount) //TODO: 必要なければ削除
    ],
    momijiBlockChain.networkType,
    [],
  ).setMaxFeeForAggregate(100, 0); //連署者の数を指定
  
  const momijiSignedAggregateTx = momijiNewAccount.sign(momijiAggregateTx,momijiBlockChain.generationHash);
  const momijiSignedAggregateTxHash = momijiSignedAggregateTx.hash;
  const response = await firstValueFrom(momijiBlockChain.txRepo.announce(momijiSignedAggregateTx));
  console.log(response);

  await fetchTransactionStatus(
    momijiBlockChain,
    momijiSignedAggregateTxHash,
    momijiNewAccount.address,
  );

  // Symbolアカウントに対してパスフレーズで暗号化したアカウント情報をメタデータに記録するTxを作成
  const accountMetaDataTx = await accountMetaDataTransaction(
    symbolBlockChain,
    key,
    momijiStrSignerQR,
    symbolTargetPublicAccount.address
  );

  const aggregateArray = [accountMetaDataTx.toAggregate(symbolTargetPublicAccount)];

  // 引数にsecretLockTxが指定されていたらアグリゲートTxに追加
  if (secretLockTx) {
    aggregateArray.push(secretLockTx.toAggregate(symbolTargetPublicAccount));
  }

  // アグリゲートTxを作成
  const aggregateTx = AggregateTransaction.createComplete(
    Deadline.create(symbolBlockChain.epochAdjustment),
    aggregateArray,
    symbolBlockChain.networkType,
    [],
  ).setMaxFeeForAggregate(100, 0);

  return aggregateTx;
};
