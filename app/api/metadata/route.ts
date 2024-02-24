// POST 交換用アグリゲートトランザクションの署名とアナウンス

import { NextResponse } from 'next/server';
import { Account, AccountMetadataTransaction, AggregateTransaction, Deadline, KeyGenerator, TransactionStatus, UInt64 } from 'symbol-sdk';
import { setupBlockChain } from '../../domain/utils/setupBlockChain';
import { firstValueFrom } from 'rxjs';
import { fetchTransactionStatus } from '../../domain/utils/fetches/fetchTransactionStatus';

export const POST = async (req: Request, res: NextResponse<string | null>) => {
  try {
    if (req.method !== 'POST')
      return NextResponse.json({ message: 'Bad Request' }, { status: 405 });

    const { privateKey }: { privateKey: string} = await req.json();

    const momijiBlockChain = await setupBlockChain('momiji');
    const target = Account.createFromPrivateKey(privateKey, momijiBlockChain.networkType);

    const momijiAdminPrivateKey = process.env.PRIVATE_KEY;
    const momijiAdminAccount = Account.createFromPrivateKey(
      momijiAdminPrivateKey,
      momijiBlockChain.networkType,
    );
    const key = process.env.APP_NAME;
    const value = "momiji";

    const uint64key = KeyGenerator.generateUInt64Key(key);
    const accountMetaDataTransaction: AccountMetadataTransaction = AccountMetadataTransaction.create(
      Deadline.create(momijiBlockChain.epochAdjustment),
      target.address,
      uint64key,
      value.length,
      Uint8Array.from(Buffer.from(value)),
      momijiBlockChain.networkType,
    );

    const aggregateTransaction = AggregateTransaction.createComplete(
        Deadline.create(momijiBlockChain.epochAdjustment),
        [
          accountMetaDataTransaction.toAggregate(momijiAdminAccount.publicAccount),
        ],
        momijiBlockChain.networkType,
        [],
    ).setMaxFeeForAggregate(100, 2);;

    const signedTransaction = target.signTransactionWithCosignatories(
        aggregateTransaction,
        [momijiAdminAccount],
        momijiBlockChain.generationHash,
    );

    await firstValueFrom(momijiBlockChain.txRepo.announce(signedTransaction));
    const signedTransactionHash = signedTransaction.hash

    console.log(signedTransactionHash);

    const result: TransactionStatus = await fetchTransactionStatus(
      momijiBlockChain,
      signedTransactionHash,
      target.address,
    );

    console.log(result);

    return NextResponse.json({ data: result }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
};
