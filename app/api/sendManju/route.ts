// POST Manjuの送付

import { NextResponse } from 'next/server';
import { Account, Address, MosaicId, TransactionStatus } from 'symbol-sdk';
import { setupBlockChain } from '../../domain/utils/setupBlockChain';
import { transferTransactionWithMosaic } from '../../domain/utils/transactions/transferTransactionWithMosaic';
import { firstValueFrom } from 'rxjs';
import { fetchTransactionStatus } from '../../domain/utils/fetches/fetchTransactionStatus';

export const POST = async (req: Request, res: NextResponse<string | null>) => {
  try {
    if (req.method !== 'POST')
      return NextResponse.json({ message: 'Bad Request' }, { status: 405 });

    const { targetRawAddress, amount }: { targetRawAddress: string; amount: number } =
      await req.json();

    const momijiBlockChain = await setupBlockChain('momiji');
    const momijiAdminPrivateKey = process.env.PRIVATE_KEY;
    const momijiAdminAccount = Account.createFromPrivateKey(
      momijiAdminPrivateKey,
      momijiBlockChain.networkType,
    );
    const momijiTargetAddress = Address.createFromRawAddress(targetRawAddress);

    const transferTx = transferTransactionWithMosaic(
      momijiBlockChain,
      amount*1000000,
      new MosaicId(momijiBlockChain.currencyMosaicId),
      momijiTargetAddress,
    );
    const momijiSignedTx = momijiAdminAccount.sign(transferTx, momijiBlockChain.generationHash);
    // Momijiネットワークへのアナウンス
    const momijiHash = momijiSignedTx.hash;
    await firstValueFrom(momijiBlockChain.txRepo.announce(momijiSignedTx));

    const result: TransactionStatus = await fetchTransactionStatus(
      momijiBlockChain,
      momijiHash,
      momijiAdminAccount.address,
    );

    return NextResponse.json({ data: result }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
};
