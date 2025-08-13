import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

function getApiBase(){
  const internal = (process.env.INTERNAL_API_BASE || '').trim();
  if (internal) return internal;
  const env = (process.env.NEXT_PUBLIC_API_BASE || '').trim();
  if (env) {
    try {
      const u = new URL(env);
      // Se for um host interno do Docker, usar localhost
      const host = u.hostname === 'backend' ? 'localhost' : u.hostname;
      return `${u.protocol}//${host}${u.port ? `:${u.port}` : ''}`;
    } catch {
      // ignora parse e cai para fallback
    }
  }
  return 'http://localhost:8000';
}

async function handle(req: NextRequest, { params }: { params: { path: string[] } }){
  const path = (params?.path || []).join('/');
  const incoming = new URL(req.url);
  const targetBase = `${getApiBase().replace(/\/$/, '')}/api/${path}`;
  const url = new URL(targetBase + (incoming.search || ''));

  const headers: Record<string, string> = {};
  req.headers.forEach((value, key) => {
    if (key.toLowerCase() === 'host') return;
    // Mantemos cookies do cliente para o backend poder ler 'access_token'
    headers[key] = value;
  });

  const token = cookies().get('access_token')?.value;
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const init: RequestInit = {
    method: req.method,
    headers,
    redirect: 'manual',
    cache: 'no-store',
  };
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    init.body = await req.arrayBuffer();
  }

  const resp = await fetch(url, init);

  // Se for login (/token), capturar o token do corpo e fixar cookie no domínio do frontend
  if (req.method === 'POST' && path === 'token') {
    try{
      const json = await resp.clone().json();
      const tokenValue = json?.access_token as string | undefined;
      if (tokenValue) {
        const out = new NextResponse(JSON.stringify(json), { status: 200, headers: { 'Content-Type': 'application/json' } });
        out.cookies.set('access_token', tokenValue, {
          httpOnly: true,
          sameSite: 'lax',
          path: '/',
          maxAge: 60*60*2,
        });
        return out;
      }
    }catch{
      // Ignora e segue retornando resposta do backend
    }
  }

  const outHeaders = new Headers();
  resp.headers.forEach((v, k) => {
    if (k.toLowerCase() === 'set-cookie') return; // não propagar cookies do backend
    outHeaders.set(k, v);
  });
  return new NextResponse(resp.body, { status: resp.status, statusText: resp.statusText, headers: outHeaders });
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
export const OPTIONS = handle;


