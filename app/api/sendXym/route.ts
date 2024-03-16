// POST Xymの送付

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

    const { targetRawAddress, amount }: { targetRawAddress: string; amount: number } = await req.json();

    const symbolBlockChain = await setupBlockChain('symbol');
    const symbolAdminPrivateKey = process.env.PRIVATE_KEY;
    const symbolAdminAccount = Account.createFromPrivateKey(
      symbolAdminPrivateKey,
      symbolBlockChain.networkType,
    );
    const symbolTargetAddress = Address.createFromRawAddress(targetRawAddress);

    const transferTx = transferTransactionWithMosaic(
      symbolBlockChain,
      amount*1000000,
      new MosaicId(symbolBlockChain.currencyMosaicId),
      symbolTargetAddress,
    );
    const symbolSignedTx = symbolAdminAccount.sign(transferTx, symbolBlockChain.generationHash);
    // Symbolネットワークへのアナウンス
    const symbolHash = symbolSignedTx.hash;
    await firstValueFrom(symbolBlockChain.txRepo.announce(symbolSignedTx));

    const result: TransactionStatus = await fetchTransactionStatus(
      symbolBlockChain,
      symbolHash,
      symbolAdminAccount.address,
    );

    return NextResponse.json({ data: result }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
};
