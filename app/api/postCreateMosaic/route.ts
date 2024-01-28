// POST SAMPLE registration の実行

import { NextResponse } from 'next/server';
import { registration } from '../../domain/useCases/registration';
import { ProductInfo } from '../../domain/entities/productInfo/productInfo';
import { serviceName, serviceVersion } from '../../consts/consts';

export const POST = async (req: Request, res: NextResponse<string | null>) => {
  try {
    if (req.method !== 'POST')
      return NextResponse.json({ message: 'Bad Request' }, { status: 405 });

    const {
      password,
      productName,
      sellerName,
      description,
      category,
      price,
      amount,
    }: { password:string; productName:string; sellerName:string; description:string; category:string; price:number; amount:number;} = await req.json();

    const productInfo : ProductInfo = {
      productName,
      sellerName,
      description,
      category: category.split(','),
      metalIds: null,
      depositAddress: null,
      price: price,
      serviceName: serviceName,
      servieVersion: serviceVersion,
    }

    const result: string = await registration(password, productInfo, amount);

    return NextResponse.json({ data: result }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
};
