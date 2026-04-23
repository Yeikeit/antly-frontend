import type { AuthResponse, AuthUser } from '@/types/auth';
import { setAccessTokenCookie, clearAccessTokenCookie } from '@/lib/api/client';

const AUTH_USER_KEY = 'auth_user';
const AUTH_REFRESH_KEY = 'auth_refresh';

export function getStoredUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(AUTH_USER_KEY);
    return stored ? (JSON.parse(stored) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function getStoredRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(AUTH_REFRESH_KEY);
}

export function persistSession(response: AuthResponse) {
  if (typeof window === 'undefined') return;

  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(response.user));
  localStorage.setItem(AUTH_REFRESH_KEY, response.refreshToken);
  setAccessTokenCookie(response.accessToken, 900);
}

export function clearSessionStorage() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(AUTH_USER_KEY);
    localStorage.removeItem(AUTH_REFRESH_KEY);
  }

  clearAccessTokenCookie();
}