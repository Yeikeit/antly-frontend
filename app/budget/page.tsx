"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getActiveBudget, type ActiveBudget } from "@/lib/api/budgets";
import { useBudgetSummary } from "@/hooks/budget/useBudgetSummary";
import BudgetMetricCard from "@/components/budget/BudgetMetricCard";
import CategoryCard from "@/components/budget/CategoryCard";
import { FaPlus } from "react-icons/fa";
import Link from "next/link";

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

export default function BudgetPage() {
  const router = useRouter();
  const [budget, setBudget] = useState<ActiveBudget | null | undefined>(undefined);
  const { summary, loading, error } = useBudgetSummary(budget?.id);

  useEffect(() => {
    getActiveBudget().then((b) => {
      setBudget(b);
      if (!b) router.replace("/settingBudget");
    });
  }, [router]);

  if (budget === undefined || loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm text-slate-400">Cargando presupuesto...</p>
      </div>
    );
  }

  if (!budget || !summary) return null;

  const income = Number(summary.totalIncomeAmount);
  const allocated = Number(summary.totalAllocatedAmount);
  const spent = Number(summary.totalSpent);
  const remaining = Number(summary.totalRemaining);
  const spentPct = allocated > 0 ? Math.min(Math.round((spent / allocated) * 100), 100) : 0;

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

  const totalSaved = savingCategories.reduce((sum, cat) => {
    return sum + (subByParent[cat.categoryId] ?? []).reduce((s, sub) => s + sub.spent, 0);
  }, 0);
  const totalSavingAllocated = savingCategories.reduce((sum, cat) => {
    return sum + (subByParent[cat.categoryId] ?? []).reduce((s, sub) => s + sub.allocated, 0);
  }, 0);
  const savingRate = income > 0 ? Math.round((totalSaved / income) * 100) : 0;

  return (
    <div className="max-w-5xl mx-auto px-2 py-8 space-y-8">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {MONTHS[budget.month - 1]} {budget.year}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100 px-3 py-1 rounded-full">
            Activo
          </span>
          <Link
            href="/transactions/new"
            className="flex items-center gap-2 bg-[#0E7C8B] text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-[#0a6470] transition-colors"
          >
            <FaPlus size={12} /> Agregar Transacción
          </Link>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <BudgetMetricCard label="Ingresos" amount={income} color="slate" />
        <BudgetMetricCard label="Asignado" amount={allocated} color="teal" />
        <BudgetMetricCard label="Gastado" amount={spent} color="orange" />
        <BudgetMetricCard
          label="Saldo restante"
          amount={remaining}
          color={remaining >= 0 ? "emerald" : "red"}
          sub={`${spentPct}% ejecutado`}
        />
      </div>

      {/* Barra de ejecución global */}
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
        <p className="mt-2 text-xs text-slate-400">
          ${spent.toLocaleString("es-CL")} gastados de ${allocated.toLocaleString("es-CL")} asignados
        </p>
      </div>

      {/* Categorías */}
      {error ? (
        <p className="text-sm text-red-500">{error}</p>
      ) : (
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Categorías</h2>
          </div>

          {/* Gastos */}
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

          {/* Ahorros */}
          {savingCategories.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-semibold text-slate-600">Ahorros</h3>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-slate-500">
                    Ahorrado:{" "}
                    <span className="font-semibold text-emerald-600">
                      ${totalSaved.toLocaleString("es-CL")}
                    </span>
                    {" "}/ ${totalSavingAllocated.toLocaleString("es-CL")}
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
    </div>
  );
}
