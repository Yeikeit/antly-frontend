'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { useAuth } from '@/hooks/auth/useAuth';
import { getActiveBudget, type ActiveBudget } from '@/lib/api/budgets';
import Link from 'next/link';
import { useBudgetSummary } from "@/hooks/budget/useBudgetSummary";
import { BudgetChart } from "@/components/budget/BudgetChart";
import RecentTransactions from '@/components/transaction/RecentTransactions';


const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

export default function DashboardPage() {
  const { logout } = useAuth();
  const router = useRouter();
  const [budget, setBudget] = useState<ActiveBudget | null | undefined>(undefined); // undefined = loading
  const { summary, loading: loadingSummary, error } = useBudgetSummary(budget?.id);


  useEffect(() => {
    getActiveBudget().then((b) => {
      setBudget(b);
      // Si no hay presupuesto este mes → redirigir al wizard
      if (!b) router.replace('/settingBudget');
    });
  }, [router]);

  // Loading
  if (budget === undefined) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-sm text-slate-400">Cargando...</p>
      </div>
    );
  }

  // No budget (redireccionando, pero por si acaso)
  if (!budget) return null;

  const income = Number(budget.totalIncomeAmount);
  const allocated = Number(budget.totalAllocatedAmount);
  const available = income - allocated;
  const allocatedPct = income > 0 ? Math.round((allocated / income) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader onLogout={logout} />

      <main className="max-w-4xl mx-auto px-6 py-10">
        {/* Encabezado del mes */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">Presupuesto activo</p>
            <h1 className="text-2xl font-bold text-slate-900">
              {MONTHS[budget.month - 1]} {budget.year}
            </h1>
          </div>
          <span className="text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100 px-3 py-1 rounded-full">
            Activo
          </span>
        </div>

        {/* Métricas principales */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Ingresos', value: income, color: 'text-slate-800' },
            { label: 'Asignado', value: allocated, color: 'text-[#0E7C8B]' },
            { label: 'Disponible', value: available, color: available >= 0 ? 'text-emerald-600' : 'text-red-600' },
          ].map((m) => (
            <div key={m.label} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
              <p className="text-xs text-slate-400 mb-1">{m.label}</p>
              <p className={`text-xl font-bold ${m.color}`}>
                ${m.value.toLocaleString('es-CL', { minimumFractionDigits: 0 })}
              </p>
            </div>
          ))}
        </div>

          <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1">
          {loadingSummary ? (
            <div>Cargando gráfico...</div>
          ) : error ? (
            <div>Error al cargar el gráfico</div>
          ) : summary ? (
            <BudgetChart allocations={summary.allocations} />
          ) : null}
        </div>
        <div className="w-full md:w-80">
          <RecentTransactions />
        </div>
      </div>
      
        {/* Barra de ejecución */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm mb-8">
          <div className="flex justify-between items-center mb-3">
            <p className="text-sm font-medium text-slate-700">Presupuesto asignado</p>
            <p className="text-sm font-semibold text-[#0E7C8B]">{allocatedPct}%</p>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#0E7C8B] rounded-full transition-all"
              style={{ width: `${Math.min(allocatedPct, 100)}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-slate-400">
            ${allocated.toLocaleString('es-CL')} de ${income.toLocaleString('es-CL')} asignados
          </p>
        </div>

        {/* CTA detalle */}
        <div className="flex gap-3">
          
        </div>
      </main>
    </div>
  );
}
