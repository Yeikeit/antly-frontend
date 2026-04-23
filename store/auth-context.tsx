'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { AuthUser, AuthResponse } from '@/types/auth';
import { setAccessTokenCookie, clearAccessTokenCookie } from '@/lib/api/client';
import * as authApi from '@/lib/api/auth';

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const stored = localStorage.getItem('auth_user');
      if (stored) setUser(JSON.parse(stored) as AuthUser);
    } catch {
      // ignore malformed storage
    }
    setIsLoading(false);
  }, []);

  const storeSession = useCallback((response: AuthResponse) => {
    setUser(response.user);
    localStorage.setItem('auth_user', JSON.stringify(response.user));
    localStorage.setItem('auth_refresh', response.refreshToken);
    setAccessTokenCookie(response.accessToken, 900);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await authApi.login(email, password);
      storeSession(res);
      router.push('/dashboard');
    },
    [storeSession, router],
  );

  const register = useCallback(
    async (email: string, password: string, firstName: string, lastName: string) => {
      const res = await authApi.register(email, password, firstName, lastName);
      storeSession(res);
      router.push('/dashboard');
    },
    [storeSession, router],
  );

  const logout = useCallback(async () => {
    const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('auth_refresh') : null;
    if (refreshToken) {
      try {
        await authApi.logout(refreshToken);
      } catch {
        // proceed with local cleanup even if server call fails
      }
    }
    setUser(null);
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_refresh');
    clearAccessTokenCookie();
    router.push('/login');
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
