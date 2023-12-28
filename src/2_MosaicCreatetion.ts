//accountでモザイクを発行する

import { firstValueFrom } from 'rxjs';
import {
  Deadline,
  Account,
  TransactionService,
  RepositoryFactoryHttp,
  MosaicDefinitionTransaction,
  MosaicNonce,
  MosaicId,
  MosaicFlags,
  UInt64,
  MosaicSupplyChangeTransaction,
  MosaicSupplyChangeAction,
  AggregateTransaction,
} from 'symbol-sdk';

const property = require('./Property.ts');
const accountPrivateKey = property.accountPrivateKey;
const node = 'https://sym-test-03.opening-line.jp:3001';
const repoFactory = new RepositoryFactoryHttp(node);
const transactionHttp = repoFactory.createTransactionRepository();
const receiptHttp = repoFactory.createReceiptRepository();
const accountHttp = repoFactory.createAccountRepository();
const transactionService = new TransactionService(transactionHttp, receiptHttp);
const listener = repoFactory.createListener();

const main = async () => {
  const networkType = await firstValueFrom(repoFactory.getNetworkType());
  const epochAdjustment = await firstValueFrom(
    repoFactory.getEpochAdjustment()
  );
  const generationHash = await firstValueFrom(repoFactory.getGenerationHash());

  const account = Account.createFromPrivateKey(accountPrivateKey, networkType);

  const nonce = MosaicNonce.createRandom();

  const supplyMutable = false;
  const transferable = true;
  const restrictable = false;
  const revokable = false;

  const divibility = 2;
  const duration = UInt64.fromUint(0);

  const supply = UInt64.fromUint(1000000);

  const mosaicDefinitionTransaction = MosaicDefinitionTransaction.create(
    Deadline.create(epochAdjustment),
    nonce,
    MosaicId.createFromNonce(nonce, account.address),
    MosaicFlags.create(supplyMutable, transferable, restrictable, revokable),
    divibility,
    duration,
    networkType
  );

  const mosaicSupplyChangeTransaction = MosaicSupplyChangeTransaction.create(
    Deadline.create(epochAdjustment),
    mosaicDefinitionTransaction.mosaicId,
    MosaicSupplyChangeAction.Increase,
    supply,
    networkType
  );

  const aggregateTransaction = AggregateTransaction.createComplete(
    Deadline.create(epochAdjustment),
    [
      mosaicDefinitionTransaction.toAggregate(account.publicAccount),
      mosaicSupplyChangeTransaction.toAggregate(account.publicAccount),
    ],
    networkType,
    []
  ).setMaxFeeForAggregate(100, 1);

  const signedTransaction = account.sign(aggregateTransaction, generationHash);

  listener.open().then(() => {
    transactionService.announce(signedTransaction, listener).subscribe({
      next: async (x) => {
        console.log(x);

        //display mosaic id
        console.log(
          `以下のMosaicIDを別ファイルの”Property.ts”に入力して保存する
        `
        );
        const accountInfo = await firstValueFrom(
          accountHttp.getAccountInfo(account.address)
        );
        accountInfo!.mosaics.forEach(async (mosaic) => {
          if (mosaic.id.toHex() != '72C0212E67A08BCE')
            console.log(mosaic.id.toHex());
        });
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
