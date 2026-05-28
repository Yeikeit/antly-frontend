'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getActiveBudget } from '@/lib/api/budgets';
import { useAuth } from '@/hooks/auth/useAuth';

export function WizardGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const { logout } = useAuth();

  useEffect(() => {
    getActiveBudget().then((budget) => {
      if (budget) {
        router.replace('/dashboard');
      } else {
        setChecked(true);
      }
    });
  }, [router]);

  if (!checked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-400">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute top-4 right-4 z-50">
        <button
          onClick={logout}
          className="text-xs text-slate-400 hover:text-red-500 transition-colors font-medium px-3 py-1.5 rounded-lg hover:bg-red-50 border border-transparent hover:border-red-100"
        >
          Cerrar sesión
        </button>
      </div>
      {children}
    </div>
  );
}
