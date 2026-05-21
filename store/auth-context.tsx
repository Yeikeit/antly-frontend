'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { AuthUser } from '@/types/auth';
import { getStoredUser, clearSessionStorage, getStoredRefreshToken } from '@/lib/auth/session';
import * as authApi from '@/lib/api/auth';
import { setAccessTokenCookie } from '@/lib/api/client';
import { SESSION_EXPIRED_EVENT } from '@/lib/auth/session-events';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

// Minutos de inactividad antes de cerrar sesión automáticamente
const INACTIVITY_MINUTES = Number(process.env.NEXT_PUBLIC_INACTIVITY_MINUTES ?? 30);
const INACTIVITY_MS = INACTIVITY_MINUTES * 60 * 1000;
console.log('[Auth] INACTIVITY_MINUTES:', INACTIVITY_MINUTES, '| MS:', INACTIVITY_MS);

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  setUser: (user: AuthUser | null) => void;
  clearUser: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const inactivityTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastActivityRef = useRef<number>(0);

  // ── Limpieza de sesión y redirección ─────────────────────────────────────
  const expireSession = useCallback((showToast = true) => {
    const refreshToken = getStoredRefreshToken();
    if (refreshToken) {
      authApi.logout(refreshToken).catch(() => {});
    }
    clearSessionStorage();
    setUserState(null);
    if (showToast && typeof window !== 'undefined') {
      window.dispatchEvent(new Event('session:show-toast'));
      setTimeout(() => {
        window.dispatchEvent(new Event('session:cleared'));
        router.replace('/');
      }, 3500);
    } else {
      router.replace('/');
    }
  }, [router]);

  // ── Refresh silencioso del access token (#4) ──────────────────────────────
  const silentRefresh = useCallback(async (): Promise<boolean> => {
    const refreshToken = getStoredRefreshToken();
    if (!refreshToken) return false;
    try {
      const res = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      if (!res.ok) return false;
      const data = await res.json();
      setAccessTokenCookie(data.accessToken);
      if (data.refreshToken) {
        localStorage.setItem('auth_refresh', data.refreshToken);
      }
      return true;
    } catch {
      return false;
    }
  }, []);

  // ── Inicialización: restaurar usuario + refresh silencioso si la cookie murió ──
  useEffect(() => {
    const storedUser = getStoredUser();
    if (!storedUser) {
      setIsLoading(false);
      return;
    }

    // Verificar si la cookie de access_token existe
    const hasCookie = typeof document !== 'undefined' &&
      document.cookie.includes('access_token=');

    if (hasCookie) {
      setUserState(storedUser);
      setIsLoading(false);
    } else {
      // Cookie expiró pero hay refresh token: renovar silenciosamente
      silentRefresh().then((ok) => {
        if (ok) {
          setUserState(storedUser);
        } else {
          clearSessionStorage();
        }
        setIsLoading(false);
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Escuchar evento session:expired del API client (#2 + #7) ─────────────
  useEffect(() => {
    const handler = () => expireSession(true);
    window.addEventListener(SESSION_EXPIRED_EVENT, handler);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, handler);
  }, [expireSession]);

  // ── Sync entre tabs: detectar logout en otra pestaña (#8) ────────────────
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === 'auth_user' && e.newValue === null) {
        setUserState(null);
        router.replace('/');
      }
      // Si se loguea en otra pestaña, actualizar usuario sin redirigir
      if (e.key === 'auth_user' && e.newValue !== null) {
        try {
          setUserState(JSON.parse(e.newValue));
        } catch { /* ignorar */ }
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [router]);

  // ── Visibility change: verificar sesión al volver a la pestaña (#6) ──────
  useEffect(() => {
    const handler = async () => {
      if (document.visibilityState !== 'visible') return;
      if (!getStoredUser()) return;

      const hasCookie = document.cookie.includes('access_token=');
      if (!hasCookie) {
        const ok = await silentRefresh();
        if (!ok) expireSession(true);
      }
    };
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, [silentRefresh, expireSession]);

  // ── Timeout de inactividad (#9) ───────────────────────────────────────────
  const resetInactivityTimer = useCallback(() => {
    const now = Date.now();
    if (now - lastActivityRef.current < 10_000) return; // throttle: ignorar si pasaron menos de 10s
    lastActivityRef.current = now;

    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    if (!getStoredUser()) return;
    console.log('[Auth] Timer reiniciado, expira en', INACTIVITY_MINUTES, 'min');
    inactivityTimer.current = setTimeout(() => {
      console.log('[Auth] Timer disparado → expireSession');
      expireSession(true);
    }, INACTIVITY_MS);
  }, [expireSession]);

  useEffect(() => {
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach((ev) => window.addEventListener(ev, resetInactivityTimer, { passive: true }));
    resetInactivityTimer(); // arrancar el timer al montar
    return () => {
      events.forEach((ev) => window.removeEventListener(ev, resetInactivityTimer));
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    };
  }, [resetInactivityTimer]);

  // ── API pública del contexto ──────────────────────────────────────────────
  function setUser(user: AuthUser | null) {
    setUserState(user);
  }

  function clearUser() {
    setUserState(null);
    clearSessionStorage();
  }

  const value = useMemo(
    () => ({ user, isLoading, setUser, clearUser }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuthContext must be used inside AuthProvider');
  return context;
}
