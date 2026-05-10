import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Solo accesibles sin sesión (o con sesión → dashboard)
const AUTH_ROUTES = ['/login', '/register'];

// Rutas que requieren sesión activa
const PROTECTED_PREFIXES = [
  '/dashboard',
  '/settingBudget',
  '/settingIncomes',
  '/budgetAllocation',
  '/budgetConfirmation',
  '/categories',
  '/transactions',
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

  // Usuario sin sesión visitando ruta protegida → landing
  if (!hasToken && isProtected) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
