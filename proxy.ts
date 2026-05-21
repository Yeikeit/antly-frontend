import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Solo accesibles sin sesión (o con sesión → dashboard)
const AUTH_ROUTES = ['/login', '/register'];

// Rutas que requieren sesión activa
const PROTECTED_PREFIXES = [
  '/dashboard',
  '/budget',
  '/settingBudget',
  '/settingIncomes',
  '/budgetAllocation',
  '/budgetConfirmation',
  '/categories',
  '/transactions',
  '/settings',
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasToken = request.cookies.has('access_token');

  const isAuthRoute = AUTH_ROUTES.some((r) => pathname.startsWith(r));
  const isProtected = PROTECTED_PREFIXES.some((r) => pathname.startsWith(r));

  // Usuario autenticado visitando landing o rutas de auth → dashboard
  if (hasToken && (pathname === '/' || isAuthRoute)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Usuario sin sesión visitando ruta protegida → landing con ?next= para redirect post-login
  if (!hasToken && isProtected) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
