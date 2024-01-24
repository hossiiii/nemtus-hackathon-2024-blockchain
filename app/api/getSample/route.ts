// GET SAMPLE メタ情報の取得

import { NextResponse } from 'next/server'
import { 
  Account,
  KeyGenerator,
} from 'symbol-sdk';
import { firstValueFrom } from 'rxjs';
import { BlockChainType } from '../../domain/entities/blockChainType/blockChainType';
import { setupBlockChain } from '../../domain/utils/setupBlockChain';

export const GET = async (req: Request, res: NextResponse<string | null>) => {
  try {
    if (req.method !== 'GET') return NextResponse.json({ message: 'Bad Request' }, { status: 405 })

    const blockChainType: BlockChainType = new URLSearchParams(req.url).get("blockChainType") as BlockChainType;
    const keyword: string = new URLSearchParams(req.url).get("keyword");

    console.log(blockChainType)

    const blockChain = await setupBlockChain(blockChainType);
    const admin = Account.createFromPrivateKey(process.env.PRIVATE_KEY!, blockChain.networkType);

    const key = KeyGenerator.generateUInt64Key(keyword).toHex();
    const result = await firstValueFrom(blockChain.metaRepo.search({
      scopedMetadataKey: key,
      targetAddress:admin.address,
      sourceAddress:admin.address
    })); 
  
    console.log(result.data)
    console.log(JSON.stringify(await result.data))

    return NextResponse.json({ data:JSON.stringify(await result.data) }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
