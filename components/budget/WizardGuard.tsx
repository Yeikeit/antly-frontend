'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getActiveBudget } from '@/lib/api/budgets';
import { useAuth } from '@/hooks/auth/useAuth';
import Loader from '@/components/ui/Loader';

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
    return <Loader fullPage />;
  }

  return (
    <div className="relative">
      <div className="absolute top-4 right-4 z-50">
        <button
          onClick={logout}
          className="flex items-center gap-1.5 text-xs font-semibold text-red-500 bg-red-50 border border-red-200 hover:bg-red-100 hover:border-red-300 transition-colors px-3 py-1.5 rounded-lg"
        >
          <span>✕</span> Cerrar sesión
        </button>
      </div>
      {children}
    </div>
  );
}
