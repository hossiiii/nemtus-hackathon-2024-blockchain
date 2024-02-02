// GET SAMPLE メタ情報の取得
import { parse } from 'url';
import { NextResponse } from 'next/server';
import { setupBlockChain } from '../../domain/utils/setupBlockChain';
import { fetchAccountMetaData } from '../../domain/utils/fetches/fetchAccountMetaData';
import { decryptedAccount } from '../../domain/utils/accounts/decryptedAccount';
import { Address } from 'symbol-sdk';
import { symbolAccountMetaDataKey } from '../../consts/consts';

export const GET = async (req: Request, res: NextResponse<string | null>) => {
  try {
    if (req.method !== 'GET') return NextResponse.json({ message: 'Bad Request' }, { status: 405 });

    const { query } = parse(req.url, true);
    const password: string = query.password as string;
    const targetRawAddress: string = query.targetRawAddress as string;
    const targetAddress = Address.createFromRawAddress(targetRawAddress);

    const momijiBlockChain = await setupBlockChain('momiji');
    const symbolBlockChain = await setupBlockChain('symbol');

    const strQr = await fetchAccountMetaData(
      symbolBlockChain,
      symbolAccountMetaDataKey,
      targetAddress,
    );
    const account = decryptedAccount(momijiBlockChain, strQr, password);

    return NextResponse.json({ data: account.address.plain() }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
};
