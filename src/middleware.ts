import { NextRequest, NextResponse } from 'next/server'
import { verifyJwt } from './auth';
import { redirectToBackend, redirectToLogin } from './lib/utils';




export async function middleware(request: NextRequest) {
  try {
    const cookieData = request.cookies.get('loggedUser');
    const isLoginPage = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname === '/login';
    const isApi = request.nextUrl.pathname.startsWith('/api') || request.nextUrl.pathname === '/api';
    let isLoggedIn = false;

    if (cookieData) {
      const { token } = JSON.parse(cookieData.value);

      if (token) {
        isLoggedIn = !! await verifyJwt(token);
      }
    }

    if (isLoggedIn && isLoginPage) return redirectToBackend();

    if (!isLoggedIn && isApi) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (!isLoggedIn && !isLoginPage) return redirectToLogin(request.nextUrl.href);

  } catch (error) {
    console.error('Middleware error:', error);
  }
}



export const config = {
  matcher: [
    '/login',
    '/backend/:path*',
    '/api/backend/:path*'
  ],
};