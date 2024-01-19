import { NextResponse } from 'next/server'
import axios from 'axios'

// 登録用リンクメール送信API
export const POST = async (req: Request, res: NextResponse<string | null>) => {
  try {
    if (req.method !== 'POST')
      return NextResponse.json({ message: 'Bad Request' }, { status: 405 })

      const { email, lpKeyword } = await req.json()
      console.log(email);
      console.log(lpKeyword);

    const response = await axios.post(`${process.env.AZURE_API_ENDPOINT}/api/createTemporaryUser`, {
      email,
      lpKeyword
    });

    const url : string | null = response.data;

    return NextResponse.json({ data:url }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
