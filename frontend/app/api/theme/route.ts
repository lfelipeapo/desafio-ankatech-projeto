import { NextResponse } from 'next/server';

export async function POST(req: Request){
  try{
    const { dark } = await req.json();
    const resp = new NextResponse(null, { status: 204 });
    const value = dark ? 'dark' : 'light';
    resp.cookies.set('theme', value, {
      httpOnly: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 60*60*24*365
    });
    return resp;
  }catch{
    return new NextResponse(null, { status: 400 });
  }
}


