"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useBudgetFlow } from "@/store/BudgetFlowContext";
import { useBudget } from "@/hooks/budget/useBudget";
import { useIncomeSources } from "@/hooks/income/useIncomeSources";
import { getDefaultCategories, getLastBudgetStructure, createBudgetWizard, getAllBudgets } from "@/lib/api/budgets";
import { MonthYearPicker } from "@/components/ui/MonthYearPicker";
import { CategorySidebar } from "@/components/budget/CategorySidebar";
import { CategoryDetailCard } from "@/components/budget/CategoryDetailCard";
import { BudgetWrapper } from "@/components/budget/BudgetWrapper";
import { IncomeCard } from "@/components/income/IncomeCard";
import { IncomeSourceList } from "@/components/income/incomeSourceList";
import { IncomeSourceForm } from "@/components/income/IncomeSourceForm";
import { AddSourceButton } from "@/components/income/AddSourceButton";
import StepsLayout from "@/components/ui/StepsLayout";
import Loader from "@/components/ui/Loader";

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const ICON_COLORS = [
  "bg-teal-500", "bg-violet-500", "bg-amber-500",
  "bg-rose-500", "bg-sky-500", "bg-emerald-500",
];

// Step 0: chooser
function ChooserStep({
  month, year, onMonthYear, onFromScratch, onCopyLast, loading, existingBudget,
}: {
  month: number; year: number;
  onMonthYear: (m: number, y: number) => void;
  onFromScratch: () => void;
  onCopyLast: () => void;
  loading: boolean;
  existingBudget: boolean;
}) {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-4">
        <Link href="/dashboard" className="text-sm text-slate-500 hover:text-slate-900">
          ← Volver al dashboard
        </Link>
      </div>

      <div className="mb-8 rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
        <p className="mb-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-400">
          ¿Para qué mes vas a crear tu presupuesto?
        </p>
        <MonthYearPicker month={month} year={year} onChange={onMonthYear} />
      </div>

      {existingBudget && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <span className="mt-0.5 text-amber-500">⚠️</span>
          <p className="text-sm text-amber-800">
            Ya existe un presupuesto para <strong>{MONTHS[month - 1]} {year}</strong>. Si continúas y confirmas, el sistema rechazará la creación. Elige otro mes o edita el presupuesto existente.
          </p>
        </div>
      )}

      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold text-slate-900">¿Cómo quieres empezar?</h1>
        <p className="mt-2 text-sm text-slate-600">
          Puedes copiar la estructura del mes anterior o empezar desde cero.
        </p>
      </div>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <button
          type="button"
          onClick={onCopyLast}
          disabled={loading}
          className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-[#0E7C8B] hover:shadow-md text-left disabled:opacity-60 disabled:cursor-wait"
        >
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#0E7C8B]/10 text-[#0E7C8B] text-lg">
            📋
          </div>
          <h2 className="text-lg font-semibold text-slate-900">
            {loading ? "Cargando…" : "Copiar mes anterior"}
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Precarga las mismas fuentes de ingreso, categorías y montos asignados del último presupuesto. Solo ajusta lo que cambió.
          </p>
        </button>

        <button
          type="button"
          onClick={onFromScratch}
          disabled={loading}
          className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md text-left disabled:opacity-60"
        >
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 text-lg">
            ✦
          </div>
          <h2 className="text-lg font-semibold text-slate-900">Empezar desde cero</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Comienza con las categorías por defecto o en blanco. Ideal para rediseñar tu presupuesto.
          </p>
        </button>
      </section>
    </div>
  );
}

