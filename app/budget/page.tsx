"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getActiveBudget, closeBudget, reopenBudget, getAllBudgets, type ActiveBudget, type BudgetListItem } from "@/lib/api/budgets";
import { getBudgetPreferences } from "@/lib/api/users";
import { useBudgetSummary } from "@/hooks/budget/useBudgetSummary";
import BudgetMetricCard from "@/components/budget/BudgetMetricCard";
import CategoryCard from "@/components/budget/CategoryCard";
import { formatCLP } from "@/lib/utils/currency";
import { FaPlus } from "react-icons/fa";
import Link from "next/link";
import Loader from "@/components/ui/Loader";

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

type NoBudgetState = 'loading' | 'first-time' | 'manual-needed' | 'automation-pending' | 'reopen-available';

export default function BudgetPage() {
  const router = useRouter();
  const [budget, setBudget] = useState<ActiveBudget | null | undefined>(undefined);
  const [noBudgetState, setNoBudgetState] = useState<NoBudgetState>('loading');
  const [closedBudget, setClosedBudget] = useState<BudgetListItem | null>(null);
  const [reopening, setReopening] = useState(false);
  const { summary, loading, error } = useBudgetSummary(budget?.id);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [closeReason, setCloseReason] = useState("");
  const [closing, setClosing] = useState(false);
  const [closeError, setCloseError] = useState<string | null>(null);
  const reasonRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getActiveBudget().then(async (b) => {
      if (b) {
        setBudget(b);
        return;
      }
      const [history, prefs] = await Promise.all([
        getAllBudgets(),
        getBudgetPreferences().catch(() => null),
      ]);
      const automation = prefs?.budgetAutomation ?? true;
      setBudget(null);
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
      window.location.reload();
    } catch {
      setReopening(false);
    }
  }

  async function handleClose() {
    if (!budget?.id || !closeReason.trim()) return;
    setClosing(true);
    setCloseError(null);
    try {
      await closeBudget(budget.id, closeReason.trim());
      router.replace("/dashboard");
    } catch {
      setCloseError("No se pudo cerrar el presupuesto. Intenta nuevamente.");
      setClosing(false);
    }
  }

  if (budget === undefined) {
    return <Loader />;
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

  if (!summary) return <Loader />;

  const income = Number(summary.totalIncomeAmount);
  const allocated = Number(summary.totalAllocatedAmount);
  const spent = Number(summary.totalSpent);
  const unallocated = income - allocated;
  const budgetRemaining = allocated - spent;
  const spentPct = allocated > 0 ? Math.min(Math.round((spent / allocated) * 100), 100) : 0;
  const allocatedPct = income > 0 ? Math.round((allocated / income) * 100) : 0;

  // La API solo devuelve subcategorías; reconstruimos los padres agrupando por parentId
  const subByParent = summary.allocations.reduce<Record<string, typeof summary.allocations>>(
    (acc, a) => {
      const key = a.parentId ?? a.categoryId;
      acc[key] = acc[key] ?? [];
      if (a.parentId) acc[key].push(a);
      return acc;
    },
    {}
  );

  const parentCategories = Object.entries(
    summary.allocations.reduce<Record<string, { categoryId: string; categoryName: string; type: string }>>((acc, a) => {
      const id = a.parentId ?? a.categoryId;
      const name = a.parentName ?? a.categoryName;
      if (!acc[id]) acc[id] = { categoryId: id, categoryName: name, type: a.type };
      return acc;
    }, {})
  ).map(([, v]) => v);

  const expenseCategories = parentCategories.filter((a) => a.type !== "SAVING");
  const savingCategories = parentCategories.filter((a) => a.type === "SAVING");

  const totalSavingAllocated = savingCategories.reduce((sum, cat) => {
    return sum + (subByParent[cat.categoryId] ?? []).reduce((s, sub) => s + sub.allocated, 0);
  }, 0);
  const totalSaved = savingCategories.reduce((sum, cat) => {
    return sum + (subByParent[cat.categoryId] ?? []).reduce((s, sub) => s + sub.spent, 0);
  }, 0);
  const savingRate = income > 0 ? Math.round((totalSavingAllocated / income) * 100) : 0;

  return (
    <div className="max-w-5xl mx-auto px-2 py-6 md:py-8 space-y-6 md:space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">
            {MONTHS[budget.month - 1]} {budget.year}
          </h1>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100 px-3 py-1 rounded-full">
            Activo
          </span>
          <Link
            href={`/budget/${budget.id}/edit/incomes`}
            className="flex items-center gap-1.5 border border-[#0E7C8B] text-[#0E7C8B] text-xs md:text-sm font-semibold px-3 md:px-4 py-2 rounded-xl hover:bg-teal-50 transition-colors"
          >
            ✏️ Editar
          </Link>
          <button
            type="button"
            onClick={() => { setCloseReason(""); setCloseError(null); setShowCloseModal(true); }}
            className="flex items-center gap-1.5 border border-red-200 text-red-500 text-xs md:text-sm font-semibold px-3 md:px-4 py-2 rounded-xl hover:bg-red-50 transition-colors"
          >
            🔒 Cerrar mes
          </button>
          <Link
            href="/transactions/new"
            className="flex items-center gap-2 bg-[#0E7C8B] text-white text-xs md:text-sm font-semibold px-3 md:px-4 py-2 rounded-xl hover:bg-[#0a6470] transition-colors"
          >
            <FaPlus size={11} /> Agregar
          </Link>
        </div>
      </div>

      <div className={`grid grid-cols-2 gap-3 ${unallocated > 0 ? "md:grid-cols-5" : "md:grid-cols-4"}`}>
        <BudgetMetricCard label="Ingresos" amount={income} color="slate" />
        <BudgetMetricCard label="Asignado" amount={allocated} color="teal" sub={`${allocatedPct}% del ingreso`} />
        {unallocated > 0 && (
          <BudgetMetricCard
            label="Sin asignar"
            amount={unallocated}
            color="amber"
            sub="Ingreso sin presupuestar"
          />
        )}
        <BudgetMetricCard
          label="Gastado"
          amount={spent}
          color="orange"
        />
        <BudgetMetricCard
          label="Restante por gastar"
          amount={budgetRemaining}
          color={budgetRemaining >= 0 ? "emerald" : "red"}
          sub={budgetRemaining < 0 ? "Presupuesto excedido" : undefined}
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm font-semibold text-slate-700">Ejecución del presupuesto</p>
          <p className="text-sm font-bold text-[#0E7C8B]">{spentPct}%</p>
        </div>
        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${spentPct >= 100 ? "bg-red-500" : "bg-[#0E7C8B]"}`}
            style={{ width: `${spentPct}%` }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
          <span>${formatCLP(spent)} gastados de ${formatCLP(allocated)} asignados</span>
          <span className={budgetRemaining >= 0 ? "text-emerald-600 font-medium" : "text-red-500 font-medium"}>
            Saldo: ${formatCLP(budgetRemaining)}
          </span>
        </div>
      </div>

      {error ? (
        <p className="text-sm text-red-500">{error}</p>
      ) : (
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Categorías</h2>
          </div>

          {expenseCategories.length > 0 && (
            <div>
              <h3 className="text-base font-semibold text-slate-600 mb-3">Gastos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {expenseCategories.map((cat) => (
                  <CategoryCard
                    key={cat.categoryId}
                    category={cat}
                    subcategories={subByParent[cat.categoryId] ?? []}
                  />
                ))}
              </div>
            </div>
          )}

          {savingCategories.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-semibold text-slate-600">Ahorros</h3>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-slate-500">
                    Asignado:{" "}
                    <span className="font-semibold text-emerald-600">
                      ${formatCLP(totalSavingAllocated)}
                    </span>
                    {totalSaved > 0 && (
                      <span className="text-slate-400"> · ejecutado: ${formatCLP(totalSaved)}</span>
                    )}
                  </span>
                  <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 text-xs font-semibold px-2.5 py-1 rounded-full">
                    {savingRate}% del ingreso
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {savingCategories.map((cat) => (
                  <CategoryCard
                    key={cat.categoryId}
                    category={cat}
                    subcategories={subByParent[cat.categoryId] ?? []}
                    isSaving
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      {showCloseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-base font-semibold text-slate-900">Cerrar presupuesto</h3>
            <p className="mt-1 text-sm text-slate-500">
              Esta acción cierra el mes y deja el presupuesto en modo solo lectura. Deberás crear uno nuevo manualmente.
            </p>
            <div className="mt-4">
              <label htmlFor="close-reason" className="block text-xs font-medium text-slate-700 mb-1">
                Motivo de cierre <span className="text-red-500">*</span>
              </label>
              <input
                id="close-reason"
                ref={reasonRef}
                type="text"
                value={closeReason}
                onChange={(e) => setCloseReason(e.target.value)}
                placeholder="Ej: Fin del mes de mayo"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#0E7C8B] focus:outline-none focus:ring-1 focus:ring-[#0E7C8B]"
                autoFocus
              />
            </div>
            {closeError && (
              <p className="mt-2 text-xs text-red-500">{closeError}</p>
            )}
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCloseModal(false)}
                disabled={closing}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleClose}
                disabled={closing || !closeReason.trim()}
                className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {closing ? "Cerrando…" : "Confirmar cierre"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
