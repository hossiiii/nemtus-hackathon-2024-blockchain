//aliceが起案者となりbob=>aliceへ受け取り完了のメッセージを送る取引を行う
//この時点ではaliceのみの署名のためトランザクションはロックされている状態

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
  UInt64,
  PlainMessage,
  AggregateTransaction,
  HashLockTransaction
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
const bobPrivateKey = service.getBobPrivateKey();
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
  const bob = Account.createFromPrivateKey(bobPrivateKey, networkType);

  const tx1 = TransferTransaction.create(
    Deadline.create(epochAdjustment),
    bob.address,
    [],
    PlainMessage.create("dummy"), //起案者はダミーでもTxが必要
    networkType
  );

  const tx2 = TransferTransaction.create(
    Deadline.create(epochAdjustment),
    alice.address,
    [],
    PlainMessage.create("発送しました"),
    networkType
  );

  const aggregateArray = [
    tx1.toAggregate(alice.publicAccount), //Aliceからの送信
    tx2.toAggregate(bob.publicAccount), // Bobからの送信
  ];

  //アグリゲートボンデッドトランザクション
  const aggregateTx = AggregateTransaction.createBonded(
    Deadline.create(epochAdjustment),
    aggregateArray,
    networkType,
    []
  ).setMaxFeeForAggregate(100, 1);

  const signedAggregateTx = alice.sign(aggregateTx, generationHash);

  const hashLockTx = HashLockTransaction.create(
    Deadline.create(epochAdjustment),
    new Mosaic(new MosaicId(currencyMosaicId), UInt64.fromUint(10000000)),
    UInt64.fromUint(480),
    signedAggregateTx,
    networkType
  ).setMaxFee(100);

  const signedLockTx = alice.sign(hashLockTx, generationHash);

  await firstValueFrom(txRepo.announce(signedLockTx));
  console.log("announce signedLockTx");

  await listener.open();
  await new Promise((resolve) => {
    // 承認トランザクションの検知
    listener.confirmed(alice.address, signedLockTx.hash).subscribe(async (confirmedTx) => {
      setTimeout(async()=>{
        const transactionStatus:TransactionStatus = await firstValueFrom(tsRepo.getTransactionStatus(signedLockTx.hash));
        console.log(transactionStatus);
        console.log(`${service.getExplorer()}/transactions/${signedLockTx.hash}`) //ブラウザで確認を追加        
        listener.close();
        resolve(null); // Promiseを解決  
      }, 5000); //全てのノードに伝播されるまで5秒待つ
    });
  });

  await firstValueFrom(txRepo.announceAggregateBonded(signedAggregateTx));
  console.log("announce signedAggregateTx");

  await listener.open();
  return new Promise((resolve) => {
    //パーシャルトランザクションの検知
    setTimeout(async function () {
      console.log("partialTx");
      const transactionStatus:TransactionStatus = await firstValueFrom(tsRepo.getTransactionStatus(signedAggregateTx.hash));
      console.log(transactionStatus);
      console.log(`${service.getExplorer()}/transactions/${signedAggregateTx.hash}`) //ブラウザで確認を追加        
      listener.close();
      resolve(null); // Promiseを解決
    }, 1000); //タイマーを1秒に設定
  });

};

main().then();