// Step 1: incomes
function IncomesStep({ onBack, onNext }: { onBack: () => void; onNext: () => void }) {
  const { sources, addSource, removeSource, total, showForm, setShowForm } = useIncomeSources();

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <BudgetWrapper>
        <StepsLayout step={1} totalSteps={3} stepName="Ingresos">
          <IncomeCard
            title="¿De dónde provienen tus ingresos?"
            subtitle="Añade tus fuentes de ingresos para este mes."
          >
            <IncomeSourceList sources={sources} onRemove={removeSource} />
            {showForm ? (
              <IncomeSourceForm onSubmit={addSource} onCancel={() => setShowForm(false)} />
            ) : (
              <AddSourceButton onClick={() => setShowForm(true)} />
            )}
            <div className="mt-5 flex items-end justify-between">
              <div>
                <p className="text-xs text-slate-500">Ingreso Total Estimado</p>
                <p className="text-2xl font-bold text-[#0E7C8B]">
                  ${total.toLocaleString("es-CL", { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onBack}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  ← Regresar
                </button>
                <button
                  type="button"
                  onClick={onNext}
                  disabled={sources.length === 0}
                  className="rounded-lg bg-[#0E7C8B] px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50"
                >
                  Continuar →
                </button>
              </div>
            </div>
          </IncomeCard>
        </StepsLayout>
      </BudgetWrapper>
    </div>
  );
}

// Step 2: allocation
function AllocationStep({ onBack, onNext }: { onBack: () => void; onNext: () => void }) {
  const { incomeSources } = useBudgetFlow();
  const {
    categories, selectedId, setSelectedId, selectedCategory,
    handleAddCategory, handleCategoryChange, handleTypeChange,
    handleSubChange, handleAddSub, handleRemoveSub, handleRemoveCategory,
  } = useBudget();

  const totalIncome = incomeSources.reduce((acc, s) => acc + s.amount, 0);
  const totalAllocated = categories.reduce(
    (acc, cat) => acc + cat.subcategories.reduce((a, sub) => a + (Number(sub.budget) || 0), 0), 0
  );
  const remaining = totalIncome - totalAllocated;

  return (
    <main className="min-h-[60vh] bg-slate-50 px-4 py-6 flex justify-center">
      <BudgetWrapper>
        <StepsLayout step={2} totalSteps={3} stepName="Presupuesto">
          <div className="flex w-full gap-6">
            <CategorySidebar
              categories={categories}
              selectedId={selectedId ?? ""}
              onSelect={setSelectedId}
              onAddCategory={handleAddCategory}
              onRemoveCategory={handleRemoveCategory}
            />
            <div className="flex-1">
              {selectedCategory ? (
                <CategoryDetailCard
                  category={selectedCategory}
                  onCategoryChange={handleCategoryChange}
                  onTypeChange={handleTypeChange}
                  onSubChange={handleSubChange}
                  onAddSub={handleAddSub}
                  onRemoveSub={handleRemoveSub}
                />
              ) : (
                <div className="flex h-full items-center justify-center rounded-xl border-2 border-dashed border-slate-200 p-12 text-sm text-slate-400">
                  Selecciona o crea una categoría para comenzar
                </div>
              )}
            </div>
          </div>
          <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onBack}
              className="rounded-lg border border-slate-200 px-5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Regresar
            </button>
            <p className="text-sm text-slate-500">
              Restante:{" "}
              <span className={`font-semibold ${remaining < 0 ? "text-red-600" : "text-[#0E7C8B]"}`}>
                ${remaining.toLocaleString("es-CL", { minimumFractionDigits: 2 })}
              </span>
            </p>
            <button
              type="button"
              onClick={onNext}
              className="rounded-lg bg-[#0E7C8B] px-5 py-2 text-sm font-semibold text-white hover:bg-teal-700"
            >
              Continuar →
            </button>
          </div>
        </StepsLayout>
      </BudgetWrapper>
    </main>
  );
}

