// POST 交換用アグリゲートトランザクションの署名とアナウンス

import { NextResponse } from 'next/server';
import { Account, Deadline, HashLockTransaction, Mosaic, MosaicId, TransactionStatus, UInt64 } from 'symbol-sdk';
import { setupBlockChain } from '../../domain/utils/setupBlockChain';
import { firstValueFrom } from 'rxjs';
import { fetchTransactionStatus } from '../../domain/utils/fetches/fetchTransactionStatus';
import { exchangeTransaction } from '../../domain/useCases/transactions/exchangeTransaction';
import { hashLockHour, vercelTimeout } from '../../consts/consts';
export const maxDuration = vercelTimeout; // This function can run for a maximum of 120 seconds

export const POST = async (req: Request, res: NextResponse<string | null>) => {
  try {
    if (req.method !== 'POST')
      return NextResponse.json({ message: 'Bad Request' }, { status: 405 });

    const { orderTxHash }: { orderTxHash: string} = await req.json();

    const momijiBlockChain = await setupBlockChain('momiji');
    const momijiAdminPrivateKey = process.env.PRIVATE_KEY;
    const momijiAdminAccount = Account.createFromPrivateKey(
      momijiAdminPrivateKey,
      momijiBlockChain.networkType,
    );
    const momijiAggregateBondedTx = await exchangeTransaction(momijiBlockChain, orderTxHash);

    //アグリゲートボンデッドトランザクションの署名
    const momijiSignedAggregateBondedTx = momijiAdminAccount.sign(momijiAggregateBondedTx, momijiBlockChain.generationHash);
    const momijiSignedAggregateBondedTxHash = momijiSignedAggregateBondedTx.hash;

    //ハッシュロックトランザクションの作成
    const momijiHashLockTx = HashLockTransaction.create(
      Deadline.create(momijiBlockChain.epochAdjustment,hashLockHour),
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

    await new Promise(resolve => setTimeout(resolve, 1000)); // 全ノードに伝播するまで1秒待機(momijiは２台だけなので)

    await firstValueFrom(momijiBlockChain.txRepo.announceAggregateBonded(momijiSignedAggregateBondedTx));

    const result: TransactionStatus = await fetchTransactionStatus( //ここはパーシャルの検知なのでfetchTransactionStatusが必要
      momijiBlockChain,
      momijiSignedAggregateBondedTxHash,
      momijiAdminAccount.address,
    );

    return NextResponse.json({ data: result }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
};
