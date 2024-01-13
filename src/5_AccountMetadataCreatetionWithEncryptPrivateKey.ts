//Symbolのaliceアカウントにパスフレーズで暗号化したMomojiのPrivateKeyをメタデータとして設定する

import { firstValueFrom } from 'rxjs';
import {
  Deadline,
  Account,
  RepositoryFactoryHttp,
  UInt64,
  AggregateTransaction,
  TransactionStatus,
  KeyGenerator,
  MetadataTransactionService,
} from 'symbol-sdk';

import { MomijiService, SymbolService } from './BlockchainService';

const qr = require("symbol-qr-library");

const property = require('./Property.ts');
const symbolService = new SymbolService(property);
const momijiService = new MomijiService(property);

// Symbol上のメタデータには暗号化された秘密鍵を設定する
const alicePrivateKey = symbolService.getAlicePrivateKey();
const node = symbolService.getNode();
const repo = new RepositoryFactoryHttp(node);
const txRepo = repo.createTransactionRepository();
const tsRepo = repo.createTransactionStatusRepository();
const metaRepo = repo.createMetadataRepository();
const metaService = new MetadataTransactionService(metaRepo);

const listener = repo.createListener();

const main = async () => {
  const networkType = await firstValueFrom(repo.getNetworkType());
  const epochAdjustment = await firstValueFrom(
    repo.getEpochAdjustment()
  );
  const generationHash = await firstValueFrom(repo.getGenerationHash());

  // Momijiアカウントの秘密鍵を暗号化
  const aliceMomijiPrivateKey = momijiService.getAlicePrivateKey();
  const password = "abc12345";

  //パスフレーズでロックされたアカウント生成
  const signerQR = qr.QRCodeGenerator.createExportAccount(
    aliceMomijiPrivateKey, networkType, generationHash, password
  );

  //アカウントを暗号化したJSONデータとして表示
  const jsonSignerQR = signerQR.toJSON();
  //JSONデータを文字列に変換
  const strSignerQR = JSON.stringify(jsonSignerQR);

  const alice = Account.createFromPrivateKey(alicePrivateKey, networkType);

  const key = KeyGenerator.generateUInt64Key("momoji_account");
  const value = strSignerQR; //実際にはsaltはサーバー側に保管しておいた方が良い？
  
  const accountMetadataTransaction = await firstValueFrom(metaService.createAccountMetadataTransaction(
    Deadline.create(epochAdjustment),
    networkType,
    alice.address,
    key,value,
    alice.address,
    UInt64.fromUint(0)
  ));

  const aggregateTransaction = AggregateTransaction.createComplete(
    Deadline.create(epochAdjustment),
    [accountMetadataTransaction.toAggregate(alice.publicAccount)],
    networkType,[]
  ).setMaxFeeForAggregate(100, 0)

  const signedTransaction = alice.sign(aggregateTransaction, generationHash);

  const hash = signedTransaction.hash;
  await firstValueFrom(txRepo.announce(signedTransaction));
  await listener.open();
  return new Promise((resolve) => {
    // 未承認トランザクションの検知
    listener.unconfirmedAdded(alice.address, hash).subscribe(async (unconfirmedTx) => {
      clearTimeout(timerId);
      const transactionStatus:TransactionStatus = await firstValueFrom(tsRepo.getTransactionStatus(hash));
      console.log(transactionStatus);
      console.log(`${symbolService.getExplorer()}/transactions/${hash}`) //ブラウザで確認を追加        
      listener.close();
    });

    //未承認トランザクションの検知ができなかった時の処理
    const timerId = setTimeout(async function () {
      console.log("confirmedTx");
      const transactionStatus:TransactionStatus = await firstValueFrom(tsRepo.getTransactionStatus(hash));
      console.log(transactionStatus);
      console.log(`${symbolService.getExplorer()}/transactions/${hash}`) //ブラウザで確認を追加        
      listener.close();
    }, 1000); //タイマーを1秒に設定
  });
};

main().then();