// Step 3: confirmation
function ConfirmationStep({ onBack }: { onBack: () => void }) {
  const router = useRouter();
  const { month, year, incomeSources, categories } = useBudgetFlow();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalIncome = incomeSources.reduce((acc, s) => acc + s.amount, 0);
  const totalAllocated = categories.reduce(
    (acc, cat) => acc + cat.subcategories.reduce((a, sub) => a + (Number(sub.budget) || 0), 0), 0
  );

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
    <main className="min-h-[60vh] bg-slate-50 px-4 py-6 flex justify-center">
      <BudgetWrapper>
        <StepsLayout step={3} totalSteps={3} stepName="Revisión">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">Resumen del presupuesto</h2>
            <span className="text-sm font-semibold text-[#0E7C8B] bg-[#0E7C8B]/10 px-3 py-1 rounded-full">
              {MONTHS[month - 1]} {year}
            </span>
          </div>

          {/* Ingresos */}
          <section className="mb-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Ingresos</p>
            <div className="rounded-xl border border-slate-100 bg-white shadow-sm divide-y divide-slate-100 overflow-hidden">
              {incomeSources.map((src, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3">
                  <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white ${ICON_COLORS[i % ICON_COLORS.length]}`}>
                    {src.name.charAt(0).toUpperCase()}
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
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Categorías</p>
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
                        <span className="flex-1 text-sm font-semibold text-slate-800">{cat.name}</span>
                        <span className="text-sm font-semibold text-slate-700">
                          ${catTotal.toLocaleString("es-CL", { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      {cat.subcategories.map((sub) => (
                        <div key={sub.id} className="flex justify-between px-6 py-2.5 border-t border-slate-100">
                          <span className="text-sm text-slate-600">{sub.name}</span>
                          <span className="text-sm font-medium text-slate-800">
                            ${(Number(sub.budget) || 0).toLocaleString("es-CL", { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-4">
            <button
              type="button"
              onClick={onBack}
              className="rounded-lg border border-slate-200 px-5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Regresar
            </button>
            <div className="flex flex-col items-end gap-1">
              {error && <p className="text-xs text-red-500">{error}</p>}
              <button
                type="button"
                onClick={handleConfirm}
                disabled={loading}
                className="rounded-lg bg-[#0E7C8B] px-6 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60"
              >
                {loading ? "Creando…" : "Confirmar y crear presupuesto"}
              </button>
            </div>
          </div>
        </StepsLayout>
      </BudgetWrapper>
    </main>
  );
}

// Main page — orchestrates steps
export default function NewBudgetPage() {
  const { month, year, setMonth, setYear, setIncomeSources, setCategories } = useBudgetFlow();
  const [step, setStep] = useState(0);
  const [loadingCopy, setLoadingCopy] = useState(false);
  const [existingMonths, setExistingMonths] = useState<Set<string>>(new Set());

  // On mount: default to next month + load existing budgets for duplicate check
  useEffect(() => {
    const now = new Date();
    const nextMonth = now.getMonth() + 2; // getMonth() is 0-based, +1 = current, +2 = next
    const nextYear = nextMonth > 12 ? now.getFullYear() + 1 : now.getFullYear();
    setMonth(nextMonth > 12 ? 1 : nextMonth);
    setYear(nextYear);

    getAllBudgets()
      .then((list) => {
        const keys = new Set(list.map((b) => `${b.year}-${b.month}`));
        setExistingMonths(keys);
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const existingBudget = existingMonths.has(`${year}-${month}`);

  function handleMonthYear(m: number, y: number) {
    setMonth(m);
    setYear(y);
  }

  async function handleFromScratch() {
    try {
      const defaults = await getDefaultCategories();
      setCategories(defaults);
    } catch {
      setCategories([]);
    }
    setIncomeSources([]);
    setStep(1);
  }

  async function handleCopyLast() {
    setLoadingCopy(true);
    try {
      const last = await getLastBudgetStructure();
      if (last) {
        setIncomeSources(last.incomeSources);
        setCategories(
          last.categories.map((cat) => ({
            ...cat,
            budget: "0",
            type: (cat.type === "SAVING" ? "SAVING" : "EXPENSE") as "EXPENSE" | "SAVING",
            subcategories: cat.subcategories.map((sub) => ({ ...sub })),
          }))
        );
      } else {
        // No previous budget, fall back to template
        const defaults = await getDefaultCategories();
        setCategories(defaults);
        setIncomeSources([]);
      }
    } catch {
      setCategories([]);
      setIncomeSources([]);
    } finally {
      setLoadingCopy(false);
    }
    setStep(1);
  }

  if (step === 0) {
    return (
      <ChooserStep
        month={month}
        year={year}
        onMonthYear={handleMonthYear}
        onFromScratch={handleFromScratch}
        onCopyLast={handleCopyLast}
        loading={loadingCopy}
        existingBudget={existingBudget}
      />
    );
  }
  if (step === 1) return <IncomesStep onBack={() => setStep(0)} onNext={() => setStep(2)} />;
  if (step === 2) return <AllocationStep onBack={() => setStep(1)} onNext={() => setStep(3)} />;
  return <ConfirmationStep onBack={() => setStep(2)} />;
}
