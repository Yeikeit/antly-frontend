import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_ROUTES = ['/login', '/register'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasToken = request.cookies.has('access_token');

  // Root: redirect based on auth state
  if (pathname === '/') {
    return NextResponse.redirect(
      new URL(hasToken ? '/dashboard' : '/login', request.url),
    );
  }

  const isPublic = PUBLIC_ROUTES.some((r) => pathname.startsWith(r));

  // Authenticated user visiting a public auth route → go to dashboard
  if (isPublic && hasToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Unauthenticated user visiting a protected route → go to login
  if (!isPublic && !hasToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
