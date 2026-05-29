"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getBudgetSummary, closeBudget, deleteBudget, type BudgetSummary } from "@/lib/api/budgets";
import { BudgetChart } from "@/components/budget/BudgetChart";
import Loader from "@/components/ui/Loader";
import { formatCLP } from "@/lib/utils/currency";

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
  const router = useRouter();
  const [summary, setSummary] = useState<BudgetSummary | null | undefined>(undefined);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [closeReason, setCloseReason] = useState("");
  const [closing, setClosing] = useState(false);
  const [closeError, setCloseError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const reasonRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!id) return;
    getBudgetSummary(id)
      .then(setSummary)
      .catch(() => setSummary(null));
  }, [id]);

  async function handleClose() {
    if (!id || !closeReason.trim()) return;
    setClosing(true);
    setCloseError(null);
    try {
      await closeBudget(id, closeReason.trim());
      setShowCloseModal(false);
      const updated = await getBudgetSummary(id);
      setSummary(updated);
    } catch {
      setCloseError("No se pudo cerrar el presupuesto. Intenta nuevamente.");
    } finally {
      setClosing(false);
    }
  }

  async function handleDelete() {
    if (!id) return;
    setDeleting(true);
    try {
      await deleteBudget(id);
      router.replace("/budget/history");
    } catch {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  }

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
  const unallocated = income - allocated;
  const budgetRemaining = allocated - spent;
  const allocatedPct = income > 0 ? Math.round((allocated / income) * 100) : 0;
  const spentPct = income > 0 ? Math.round((spent / income) * 100) : 0;
  const spentVsAllocatedPct = allocated > 0 ? Math.round((spent / allocated) * 100) : 0;

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
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Activo
            </span>
            <button
              type="button"
              onClick={() => router.push(`/budget/${id}/edit/incomes`)}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#0E7C8B] bg-white px-3 py-1 text-xs font-semibold text-[#0E7C8B] hover:bg-teal-50 transition"
            >
              ✏️ Editar presupuesto
            </button>
            <button
              type="button"
              onClick={() => { setCloseReason(""); setCloseError(null); setShowCloseModal(true); }}
              className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-white px-3 py-1 text-xs font-semibold text-red-500 hover:bg-red-50 transition"
            >
              🔒 Cerrar mes
            </button>
          </div>
        )}
        {isClosed && (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-500">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
              Cerrado
            </span>
            {showDeleteConfirm ? (
              <>
                <span className="text-xs text-red-600 font-medium">¿Eliminar definitivamente?</span>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="inline-flex items-center gap-1 rounded-full bg-red-500 px-3 py-1 text-xs font-semibold text-white hover:bg-red-600 transition disabled:opacity-60"
                >
                  {deleting ? "Eliminando…" : "Sí, eliminar"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="inline-flex items-center rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancelar
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-white px-3 py-1 text-xs font-semibold text-red-500 hover:bg-red-50 transition"
              >
                🗑 Eliminar
              </button>
            )}
          </div>
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
          { label: "Ingresos", value: income, color: "text-slate-800", sub: null },
          { label: "Asignado", value: allocated, color: "text-[#0E7C8B]", sub: `${allocatedPct}% del ingreso` },
          {
            label: "Sin asignar",
            value: unallocated,
            color: unallocated > 0 ? "text-amber-600" : "text-emerald-600",
            sub: "Ingreso sin presupuestar",
          },
          {
            label: isClosed ? "Gastado" : "Gastado hasta hoy",
            value: spent,
            color: spent > allocated ? "text-red-600" : "text-slate-800",
            sub: `Saldo: $${formatCLP(budgetRemaining)}`,
          },
        ].map((m) => (
          <div key={m.label} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <p className="text-xs text-slate-400">{m.label}</p>
            <p className={`mt-1 text-lg font-bold ${m.color}`}>
              ${formatCLP(m.value)}
            </p>
            {m.sub && <p className="mt-0.5 text-xs text-slate-400">{m.sub}</p>}
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

        <div className="mt-4 mb-3 flex items-center justify-between">
          <p className="text-sm font-medium text-slate-700">Gastado vs asignado</p>
          <p className={`text-sm font-semibold ${spentVsAllocatedPct > 100 ? "text-red-600" : "text-slate-700"}`}>{spentVsAllocatedPct}%</p>
        </div>
        <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${spentVsAllocatedPct > 100 ? "bg-red-400" : "bg-orange-400"}`}
            style={{ width: `${Math.min(spentVsAllocatedPct, 100)}%` }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
          <span>${formatCLP(spent)} gastados de ${formatCLP(allocated)} asignados</span>
          <span className={budgetRemaining >= 0 ? "text-emerald-600 font-medium" : "text-red-500 font-medium"}>
            Saldo: ${formatCLP(budgetRemaining)}
          </span>
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
                      ${formatCLP(catAllocated)}
                    </p>
                  </div>
                  {isClosed && (
                    <div className="ml-4 text-right">
                      <p className="text-xs text-slate-400">Gastado</p>
                      <p className={`text-sm font-semibold ${catSpent > catAllocated ? "text-red-600" : "text-[#0E7C8B]"}`}>
                        ${formatCLP(catSpent)}
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
                              ${formatCLP(subAllocated)}
                            </p>
                          </div>
                          {isClosed && (
                            <div>
                              <p className="text-xs text-slate-400">Gastado</p>
                              <p className={`text-sm font-medium ${subSpent > subAllocated ? "text-red-600" : "text-emerald-600"}`}>
                                ${formatCLP(subSpent)}
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

      {/* Modal de cierre de presupuesto */}
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
