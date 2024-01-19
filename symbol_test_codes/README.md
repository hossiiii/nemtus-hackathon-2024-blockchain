# nemtus-hackathon-2024-blockchain
ネムタスハッカソン2024のブロックチェーン部分の検証用

```
//====アクセスURL
http://66.94.121.126:3000/node/health


//====ここからF12コンソール
//====流し込み①
(script = document.createElement("script")).src =
 "https://xembook.github.io/nem2-browserify/symbol-sdk-pack-2.0.3.js";
document.getElementsByTagName("head")[0].appendChild(script);

//====流し込み②
NODE = window.origin; //現在開いているページのURLがここに入ります
sym = require("/node_modules/symbol-sdk");
repo = new sym.RepositoryFactoryHttp(NODE);
txRepo = repo.createTransactionRepository();
(async () => {
 networkType = 152;
 generationHash = "C8445F18765E3CB341113C022081D50423F2C174A620C3C22C918B673920A69B";
 epochAdjustment = 1703577141;
})();
function clog(signedTx) {
 console.log(NODE + "/transactionStatus/" + signedTx.hash);
 console.log(NODE + "/transactions/confirmed/" + signedTx.hash);
 console.log("https://symbol.fyi/transactions/" + signedTx.hash);
 console.log("https://testnet.symbol.fyi/transactions/" + signedTx.hash);
}
//====アカウント
alice = sym.Account.generateNewAccount(networkType);
console.log(alice.address.address);
bob = sym.Account.generateNewAccount(networkType);
console.log(bob.address.address);

//====入金
console.log("http://66.94.121.126:100")

//====アグボン
tx1 = sym.TransferTransaction.create(
  undefined,
  bob.address, //Bobへの送信
  [ //momiji.manju
   new sym.Mosaic(
    new sym.NamespaceId("momiji.manju"),
    sym.UInt64.fromUint(1000000)
   )
  ],
  sym.EmptyMessage, //メッセージ無し
  networkType
);
tx2 = sym.TransferTransaction.create(
  undefined,
  alice.address, // Aliceへの送信
  [],
  sym.PlainMessage.create('thank you!'), //メッセージ
  networkType
);
aggregateArray = [
  tx1.toAggregate(alice.publicAccount), //Aliceからの送信
  tx2.toAggregate(bob.publicAccount), // Bobからの送信
]
//アグリゲートボンデッドトランザクション
aggregateTx = sym.AggregateTransaction.createBonded(
  sym.Deadline.create(epochAdjustment),
  aggregateArray,
  networkType,
  [],
).setMaxFeeForAggregate(100, 1);
//署名
signedAggregateTx = alice.sign(aggregateTx, generationHash);
//ハッシュロックTX作成
hashLockTx = sym.HashLockTransaction.create(
 sym.Deadline.create(epochAdjustment),
  new sym.Mosaic(new sym.NamespaceId("momiji.manju"),sym.UInt64.fromUint(10 * 1000000)), //10xym固定値
  sym.UInt64.fromUint(480), // ロック有効期限
  signedAggregateTx,// このハッシュ値を登録
  networkType
).setMaxFee(100);
//署名
signedLockTx = alice.sign(hashLockTx, generationHash);
//ハッシュロックTXをアナウンス
await txRepo.announce(signedLockTx).toPromise();

//========================================================================
hash = signedLockTx.hash;
tsRepo = repo.createTransactionStatusRepository();
transactionStatus = await tsRepo.getTransactionStatus(hash).toPromise();
console.log(transactionStatus);
txInfo = await txRepo.getTransaction(hash,sym.TransactionGroup.Confirmed).toPromise();
console.log(txInfo);
console.log(`http://66.94.121.126:90/transactions/${hash}`) //ブラウザで確認を追加


//===========================ハッシュロック承認後==============================
//====流し込み③
await txRepo.announceAggregateBonded(signedAggregateTx).toPromise();
signedAggregateTx.hash

//========================================================================
hash = signedAggregateTx.hash;
tsRepo = repo.createTransactionStatusRepository();
transactionStatus = await tsRepo.getTransactionStatus(hash).toPromise();
console.log(transactionStatus);
txInfo = await txRepo.getTransaction(hash,sym.TransactionGroup.Confirmed).toPromise();
console.log(txInfo);
console.log(`http://66.94.121.126:90/transactions/${hash}`) //ブラウザで確認を追加
```
