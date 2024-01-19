import axios from "axios";
import { NextResponse } from 'next/server'

export class ApiClient {
  fetch = async (url: string, queryParams: any, headers: any): Promise<any> => {
    try {
      const config = {
        headers: headers,
        params: queryParams,
      };

      const res = await axios.get(url, config);

      return res;
    } catch (e:any) {
      console.log(e.response);
      return NextResponse.json({ message: e.response }, { status: 400 })
    }
  };

  post = async (url: string, body: any, headers: any): Promise<any> => {
    try {
      const res = await axios.post(url, body, {
        headers: headers,
      });

      return res;
    } catch (e:any) {
      console.log(e.response);
      return NextResponse.json({ message: e.response }, { status: 400 })
    }
  };
}
