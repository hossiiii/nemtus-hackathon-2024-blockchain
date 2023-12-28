//aliceからbobへ20XYMを送金する

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
  TransactionStatus
} from 'symbol-sdk';

const property = require('./Property.ts');
const aliceSymbolPrivateKey = property.aliceSymbolPrivateKey;
const targetAddress = property.bobSymbolAddress;
const node = 'https://sym-test-03.opening-line.jp:3001';
const repoFactory = new RepositoryFactoryHttp(node);
const transactionHttp = repoFactory.createTransactionRepository();
const transactionStatusHttp = repoFactory.createTransactionStatusRepository();
const receiptHttp = repoFactory.createReceiptRepository();
const transactionService = new TransactionService(transactionHttp, receiptHttp);
const listener = repoFactory.createListener();

const main = async () => {
  const networkType = await firstValueFrom(repoFactory.getNetworkType());
  const epochAdjustment = await firstValueFrom(
    repoFactory.getEpochAdjustment()
  );
  const generationHash = await firstValueFrom(repoFactory.getGenerationHash());

  const aliceSymbol = Account.createFromPrivateKey(aliceSymbolPrivateKey, networkType);

  const transferTransaction = TransferTransaction.create(
    Deadline.create(epochAdjustment),
    Address.createFromRawAddress(targetAddress),
    [NetworkCurrencies.PUBLIC.currency.createRelative(20)],
    EmptyMessage,
    networkType
  ).setMaxFee(100);

  const signedTransaction = aliceSymbol.sign(transferTransaction, generationHash);
  const hash = signedTransaction.hash;
  await firstValueFrom(transactionHttp.announce(signedTransaction));
  await listener.open();
  return new Promise((resolve) => {
    // 未承認トランザクションの検知
      listener.unconfirmedAdded(aliceSymbol.address, hash).subscribe(async (unconfirmedTx) => {
        clearTimeout(timerId);
        const transactionStatus:TransactionStatus = await firstValueFrom(transactionStatusHttp.getTransactionStatus(hash));
        console.log(transactionStatus);
        console.log(`https://testnet.symbol.fyi/transactions/${hash}`) //ブラウザで確認を追加        
        listener.close();
      });

      //未承認トランザクションの検知ができなかった時の処理
      const timerId = setTimeout(async function () {
        console.log("confirmedTx");
        const transactionStatus:TransactionStatus = await firstValueFrom(transactionStatusHttp.getTransactionStatus(hash));
        console.log(transactionStatus);
        console.log(`https://testnet.symbol.fyi/transactions/${hash}`) //ブラウザで確認を追加        
        listener.close();
      }, 1000); //タイマーを1秒に設定
  });
};

main().then();