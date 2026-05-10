"use client";
import { useEffect, useState } from "react";

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];
import { useRouter } from "next/navigation";
import { useBudgetFlow } from "@/store/BudgetFlowContext";
import { createBudgetWizard } from "@/lib/api/budgets";
import { BudgetWrapper } from "@/components/budget/BudgetWrapper";
import StepsLayout from "@/components/ui/StepsLayout";

const ICON_COLORS = [
  "bg-teal-500", "bg-violet-500", "bg-amber-500",
  "bg-rose-500", "bg-sky-500", "bg-emerald-500",
];

export default function BudgetConfirmationScreen() {
  const router = useRouter();
  const { step, setStep, month, year, incomeSources, categories } = useBudgetFlow();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { setStep(3); }, []);
  useEffect(() => {
    if (incomeSources.length === 0) router.replace("/settingIncomes");
  }, [incomeSources, router]);

  const totalIncome = incomeSources.reduce((acc, s) => acc + s.amount, 0);
  const totalAllocated = categories.reduce(
    (acc, cat) => acc + cat.subcategories.reduce((a, sub) => a + (Number(sub.budget) || 0), 0),
    0
  );
  const isOver = totalAllocated > totalIncome;

  async function handleConfirm() {
    setLoading(true);
    setError(null);
    try {
      await createBudgetWizard(incomeSources, categories, month, year);
      router.push("/dashboard");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al crear el presupuesto");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 flex justify-center">
      <BudgetWrapper>
          <StepsLayout step={step} totalSteps={3} stepName="Revisión">

            <div className="mb-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-900">Resumen del presupuesto</h2>
                <span className="text-sm font-semibold text-[#0E7C8B] bg-[#0E7C8B]/10 px-3 py-1 rounded-full">
                  {MONTHS[month - 1]} {year}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-500">
                Revisa que todo esté correcto antes de crear tu presupuesto.
              </p>
            </div>

            {/* Ingresos */}
            <section className="mb-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Ingresos</p>
              <div className="rounded-xl border border-slate-100 bg-white shadow-sm divide-y divide-slate-100 overflow-hidden">
                {incomeSources.map((src, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-3">
                    <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white ${ICON_COLORS[i % ICON_COLORS.length]}`}>
                      {src.name.charAt(0).toUpperCase() || "?"}
                    </div>
                    <span className="flex-1 text-sm font-medium text-slate-700">{src.name}</span>
                    <span className="text-sm font-semibold text-slate-900">
                      ${src.amount.toLocaleString("es-CL", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between px-4 py-3 bg-slate-50">
                  <span className="text-sm font-semibold text-slate-600">Total ingresos</span>
                  <span className="text-sm font-bold text-[#0E7C8B]">
                    ${totalIncome.toLocaleString("es-CL", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </section>

            {/* Categorías */}
            <section className="mb-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Categorías y asignaciones</p>
              {categories.length === 0 ? (
                <p className="text-sm text-slate-400 italic">Sin categorías configuradas.</p>
              ) : (
                <div className="space-y-2">
                  {categories.map((cat, i) => {
                    const catTotal = cat.subcategories.reduce((a, s) => a + (Number(s.budget) || 0), 0);
                    return (
                      <div key={cat.id} className="rounded-xl border border-slate-100 bg-white shadow-sm overflow-hidden">
                        <div className="flex items-center gap-3 px-4 py-3 bg-slate-50">
                          <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white ${ICON_COLORS[i % ICON_COLORS.length]}`}>
                            {cat.name.charAt(0).toUpperCase() || "?"}
                          </div>
                          <span className="flex-1 text-sm font-semibold text-slate-800">{cat.name || "Sin nombre"}</span>
                          <span className="text-sm font-semibold text-slate-700">
                            ${catTotal.toLocaleString("es-CL", { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        {cat.subcategories.length > 0 && (
                          <div className="divide-y divide-slate-100">
                            {cat.subcategories.map((sub) => (
                              <div key={sub.id} className="flex justify-between px-6 py-2.5">
                                <span className="text-sm text-slate-600">{sub.name || "Sin nombre"}</span>
                                <span className="text-sm font-medium text-slate-800">
                                  ${(Number(sub.budget) || 0).toLocaleString("es-CL", { minimumFractionDigits: 2 })}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Totals row */}
              <div className="mt-3 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <span className="text-sm font-semibold text-slate-700">Total asignado</span>
                <div className="text-right">
                  <span className={`text-sm font-bold ${isOver ? "text-red-600" : "text-slate-900"}`}>
                    ${totalAllocated.toLocaleString("es-CL", { minimumFractionDigits: 2 })}
                  </span>
                  {isOver && (
                    <p className="text-xs text-red-500">
                      Excede ingresos por ${(totalAllocated - totalIncome).toLocaleString("es-CL", { minimumFractionDigits: 2 })}
                    </p>
                  )}
                </div>
              </div>
            </section>

            {error && (
              <p className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            )}

          {/* Bottom bar — dentro del card */}
          <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={() => router.push("/budgetAllocation")}
              className="rounded-lg border border-slate-200 px-5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Regresar
            </button>

            <p className="text-sm text-slate-500">
              {isOver
                ? <span className="font-semibold text-red-600">Excede el presupuesto disponible</span>
                : <span>Disponible: <span className="font-semibold text-[#0E7C8B]">${(totalIncome - totalAllocated).toLocaleString("es-CL", { minimumFractionDigits: 2 })}</span></span>
              }
            </p>

            <button
              onClick={handleConfirm}
              disabled={loading}
              className="rounded-lg bg-[#0E7C8B] px-5 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Creando…" : "Crear presupuesto"}
            </button>
          </div>

          </StepsLayout>
        </BudgetWrapper>
    </main>
  );
}
