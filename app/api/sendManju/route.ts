// POST Manjuの送付

import { NextResponse } from 'next/server'
import { Account, Address, TransactionStatus } from 'symbol-sdk';
import { setupBlockChain } from '../../domain/utils/setupBlockChain';
import { transferTransactionWithCurrency } from '../../domain/utils/transactions/transferTransactionWithCurrency';
import { firstValueFrom } from 'rxjs';
import { fetchTransactionStatus } from '../../domain/utils/fetchTransactionStatus';

export const POST = async (req: Request, res: NextResponse<string | null>) => {
  try {
    if (req.method !== 'POST') return NextResponse.json({ message: 'Bad Request' }, { status: 405 })

    const { targetRawAddress } : { targetRawAddress: string;  } = await req.json()

    const momijiBlockChain = await setupBlockChain("momiji");
    const momijiAdminPrivateKey = process.env.PRIVATE_KEY;
    const momijiAdminAccount = Account.createFromPrivateKey(momijiAdminPrivateKey, momijiBlockChain.networkType);
    const momijiTargetAddress = Address.createFromRawAddress(targetRawAddress);

    const transferTx = transferTransactionWithCurrency(momijiBlockChain, momijiTargetAddress);
    const momijiSignedTx = momijiAdminAccount.sign(transferTx, momijiBlockChain.generationHash);
    // Momijiネットワークへのアナウンス
    const momijiHash = momijiSignedTx.hash;
    await firstValueFrom(momijiBlockChain.txRepo.announce(momijiSignedTx));
  
    const result:TransactionStatus = await fetchTransactionStatus(momijiBlockChain, momijiHash, momijiAdminAccount.address.plain());
  
    return NextResponse.json({ data:result }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
