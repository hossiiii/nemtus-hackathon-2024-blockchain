// POST SAMPLE の実行

import { NextResponse } from 'next/server'
import { BlockChainType } from '../../domain/entities/blockChainType/blockChainType';
import { order } from '../../domain/useCases/order';
import { TransactionStatus } from 'symbol-sdk';

export const POST = async (req: Request, res: NextResponse<string | null>) => {
  try {
    if (req.method !== 'POST') return NextResponse.json({ message: 'Bad Request' }, { status: 405 })

    const { blockChainType, targetAddress, message } : { blockChainType: BlockChainType; targetAddress: string; message: string;  } = await req.json()

    console.log(blockChainType);
    console.log(message);
    console.log(targetAddress);

    const result:TransactionStatus = await order(blockChainType, process.env.PRIVATE_KEY!, targetAddress, message);

    return NextResponse.json({ data:result }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
