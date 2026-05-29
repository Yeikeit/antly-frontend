"use client";
import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useEditBudgetFlow } from "@/store/EditBudgetFlowContext";
import { updateBudgetWizard } from "@/lib/api/budgets";
import { BudgetWrapper } from "@/components/budget/BudgetWrapper";
import { formatCLP } from "@/lib/utils/currency";

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const ICON_COLORS = [
  "bg-teal-500", "bg-violet-500", "bg-amber-500",
  "bg-rose-500", "bg-sky-500", "bg-emerald-500", "bg-indigo-500", "bg-pink-500",
];

export function EditBudgetConfirmationScreen() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { month, year, incomeSources, categories, budgetId } = useEditBudgetFlow();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalIncome = incomeSources.reduce((acc, s) => acc + s.amount, 0);
  const totalAllocated = categories.reduce(
    (acc, cat) =>
      acc + cat.subcategories.reduce((a, sub) => a + (Number(sub.budget) || 0), 0),
    0
  );
  const isOver = totalAllocated > totalIncome;

  async function handleSave() {
    setLoading(true);
    setError(null);
    try {
      await updateBudgetWizard(budgetId, {
        incomeSources: incomeSources.map((s) => ({ name: s.name, amount: s.amount })),
        categories: categories
          .filter((c) => c.name.trim())
          .map((c) => ({
            id: c.isNew ? undefined : c.id,
            name: c.name,
            type: c.type,
            subcategories: c.subcategories
              .filter((s) => s.name.trim())
              .map((s) => ({
                id: s.isNew ? undefined : s.id,
                name: s.name,
                budget: Number(s.budget) || 0,
              })),
          })),
      });
      router.push(`/budget/${id}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al guardar los cambios");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 flex justify-center">
      <BudgetWrapper>
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">Revisar cambios</h2>
            <span className="text-sm font-semibold text-[#0E7C8B] bg-[#0E7C8B]/10 px-3 py-1 rounded-full">
              {MONTHS[month - 1]} {year}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Confirma los cambios antes de guardar. El período no es modificable.
          </p>
        </div>

        {/* Ingresos */}
        <section className="mb-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Ingresos
          </p>
          <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm divide-y divide-slate-100">
            {incomeSources.length === 0 ? (
              <p className="px-4 py-3 text-sm text-slate-400 italic">Sin ingresos configurados.</p>
            ) : (
              incomeSources.map((src, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3">
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white ${ICON_COLORS[i % ICON_COLORS.length]}`}
                  >
                    {src.name.charAt(0).toUpperCase() || "?"}
                  </div>
                  <span className="flex-1 text-sm font-medium text-slate-700">{src.name}</span>
                  <span className="text-sm font-semibold text-slate-900">
                    ${formatCLP(src.amount)}
                  </span>
                </div>
              ))
            )}
            <div className="flex justify-between bg-slate-50 px-4 py-3">
              <span className="text-sm font-semibold text-slate-600">Total ingresos</span>
              <span className="text-sm font-bold text-[#0E7C8B]">
                ${formatCLP(totalIncome)}
              </span>
            </div>
          </div>
        </section>

        {/* Categorías */}
        <section className="mb-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Categorías y asignaciones
          </p>
          {categories.length === 0 ? (
            <p className="text-sm text-slate-400 italic">Sin categorías configuradas.</p>
          ) : (
            <div className="space-y-2">
              {categories.map((cat, i) => {
                const catTotal = cat.subcategories.reduce(
                  (a, s) => a + (Number(s.budget) || 0),
                  0
                );
                return (
                  <div
                    key={cat.id}
                    className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm"
                  >
                    <div className="flex items-center gap-3 bg-slate-50 px-4 py-2.5">
                      <div
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded text-xs font-bold text-white ${ICON_COLORS[i % ICON_COLORS.length]}`}
                      >
                        {cat.name.charAt(0).toUpperCase() || "?"}
                      </div>
                      <span className="flex-1 text-sm font-semibold text-slate-800">
                        {cat.name || "Sin nombre"}
                      </span>
                      <span className="text-xs text-slate-500">
                        {cat.type === "SAVING" ? "Ahorro" : "Gasto"}
                      </span>
                      <span className="text-sm font-semibold text-slate-800">
                        ${formatCLP(catTotal)}
                      </span>
                    </div>
                    {cat.subcategories.map((sub) => (
                      <div
                        key={sub.id}
                        className="flex items-center justify-between border-t border-slate-100 px-5 py-2.5"
                      >
                        <span className="text-sm text-slate-600">{sub.name || "Sin nombre"}</span>
                        <span className="text-sm font-medium text-slate-800">
                          ${formatCLP(Number(sub.budget) || 0)}
                        </span>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Totals summary */}
        <div className="mb-6 flex flex-col gap-2 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Total ingresos</span>
            <span className="font-semibold text-slate-800">
              ${formatCLP(totalIncome)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Total asignado</span>
            <span className={`font-semibold ${isOver ? "text-red-600" : "text-slate-800"}`}>
              ${formatCLP(totalAllocated)}
            </span>
          </div>
          <div className="flex justify-between border-t border-slate-100 pt-2 text-sm">
            <span className="font-semibold text-slate-700">Diferencia</span>
            <span
              className={`font-bold ${
                totalIncome - totalAllocated < 0 ? "text-red-600" : "text-emerald-600"
              }`}
            >
              ${formatCLP(totalIncome - totalAllocated)}
            </span>
          </div>
        </div>

        {isOver && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <span className="mt-0.5 text-amber-500">⚠️</span>
            <p className="text-sm text-amber-700">
              El total asignado supera los ingresos. Puedes guardar igual, pero considera
              redistribuir los montos.
            </p>
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.push(`/budget/${id}/edit/allocations`)}
            className="rounded-lg border border-slate-200 px-5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            ← Regresar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="rounded-lg bg-[#0E7C8B] px-6 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60"
          >
            {loading ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </BudgetWrapper>
    </main>
  );
}
