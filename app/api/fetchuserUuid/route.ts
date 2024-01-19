import { NextResponse } from 'next/server'
import axios from 'axios'

// メール取得API
export const GET = async (req: Request, res: NextResponse<string | null>) => {
  try {
    if (req.method !== 'GET')
      return NextResponse.json({ message: 'Bad Request' }, { status: 405 })

    const { searchParams } = new URL(req.url)
    
    const userCuid = searchParams.get("userCuid")
    const response = await axios.get(`${process.env.AZURE_API_ENDPOINT}/api/fetchUserCuid?userCuid=${userCuid}`)
    const serverUserCuid : string | null = response.data;
    return NextResponse.json({ data:serverUserCuid }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
