'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getActiveBudget } from '@/lib/api/budgets';

export function WizardGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

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

  return <>{children}</>;
}
