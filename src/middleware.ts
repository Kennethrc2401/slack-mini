// Middleware temporarily disabled due to @convex-dev/auth version compatibility
// TODO: Update @convex-dev/auth to a version that exports /nextjs/server

import { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Middleware is currently disabled
  // See comments at top of file for details
  return undefined;
}

export const config = {
  matcher: [],
};