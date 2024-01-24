// POST SAMPLE メッセージ及び１通貨の送付

import { NextResponse } from 'next/server'
import { 
  Account,
  TransferTransaction,
  Deadline,
  Address,
  Mosaic,
  MosaicId,
  UInt64,
  PlainMessage
} from 'symbol-sdk';
import { firstValueFrom } from 'rxjs';
import { BlockChainType } from '../../domain/entities/blockChainType/blockChainType';
import { setupBlockChain } from '../../domain/utils/setupBlockChain';
import { checkTransactionStatus } from '../../domain/utils/checkTransactionStatus';

export const POST = async (req: Request, res: NextResponse<string | null>) => {
  try {
    if (req.method !== 'POST') return NextResponse.json({ message: 'Bad Request' }, { status: 405 })

    const { targetAddress, message, blockChainType } : { targetAddress: string; message: string; blockChainType: BlockChainType; } = await req.json()

    console.log(message);
    console.log(targetAddress);
    console.log(blockChainType);

    const blockChain = await setupBlockChain(blockChainType);

    const admin = Account.createFromPrivateKey(process.env.PRIVATE_KEY!, blockChain.networkType);

    const transferTransaction = TransferTransaction.create(
      Deadline.create(blockChain.epochAdjustment),
      Address.createFromRawAddress(targetAddress),
      [new Mosaic(new MosaicId(blockChain.currencyMosaicId), UInt64.fromUint(1000000))], //回収モザイクIDと数量
      PlainMessage.create(message),
      blockChain.networkType
    ).setMaxFee(100);
  
    const signedTransaction = admin.sign(transferTransaction, blockChain.generationHash);
    const hash = signedTransaction.hash;
    await firstValueFrom(blockChain.txRepo.announce(signedTransaction));
    console.log(admin.address.plain())

    const result = await checkTransactionStatus(blockChain, hash, admin.address.plain());

    console.log(result)
    console.log(JSON.stringify(await result))

    return NextResponse.json({ data:JSON.stringify(await result) }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
