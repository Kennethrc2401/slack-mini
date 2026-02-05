import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  // Allow all requests - auth is checked client-side via useAuthContext (userId)
  // The auth-screen component handles redirecting unauthenticated users
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};