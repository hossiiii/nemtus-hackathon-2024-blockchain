// POST SAMPLE signup の実行

import { NextResponse } from 'next/server';
import { TransactionStatus } from 'symbol-sdk';
import { signup } from '../../domain/useCases/signup';

export const POST = async (req: Request, res: NextResponse<string | null>) => {
  try {
    if (req.method !== 'POST')
      return NextResponse.json({ message: 'Bad Request' }, { status: 405 });

    const { password }: { password: string } = await req.json();

    const result: TransactionStatus = await signup(password);

    return NextResponse.json({ data: result }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
};
