//aliceが起案者となりbob=>aliceへ受け取り完了のメッセージを送る取引を行う
//この時点ではaliceのみの署名のためトランザクションはロックされている状態

import { firstValueFrom } from 'rxjs';
import {
  TransferTransaction,
  Deadline,
  Address,
  EmptyMessage,
  Account,
  TransactionService,
  RepositoryFactoryHttp,
  NetworkCurrencies,
  PublicAccount,
  AggregateTransaction,
  HashLockTransaction,
  UInt64,
} from 'symbol-sdk';

const property = require('./Property.ts');
const initiatorKey = property.cosigner3Key;

const node = 'https://sym-test-03.opening-line.jp:3001';
const repo = new RepositoryFactoryHttp(node);
const txRepo = repo.createTransactionRepository();
const receiptHttp = repo.createReceiptRepository();
const accountHttp = repo.createAccountRepository();
const transactionService = new TransactionService(txRepo, receiptHttp);
const listener = repo.createListener();

const main = async () => {
  const networkType = await firstValueFrom(repo.getNetworkType());
  const epochAdjustment = await firstValueFrom(
    repo.getEpochAdjustment()
  );
  const generationHash = await firstValueFrom(repo.getGenerationHash());

  const initiatorAccount = Account.createFromPrivateKey(
    initiatorKey,
    networkType
  );

  const accountInfo = await accountHttp
    .getAccountInfo(Address.createFromRawAddress(property.cosigner1Address))
    .toPromise();

  const cosignerPublicAccount = PublicAccount.createFromPublicKey(
    accountInfo!.publicKey,
    networkType
  );

  const transferTransaction1 = TransferTransaction.create(
    Deadline.create(epochAdjustment),
    Address.createFromRawAddress(cosignerPublicAccount.address.plain()),
    [NetworkCurrencies.PUBLIC.currency.createRelative(5)],
    EmptyMessage,
    networkType
  );

  const transferTransaction2 = TransferTransaction.create(
    Deadline.create(epochAdjustment),
    Address.createFromRawAddress(initiatorAccount.address.plain()),
    [NetworkCurrencies.PUBLIC.currency.createRelative(1)],
    EmptyMessage,
    networkType
  );

  const aggregateTransaction = AggregateTransaction.createBonded(
    Deadline.create(epochAdjustment),
    [
      transferTransaction1.toAggregate(initiatorAccount.publicAccount),
      transferTransaction2.toAggregate(cosignerPublicAccount),
    ],
    networkType
  ).setMaxFeeForAggregate(100, 2);

  const signedTransaction = initiatorAccount.sign(
    aggregateTransaction,
    generationHash
  );

  const duration = UInt64.fromUint(2 * 60 * 24 * 2);

  const hashLockTransaction = HashLockTransaction.create(
    Deadline.create(epochAdjustment),
    NetworkCurrencies.PUBLIC.currency.createRelative(10),
    duration,
    signedTransaction,
    networkType
  ).setMaxFee(100);

  const signedHashlockTransaction = initiatorAccount.sign(
    hashLockTransaction,
    generationHash
  );

  listener.open().then(() => {
    transactionService
      .announceHashLockAggregateBonded(
        signedHashlockTransaction,
        signedTransaction,
        listener
      )
      .subscribe({
        next: (x) => {
          console.log(x);
          //display targetTxHash
          console.log(
            `以下のtargetTxHashを別ファイルの”Property.ts”に入力して保存する
          `
          );
          console.log(x.transactionInfo!.hash);
        },
        error: (err) => {
          console.error(err);
          listener.close();
        },
        complete: () => {
          listener.close();
        },
      });
  });
};

main().then();
