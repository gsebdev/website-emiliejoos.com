import { NextRequest, NextResponse } from 'next/server'
import { User,  verifyJwt } from './auth';




export async function middleware(request: NextRequest) {
  const cookieData = JSON.parse(request.cookies.get('loggedUser')?.value ?? '{}');
  const token = cookieData.token;
  const isLoggedIn = await verifyJwt(token);

  if(isLoggedIn) {
    if (request.nextUrl.pathname.startsWith('/login')) return Response.redirect(new URL('/backend', request.url));
  } else {
    if(request.nextUrl.pathname.startsWith('/backend')) return Response.redirect(new URL('/login', request.url));
    if(request.nextUrl.pathname.startsWith('/api/backend')) return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }
}
 
export const config = {
  matcher: [
    '/login',
    '/backend/:path*',
    '/api/backend/:path*'
],
}