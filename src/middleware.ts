import { NextRequest, NextResponse } from 'next/server';
import { auth } from 'next-auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow auth pages and API routes
  if (pathname.startsWith('/auth') || pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  // Check if user is authenticated
  const session = await auth();

  // If not authenticated and trying to access protected routes, redirect to auth
  if (!session && pathname === '/') {
    return NextResponse.redirect(new URL('/auth', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};