//aliceからbobへ1通貨を送金する

import { firstValueFrom } from 'rxjs';
import {
  TransferTransaction,
  Deadline,
  Address,
  EmptyMessage,
  Account,
  RepositoryFactoryHttp,
  TransactionStatus,
  Mosaic,
  MosaicId,
  UInt64
} from 'symbol-sdk';

import { MomijiService, SymbolService } from './BlockchainService';

const property = require('./Property.ts');
const symbolService = new SymbolService(property);
const momijiService = new MomijiService(property);

// Symbolを使用する場合
let service = symbolService;

// Momijiを使用する場合
// let service = momijiService;

const alicePrivateKey = service.getAlicePrivateKey();
const targetAddress = service.getBobAddress();
const node = service.getNode();
const repo = new RepositoryFactoryHttp(node);
const txRepo = repo.createTransactionRepository();
const tsRepo = repo.createTransactionStatusRepository();
const listener = repo.createListener();

const main = async () => {
  const networkType = await firstValueFrom(repo.getNetworkType());
  const epochAdjustment = await firstValueFrom(
    repo.getEpochAdjustment()
  );
  const generationHash = await firstValueFrom(repo.getGenerationHash());
  const currencyMosaicId = service.getCurrencyMosaicId();
  const alice = Account.createFromPrivateKey(alicePrivateKey, networkType);

  const transferTransaction = TransferTransaction.create(
    Deadline.create(epochAdjustment),
    Address.createFromRawAddress(targetAddress),
    [new Mosaic(new MosaicId(currencyMosaicId), UInt64.fromUint(1000000))], //回収モザイクIDと数量
    EmptyMessage,
    networkType
  ).setMaxFee(100);

  const signedTransaction = alice.sign(transferTransaction, generationHash);
  const hash = signedTransaction.hash;
  await firstValueFrom(txRepo.announce(signedTransaction));
  await listener.open();
  return new Promise((resolve) => {
    // 未承認トランザクションの検知
    listener.unconfirmedAdded(alice.address, hash).subscribe(async (unconfirmedTx) => {
      clearTimeout(timerId);
      const transactionStatus:TransactionStatus = await firstValueFrom(tsRepo.getTransactionStatus(hash));
      console.log(transactionStatus);
      console.log(`${service.getExplorer()}/transactions/${hash}`) //ブラウザで確認を追加        
      listener.close();
    });

    //未承認トランザクションの検知ができなかった時の処理
    const timerId = setTimeout(async function () {
      console.log("confirmedTx");
      const transactionStatus:TransactionStatus = await firstValueFrom(tsRepo.getTransactionStatus(hash));
      console.log(transactionStatus);
      console.log(`${service.getExplorer()}/transactions/${hash}`) //ブラウザで確認を追加        
      listener.close();
    }, 1000); //タイマーを1秒に設定
  });
};

main().then();