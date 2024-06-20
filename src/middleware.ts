import { NextRequest, NextResponse } from 'next/server'
import { Auth } from './app/_lib/auth';

export const middleware = async (request: NextRequest) =>{
  try {

    const checkCsrf = (request.method !== 'GET');
    
    const {auth, responseNext } = await Auth.authenticate(checkCsrf);

    const isApi = request.nextUrl.pathname.startsWith('/api') || request.nextUrl.pathname === '/api';

    if(!auth.isLoggedIn || !auth.currentUser) {
        // if the user is not logged in, redirect to the login page
        return isApi ? NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 }) : NextResponse.redirect(new URL('/login', process.env.BASE_URL));
    }

    return responseNext;

  } catch (error) {

    return new NextResponse('Internal Server Error', { status: 500 });
  }
}



export const config = {
  matcher: [
    '/backend/((?!login).*)',
    '/api/backend/:path*'
  ],
};