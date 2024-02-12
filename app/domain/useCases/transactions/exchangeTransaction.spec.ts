import fetch from 'node-fetch';
global.fetch = fetch;

import { Account, AggregateTransaction, Deadline, HashLockTransaction, Mosaic, MosaicId, PublicAccount, TransactionStatus, UInt64 } from 'symbol-sdk';
import { setupBlockChain } from '../../utils/setupBlockChain';
import { firstValueFrom } from 'rxjs';
import { fetchTransactionStatus } from '../../utils/fetches/fetchTransactionStatus';
import { exchangeTransaction } from './exchangeTransaction';

describe('exchangeTransaction', () => {
  it('should return a new Transactions', async () => {
    const momijiBlockChain = await setupBlockChain('momiji');
    const momijiUserPublicAccount = PublicAccount.createFromPublicKey("F31000EF5A6469036322C8404CEAC955D82C831D4A5EEDCD66A0851835F2931B", momijiBlockChain.networkType);
    const momijiSellerPublicAccount = PublicAccount.createFromPublicKey("3694F6FD26D3E787B1E527C2ABAD1A15E32F56C82ADBEB1A3BB2B25EB663D8E9", momijiBlockChain.networkType);
    const momijiAggregateTxHash = "0B436B10199D53276565E5BB71AF1E02A9928DAC9BD0006EFFEC41F45F0980E8";
    const result = await exchangeTransaction(momijiUserPublicAccount, momijiSellerPublicAccount, momijiAggregateTxHash);
    expect(result).toBeInstanceOf(AggregateTransaction);
  }, 10000); // 10 seconds

  it('exchangeTransaction role play', async () => {
    const momijiBlockChain = await setupBlockChain('momiji');
    const momijiUserPublicAccount = PublicAccount.createFromPublicKey("F31000EF5A6469036322C8404CEAC955D82C831D4A5EEDCD66A0851835F2931B", momijiBlockChain.networkType);
    const momijiSellerPublicAccount = PublicAccount.createFromPublicKey("3694F6FD26D3E787B1E527C2ABAD1A15E32F56C82ADBEB1A3BB2B25EB663D8E9", momijiBlockChain.networkType);
    const momijiAggregateTxHash = "0B436B10199D53276565E5BB71AF1E02A9928DAC9BD0006EFFEC41F45F0980E8";
    const momijiAggregateBondedTx = await exchangeTransaction(momijiUserPublicAccount, momijiSellerPublicAccount, momijiAggregateTxHash);

    const momijiAdminAccount = Account.createFromPrivateKey(process.env.PRIVATE_KEY, momijiBlockChain.networkType);

    //亜グリゲートボンデッドトランザクションの署名
    const momijiSignedAggregateBondedTx = momijiAdminAccount.sign(momijiAggregateBondedTx, momijiBlockChain.generationHash);
    const momijiSignedAggregateBondedTxHash = momijiSignedAggregateBondedTx.hash;

    //ハッシュロックトランザクションの作成
    const momijiHashLockTx = HashLockTransaction.create(
      Deadline.create(momijiBlockChain.epochAdjustment),
      new Mosaic(new MosaicId(momijiBlockChain.currencyMosaicId), UInt64.fromUint(10000000)),
      UInt64.fromUint(480),
      momijiSignedAggregateBondedTx,
      momijiBlockChain.networkType,
    ).setMaxFee(100);
  
    const momijiSignedHashLockTx = momijiAdminAccount.sign(momijiHashLockTx, momijiBlockChain.generationHash);
    const momijiSignedHashLockTxHash = momijiSignedHashLockTx.hash;
  
    await firstValueFrom(momijiBlockChain.txRepo.announce(momijiSignedHashLockTx));

    await fetchTransactionStatus(
      momijiBlockChain,
      momijiSignedHashLockTxHash,
      momijiAdminAccount.address,
    );

    await new Promise(resolve => setTimeout(resolve, 5000)); // 全ノードに伝播するまで5秒待機

    await firstValueFrom(momijiBlockChain.txRepo.announceAggregateBonded(momijiSignedAggregateBondedTx));

    const res2 = await fetchTransactionStatus(
      momijiBlockChain,
      momijiSignedAggregateBondedTxHash,
      momijiAdminAccount.address,
    );

    expect(res2).toBeInstanceOf(TransactionStatus);
    expect(res2.code).toEqual('Success');
    expect(res2.group).toEqual('partial');  
  
  }, 120000); // 120 seconds
});
