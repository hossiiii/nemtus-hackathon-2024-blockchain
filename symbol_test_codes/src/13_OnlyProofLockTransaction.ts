//aliceからbobへの1通貨の送金をロックしてプルーフする

import { firstValueFrom } from 'rxjs';
import {
  Deadline,
  Account,
  RepositoryFactoryHttp,
  TransactionStatus,
  Mosaic,
  MosaicId,
  UInt64,
  Crypto,
  SecretLockTransaction,
  LockHashAlgorithm,
  SecretProofTransaction,
  Address,
} from 'symbol-sdk';
import { sha3_256 } from 'js-sha3';

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
  const epochAdjustment = await firstValueFrom(repo.getEpochAdjustment());
  const generationHash = await firstValueFrom(repo.getGenerationHash());
  const currencyMosaicId = service.getCurrencyMosaicId();
  const alice = Account.createFromPrivateKey(alicePrivateKey, networkType);
  const bob = Account.createFromPrivateKey(bobPrivateKey, networkType);

  const secret = '552c7746241aa7c3ea93f4162e930d41192ad547177b550fc8a5a431a1a25c6f';
  const proof = '63261be68ff2625b963c3c6116671738fb8e8074';

  const proofTx = SecretProofTransaction.create(
    Deadline.create(epochAdjustment),
    LockHashAlgorithm.Op_Sha3_256,
    secret,
    Address.createFromRawAddress("TB22KPDYEOWXK2BSSEC7MATPBPVX4SLDR5SMMDY"),
    proof,
    networkType!,
  ).setMaxFee(100);

  const singedProofTx = bob.sign(proofTx, generationHash);
  await firstValueFrom(txRepo.announce(singedProofTx));
  console.log('announce singedProofTx');

  await listener.open();
  return new Promise((resolve) => {
    // 未承認トランザクションの検知
    listener.unconfirmedAdded(alice.address, singedProofTx.hash).subscribe(async () => {
      clearTimeout(timerId);
      const transactionStatus: TransactionStatus = await firstValueFrom(
        tsRepo.getTransactionStatus(singedProofTx.hash),
      );
      console.log(transactionStatus);
      console.log(`${service.getExplorer()}/transactions/${singedProofTx.hash}`); //ブラウザで確認を追加
      listener.close();
    });

    //未承認トランザクションの検知ができなかった時の処理
    const timerId = setTimeout(async function () {
      console.log('confirmedTx');
      const transactionStatus: TransactionStatus = await firstValueFrom(
        tsRepo.getTransactionStatus(singedProofTx.hash),
      );
      console.log(transactionStatus);
      console.log(`${service.getExplorer()}/transactions/${singedProofTx.hash}`); //ブラウザで確認を追加
      listener.close();
    }, 1000); //タイマーを1秒に設定
  });
};

main().then();
