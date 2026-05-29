"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getBudgetSummary, type BudgetSummary } from "@/lib/api/budgets";
import { BudgetChart } from "@/components/budget/BudgetChart";
import Loader from "@/components/ui/Loader";

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const CATEGORY_COLORS = [
  "bg-teal-500", "bg-violet-500", "bg-amber-500",
  "bg-rose-500", "bg-sky-500", "bg-emerald-500", "bg-indigo-500", "bg-pink-500",
];

function ExecutionBar({ spent, allocated }: { spent: number; allocated: number }) {
  const pct = allocated > 0 ? Math.min(Math.round((spent / allocated) * 100), 100) : 0;
  const over = allocated > 0 && spent > allocated;
  return (
    <div className="mt-1.5 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
      <div
        className={`h-full rounded-full transition-all ${over ? "bg-red-400" : "bg-[#0E7C8B]"}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export default function BudgetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [summary, setSummary] = useState<BudgetSummary | null | undefined>(undefined);

  useEffect(() => {
    if (!id) return;
    getBudgetSummary(id)
      .then(setSummary)
      .catch(() => setSummary(null));
  }, [id]);

  if (summary === undefined) return <Loader fullPage />;

  if (summary === null) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center">
        <p className="text-slate-500 text-sm">No se pudo cargar el presupuesto.</p>
        <Link href="/budget/history" className="mt-4 inline-block text-sm text-[#0E7C8B] hover:underline">
          ← Volver al historial
        </Link>
      </div>
    );
  }

  const isClosed = summary.status === "CLOSED";
  const isActive = summary.status === "ACTIVE";
  const income = Number(summary.totalIncomeAmount);
  const allocated = Number(summary.totalAllocatedAmount);
  const spent = Number(summary.totalSpent);
  const remaining = Number(summary.totalRemaining);
  const allocatedPct = income > 0 ? Math.round((allocated / income) * 100) : 0;
  const spentPct = income > 0 ? Math.round((spent / income) * 100) : 0;

  const parentMap = new Map<string, { name: string; colorIdx: number; subs: typeof summary.allocations }>();
  summary.allocations.forEach((a, i) => {
    const key = a.parentId ?? a.categoryId;
    const name = a.parentName ?? a.categoryName;
    if (!parentMap.has(key)) parentMap.set(key, { name, colorIdx: parentMap.size, subs: [] });
    parentMap.get(key)!.subs.push(a);
  });

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/budget/history" className="text-sm text-slate-500 hover:text-slate-900">
          ← Historial de presupuestos
        </Link>
      </div>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {MONTHS[summary.month - 1]} {summary.year}
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">Detalle del presupuesto</p>
        </div>
        {isActive && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Activo
          </span>
        )}
        {isClosed && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-500">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
            Cerrado
          </span>
        )}
      </div>

      {isClosed && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
          <span className="mt-0.5 text-slate-400">🔒</span>
          <p className="text-sm text-slate-600">
            Este presupuesto está cerrado. Los datos son de solo lectura y reflejan el resultado final del mes.
          </p>
        </div>
      )}

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Ingresos", value: income, color: "text-slate-800" },
          { label: "Asignado", value: allocated, color: "text-[#0E7C8B]" },
          {
            label: isClosed ? "Gastado" : "Gastado hasta hoy",
            value: spent,
            color: spent > allocated ? "text-red-600" : "text-slate-800",
          },
          {
            label: "Restante",
            value: remaining,
            color: remaining >= 0 ? "text-emerald-600" : "text-red-600",
          },
        ].map((m) => (
          <div key={m.label} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <p className="text-xs text-slate-400">{m.label}</p>
            <p className={`mt-1 text-lg font-bold ${m.color}`}>
              ${m.value.toLocaleString("es-CL", { minimumFractionDigits: 0 })}
            </p>
          </div>
        ))}
      </div>

      <div className="mb-6 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-medium text-slate-700">Asignado vs ingresos</p>
          <p className="text-sm font-semibold text-[#0E7C8B]">{allocatedPct}%</p>
        </div>
        <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
          <div className="h-full rounded-full bg-[#0E7C8B] transition-all" style={{ width: `${Math.min(allocatedPct, 100)}%` }} />
        </div>
        {isClosed && (
          <>
            <div className="mt-4 mb-3 flex items-center justify-between">
              <p className="text-sm font-medium text-slate-700">Gastado vs ingresos</p>
              <p className={`text-sm font-semibold ${spentPct > 100 ? "text-red-600" : "text-slate-700"}`}>{spentPct}%</p>
            </div>
            <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${spentPct > 100 ? "bg-red-400" : "bg-amber-400"}`}
                style={{ width: `${Math.min(spentPct, 100)}%` }}
              />
            </div>
          </>
        )}
      </div>

      {summary.allocations.length > 0 && (
        <div className="mb-6">
          <BudgetChart allocations={summary.allocations} />
        </div>
      )}

      <div>
        <h2 className="mb-4 text-base font-semibold text-slate-800">Detalle por categoría</h2>
        <div className="flex flex-col gap-4">
          {[...parentMap.entries()].map(([, group]) => {
            const catAllocated = group.subs.reduce((a, s) => a + Number(s.allocated), 0);
            const catSpent = group.subs.reduce((a, s) => a + Number(s.spent), 0);
            const colorClass = CATEGORY_COLORS[group.colorIdx % CATEGORY_COLORS.length];

            return (
              <div key={group.name} className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
                {/* Category header */}
                <div className="flex items-center gap-3 bg-slate-50 px-4 py-3">
                  <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white ${colorClass}`}>
                    {group.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="flex-1 text-sm font-semibold text-slate-800">{group.name}</span>
                  <div className="text-right">
                    <p className="text-xs text-slate-400">Asignado</p>
                    <p className="text-sm font-semibold text-slate-800">
                      ${catAllocated.toLocaleString("es-CL", { minimumFractionDigits: 0 })}
                    </p>
                  </div>
                  {isClosed && (
                    <div className="ml-4 text-right">
                      <p className="text-xs text-slate-400">Gastado</p>
                      <p className={`text-sm font-semibold ${catSpent > catAllocated ? "text-red-600" : "text-[#0E7C8B]"}`}>
                        ${catSpent.toLocaleString("es-CL", { minimumFractionDigits: 0 })}
                      </p>
                    </div>
                  )}
                </div>

                {group.subs.map((sub) => {
                  const subAllocated = Number(sub.allocated);
                  const subSpent = Number(sub.spent);
                  return (
                    <div key={sub.categoryId} className="border-t border-slate-100 px-5 py-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">{sub.categoryName}</span>
                        <div className="flex items-center gap-6 text-right">
                          <div>
                            <p className="text-xs text-slate-400">Presupuestado</p>
                            <p className="text-sm font-medium text-slate-800">
                              ${subAllocated.toLocaleString("es-CL", { minimumFractionDigits: 0 })}
                            </p>
                          </div>
                          {isClosed && (
                            <div>
                              <p className="text-xs text-slate-400">Gastado</p>
                              <p className={`text-sm font-medium ${subSpent > subAllocated ? "text-red-600" : "text-emerald-600"}`}>
                                ${subSpent.toLocaleString("es-CL", { minimumFractionDigits: 0 })}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      {isClosed && <ExecutionBar spent={subSpent} allocated={subAllocated} />}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
