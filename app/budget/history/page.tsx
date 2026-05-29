"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAllBudgets, deleteBudget, type BudgetListItem } from "@/lib/api/budgets";
import Loader from "@/components/ui/Loader";
import { formatCLP } from "@/lib/utils/currency";

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

function StatusBadge({ status }: { status: string }) {
  if (status === "ACTIVE") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-600">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        Activo
      </span>
    );
  }
  if (status === "CLOSED") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-semibold text-slate-500">
        <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
        Cerrado
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full border border-amber-100 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-600">
      Borrador
    </span>
  );
}

function BudgetRow({
  budget,
  onDelete,
}: {
  budget: BudgetListItem;
  onDelete: (id: string) => void;
}) {
  const income = Number(budget.totalIncomeAmount);
  const allocated = Number(budget.totalAllocatedAmount);
  const allocatedPct = income > 0 ? Math.round((allocated / income) * 100) : 0;
  const isActive = budget.status === "ACTIVE";
  const isClosed = budget.status === "CLOSED";
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirming) { setConfirming(true); return; }
    setDeleting(true);
    try {
      await deleteBudget(budget.id);
      onDelete(budget.id);
    } catch {
      setDeleting(false);
      setConfirming(false);
    }
  }

  return (
    <div className="relative">
      <Link
        href={`/budget/${budget.id}`}
        className={`group flex items-center gap-3 rounded-2xl border bg-white px-4 py-3 shadow-sm transition hover:shadow-md hover:border-[#0E7C8B]/30 ${
          isActive ? "border-[#0E7C8B]/40 ring-1 ring-[#0E7C8B]/20" : "border-slate-100"
        }`}
      >
        <div className="w-20 md:w-28 shrink-0">
          <p className="text-sm md:text-base font-semibold text-slate-900">
            {MONTHS[budget.month - 1]}
          </p>
          <p className="text-xs text-slate-400">{budget.year}</p>
        </div>

        <div className="w-24 shrink-0">
          <StatusBadge status={budget.status} />
        </div>

        <div className="flex flex-1 gap-6">
          <div>
            <p className="text-xs text-slate-400">Ingresos</p>
            <p className="text-sm font-semibold text-slate-800">
              ${formatCLP(income)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Asignado</p>
            <p className="text-sm font-semibold text-[#0E7C8B]">
              ${formatCLP(allocated)}
            </p>
          </div>
          <div className="hidden sm:block">
            <p className="text-xs text-slate-400">Ejecución</p>
            <p className="text-sm font-semibold text-slate-700">{allocatedPct}%</p>
          </div>
        </div>

        <span className="shrink-0 text-slate-300 transition group-hover:text-[#0E7C8B]">›</span>
      </Link>

      {isClosed && (
        <div className="absolute right-12 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {confirming ? (
            <>
              <span className="text-xs text-red-600 font-medium">¿Eliminar?</span>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-lg bg-red-500 px-2.5 py-1 text-xs font-semibold text-white hover:bg-red-600 disabled:opacity-60"
              >
                {deleting ? "…" : "Sí"}
              </button>
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); setConfirming(false); }}
                className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                No
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleDelete}
              title="Eliminar presupuesto"
              className="rounded-lg p-1.5 text-slate-300 hover:bg-red-50 hover:text-red-500 transition"
            >
              🗑
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function BudgetHistoryPage() {
  const [budgets, setBudgets] = useState<BudgetListItem[] | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  useEffect(() => {
    getAllBudgets()
      .then((list) => {
        const sorted = [...list].sort((a, b) =>
          a.year !== b.year ? b.year - a.year : b.month - a.month
        );
        setBudgets(sorted);
        
        if (sorted.length > 0) setSelectedYear(sorted[0].year);
      })
      .catch(() => setBudgets([]));
  }, []);

  function handleDelete(id: string) {
    setBudgets((prev) => prev ? prev.filter((b) => b.id !== id) : prev);
  }

  const years = budgets
    ? [...new Set(budgets.map((b) => b.year))].sort((a, b) => b - a)
    : [];

  const filtered = budgets
    ? selectedYear === null
      ? budgets
      : budgets.filter((b) => b.year === selectedYear)
    : [];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">Historial</h1>
          <p className="mt-0.5 text-xs md:text-sm text-slate-500">Tus presupuestos, del más reciente al más antiguo.</p>
        </div>
        <Link
          href="/budget/new"
          className="shrink-0 rounded-xl bg-[#0E7C8B] px-3 md:px-4 py-2 md:py-2.5 text-sm font-semibold text-white hover:bg-teal-700 transition"
        >
          + Nuevo
        </Link>
      </div>

     
      {years.length > 1 && (
        <div className="mb-5 flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setSelectedYear(null)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition border ${
              selectedYear === null
                ? "bg-[#0E7C8B] text-white border-[#0E7C8B]"
                : "bg-white text-slate-600 border-slate-200 hover:border-[#0E7C8B]/40 hover:text-[#0E7C8B]"
            }`}
          >
            Todos
          </button>
          {years.map((y) => (
            <button
              key={y}
              onClick={() => setSelectedYear(y)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition border ${
                selectedYear === y
                  ? "bg-[#0E7C8B] text-white border-[#0E7C8B]"
                  : "bg-white text-slate-600 border-slate-200 hover:border-[#0E7C8B]/40 hover:text-[#0E7C8B]"
              }`}
            >
              {y}
            </button>
          ))}
        </div>
      )}

      {budgets === null ? (
        <Loader />
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center text-sm text-slate-400">
          {budgets.length === 0 ? "Aún no tienes presupuestos registrados." : "Sin presupuestos para este año."}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((b) => (
            <BudgetRow key={b.id} budget={b} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
