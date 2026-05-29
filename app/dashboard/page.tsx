'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getActiveBudget, getAllBudgets, reopenBudget, type ActiveBudget, type BudgetListItem } from '@/lib/api/budgets';
import { getBudgetPreferences } from '@/lib/api/users';
import Link from 'next/link';
import { useBudgetSummary } from "@/hooks/budget/useBudgetSummary";
import { BudgetChart } from "@/components/budget/BudgetChart";
import RecentTransactions from '@/components/transaction/RecentTransactions';
import Loader from '@/components/ui/Loader';


const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

type NoBudgetState = 'loading' | 'first-time' | 'manual-needed' | 'automation-pending' | 'reopen-available';

export default function DashboardPage() {
  const router = useRouter();
  const [budget, setBudget] = useState<ActiveBudget | null | undefined>(undefined);
  const [noBudgetState, setNoBudgetState] = useState<NoBudgetState>('loading');
  const [closedBudget, setClosedBudget] = useState<BudgetListItem | null>(null);
  const [reopening, setReopening] = useState(false);
  const [automationOn, setAutomationOn] = useState<boolean>(true);
  const { summary, loading: loadingSummary, error } = useBudgetSummary(budget?.id);

  useEffect(() => {
    getActiveBudget().then(async (b) => {
      const prefs = await getBudgetPreferences().catch(() => null);
      const automation = prefs?.budgetAutomation ?? true;
      setAutomationOn(automation);

      if (b) {
        setBudget(b);
        return;
      }
      const history = await getAllBudgets();
      if (history.length === 0) {
        router.replace('/settingBudget');
        return;
      }
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;
      const closedThisMonth = history.find(
        (bud) => bud.year === currentYear && bud.month === currentMonth && bud.status === 'CLOSED'
      ) ?? null;
      setBudget(null);
      if (closedThisMonth) {
        setClosedBudget(closedThisMonth);
        setNoBudgetState('reopen-available');
        return;
      }
      setNoBudgetState(automation ? 'automation-pending' : 'manual-needed');
    });
  }, [router]);

  async function handleReopen() {
    if (!closedBudget) return;
    setReopening(true);
    try {
      await reopenBudget(closedBudget.id);
      router.refresh();
      window.location.reload();
    } catch {
      setReopening(false);
    }
  }


  if (budget === undefined) {
    return <Loader fullPage />;
  }

  if (!budget) {
    return (
      <div className="max-w-4xl mx-auto flex items-center justify-center min-h-[60vh]">
        {noBudgetState === 'loading' && <Loader />}

        {noBudgetState === 'reopen-available' && (
          <div className="text-center bg-white rounded-2xl border border-slate-100 p-10 shadow-sm max-w-md w-full">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-500 text-2xl">
              🔓
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Presupuesto cerrado este mes</h2>
            <p className="text-sm text-slate-500 mb-6">
              Cerraste el presupuesto de {closedBudget && MONTHS[closedBudget.month - 1]} antes de que terminara el mes. Puedes reabrirlo para seguir registrando gastos.
            </p>
            <button
              type="button"
              onClick={handleReopen}
              disabled={reopening}
              className="inline-block rounded-xl bg-[#0E7C8B] px-6 py-3 text-sm font-semibold text-white hover:bg-teal-700 transition disabled:opacity-60"
            >
              {reopening ? 'Reabriendo…' : 'Reabrir presupuesto'}
            </button>
            <div className="mt-4">
              <Link href="/budget/new" className="text-sm font-medium text-slate-400 hover:text-slate-600">
                Crear uno nuevo de todas formas →
              </Link>
            </div>
          </div>
        )}

        {noBudgetState === 'automation-pending' && (
          <div className="text-center bg-white rounded-2xl border border-slate-100 p-10 shadow-sm max-w-md w-full">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-teal-50 text-[#0E7C8B] text-2xl">
              ⏳
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Sin presupuesto activo</h2>
            <p className="text-sm text-slate-500 mb-6">
              La automatización está activa. El sistema creará tu presupuesto al inicio del próximo mes copiando el anterior.
            </p>
            <Link
              href="/budget/new"
              className="inline-block text-sm font-medium text-[#0E7C8B] hover:underline"
            >
              Crear manualmente de todas formas →
            </Link>
          </div>
        )}

        {noBudgetState === 'manual-needed' && (
          <div className="text-center bg-white rounded-2xl border border-slate-100 p-10 shadow-sm max-w-md w-full">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-500 text-2xl">
              📋
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">No tienes un presupuesto activo</h2>
            <p className="text-sm text-slate-500 mb-6">
              La automatización está desactivada. Crea tu presupuesto manualmente para empezar a registrar tus gastos.
            </p>
            <Link
              href="/budget/new"
              className="inline-block rounded-xl bg-[#0E7C8B] px-6 py-3 text-sm font-semibold text-white hover:bg-teal-700 transition"
            >
              Crear presupuesto para este mes
            </Link>
          </div>
        )}
      </div>
    );
  }

  const income = Number(budget.totalIncomeAmount);
  const allocated = Number(budget.totalAllocatedAmount);
  const available = income - allocated;
  const allocatedPct = income > 0 ? Math.round((allocated / income) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto">
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

          <div className="flex flex-col md:flex-row gap-6 mb-8 items-stretch">
        <div className="flex-1">
          {loadingSummary ? (
            <Loader />
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

        {!automationOn && (
          <div className="flex items-center justify-between rounded-2xl border border-dashed border-slate-200 bg-white px-5 py-4 shadow-sm">
            <div>
              <p className="text-sm font-semibold text-slate-800">Automatización desactivada</p>
              <p className="text-xs text-slate-500 mt-0.5">Crea el presupuesto del mes siguiente manualmente cuando estés listo.</p>
            </div>
            <Link
              href="/budget/new"
              className="ml-4 shrink-0 rounded-xl bg-[#0E7C8B] px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 transition"
            >
              + Nuevo presupuesto
            </Link>
          </div>
        )}
    </div>
  );
}
