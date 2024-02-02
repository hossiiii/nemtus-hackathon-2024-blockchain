// 用途：新規登録を行う
import {
  Account,
  AggregateTransaction,
  Deadline,
  MosaicId,
  PublicAccount,
  SecretLockTransaction,
} from 'symbol-sdk';
import { setupBlockChain } from '../utils/setupBlockChain';
import { encryptedAccount } from '../utils/accounts/encryptedAccount';
import { accountMetaDataTransaction } from '../utils/transactions/accountMetaDataTransaction';
import { symbolAccountMetaDataKey, initialManju, momijiAccountMetaDataKey } from '../../consts/consts';
import { fetchAccountMetaData } from '../utils/fetches/fetchAccountMetaData';
import { transferTransactionWithMosaic } from '../utils/transactions/transferTransactionWithMosaic';
import { fetchTransactionStatus } from '../utils/fetches/fetchTransactionStatus';
import { firstValueFrom } from 'rxjs';

//オプションの引数としてsecletLockTxを受け取る（購入者が初めてアカウント登録をする場合は署名を1回にしたいため）
export const signup = async (symbolTargetPublicAccount:PublicAccount, password: string, secletLockTx?: SecretLockTransaction ): Promise<AggregateTransaction> => {
  const momijiBlockChain = await setupBlockChain('momiji');
  const symbolBlockChain = await setupBlockChain('symbol');

  // 既に登録済みの場合は上書きになってしまうのでエラーを返す
  const res = await fetchAccountMetaData(symbolBlockChain, symbolAccountMetaDataKey, symbolTargetPublicAccount.address);
  if (res) {
    throw new Error('already registered momiji account');
  }
  // momijiのアカウントを作成
  const momijiNewAccount = Account.generateNewAccount(momijiBlockChain.networkType);
  const momijiStrSignerQR = encryptedAccount(momijiBlockChain, momijiNewAccount, password);

  // momijiにmanjuを送金しメタデータにSymbolアカウントの公開鍵を記録するTxを作成
  const momijiAdminAccount = Account.createFromPrivateKey(
    process.env.PRIVATE_KEY,
    momijiBlockChain.networkType,
  );
  const momijiTransferTx = transferTransactionWithMosaic(momijiBlockChain,initialManju*1000000,new MosaicId(momijiBlockChain.currencyMosaicId), momijiNewAccount.address);
  const momijiAccountMetaDataTx = await accountMetaDataTransaction(momijiBlockChain, momijiAccountMetaDataKey, symbolTargetPublicAccount.publicKey, momijiNewAccount.address)

  const momijiAggregateTx = AggregateTransaction.createComplete(
    Deadline.create(momijiBlockChain.epochAdjustment),
    [
      momijiTransferTx.toAggregate(momijiAdminAccount.publicAccount),
      momijiAccountMetaDataTx.toAggregate(momijiNewAccount.publicAccount) //TODO: 必要なければ削除
    ],
    momijiBlockChain.networkType,
    [],
  ).setMaxFeeForAggregate(100, 1); //連署者の数を指定
  
  const momijiSignedAggregateTx = momijiAdminAccount.signTransactionWithCosignatories(momijiAggregateTx,[momijiNewAccount],momijiBlockChain.generationHash);
  const momijiSignedAggregateTxHash = momijiSignedAggregateTx.hash;
  const response = await firstValueFrom(momijiBlockChain.txRepo.announce(momijiSignedAggregateTx));
  console.log(response);

  await fetchTransactionStatus(
    momijiBlockChain,
    momijiSignedAggregateTxHash,
    momijiAdminAccount.address,
  );

  // Symbolアカウントに対してパスフレーズで暗号化したアカウント情報をメタデータに記録するTxを作成
  const accountMetaDataTx = await accountMetaDataTransaction(
    symbolBlockChain,
    symbolAccountMetaDataKey,
    momijiStrSignerQR,
    symbolTargetPublicAccount.address
  );

  const aggregateArray = [accountMetaDataTx.toAggregate(symbolTargetPublicAccount)];

  // 引数にsecletLockTxが指定されていたらアグリゲートTxに追加
  if (secletLockTx) {
    aggregateArray.push(secletLockTx.toAggregate(symbolTargetPublicAccount));
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
