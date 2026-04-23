'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { AuthUser } from '@/types/auth';
import { getStoredUser, clearSessionStorage } from '@/lib/auth/session';

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

  useEffect(() => {
    const storedUser = getStoredUser();
    setUserState(storedUser);
    setIsLoading(false);
  }, []);

  function setUser(user: AuthUser | null) {
    setUserState(user);
  }

  function clearUser() {
    setUserState(null);
    clearSessionStorage();
  }

  const value = useMemo(
    () => ({
      user,
      isLoading,
      setUser,
      clearUser,
    }),
    [user, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used inside AuthProvider');
  }
  return context;
}