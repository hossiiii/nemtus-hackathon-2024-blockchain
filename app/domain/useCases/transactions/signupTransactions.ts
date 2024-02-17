// 用途：新規登録を行う
import {
  Account,
  AggregateTransaction,
  Deadline,
  PublicAccount,
  SecretLockTransaction,
} from 'symbol-sdk';
import { accountMetaDataTransaction } from '../../utils/transactions/accountMetaDataTransaction';

//オプションの引数としてsecretLockTxを受け取る（購入者が初めてアカウント登録をする場合は署名を1回にしたいため）
export const signupTransactions = async (symbolBlockChain:any, symbolTargetPublicAccount:PublicAccount, momijiStrSignerQR: string, key: string, secretLockTx?: SecretLockTransaction ): Promise<AggregateTransaction> => {

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
