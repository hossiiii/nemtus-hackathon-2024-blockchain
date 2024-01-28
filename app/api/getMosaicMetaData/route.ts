// GET SAMPLE メタ情報の取得
import { parse } from 'url';
import { NextResponse } from 'next/server';
import { setupBlockChain } from '../../domain/utils/setupBlockChain';
import { MosaicId } from 'symbol-sdk';
import { fetchMosaicMetaData } from '../../domain/utils/fetches/fetchMosaicMetaData';

export const GET = async (req: Request, res: NextResponse<string | null>) => {
  try {
    if (req.method !== 'GET') return NextResponse.json({ message: 'Bad Request' }, { status: 405 });

    const { query } = parse(req.url, true);
    const mosaicIdHex: string = query.mosaicIdHex as string;
    const targetMosaicId = new MosaicId(mosaicIdHex)

    const momijiBlockChain = await setupBlockChain('momiji');

    const key = 'productInfo';
    const productInfoStr:string = await fetchMosaicMetaData(momijiBlockChain, key, targetMosaicId);
    const productInfo = JSON.parse(productInfoStr);

    return NextResponse.json({ data: productInfo }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
};
