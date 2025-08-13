import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_PATHS = [
  '/',
  '/login',
  '/_next',
  '/api',
  '/favicon.ico',
  '/robots.txt',
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // Verifica se é uma rota pública
  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'));
  if (isPublic) return NextResponse.next();

  // Verifica se há token de acesso
  const token = req.cookies.get('access_token')?.value;
  
  // Se não há token, redireciona para login
  if (!token) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // Se há token, permite o acesso
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|robots.txt).*)'],
};


