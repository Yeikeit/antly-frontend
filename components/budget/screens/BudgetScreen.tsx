"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CategorySidebar } from "@/components/budget/CategorySidebar";
import { CategoryDetailCard } from "@/components/budget/CategoryDetailCard";
import { useBudget } from "@/hooks/budget/useBudget";
import { useBudgetFlow } from "@/store/BudgetFlowContext";
import { BudgetWrapper } from "@/components/budget/BudgetWrapper";
import StepsLayout from "@/components/ui/StepsLayout";

export default function BudgetScreen() {
  const router = useRouter();
  const { step, setStep, incomeSources } = useBudgetFlow();

  useEffect(() => { setStep(2); }, []);

  const {
    categories,
    selectedId,
    setSelectedId,
    selectedCategory,
    handleAddCategory,
    handleCategoryChange,
    handleSubChange,
    handleAddSub,
    handleRemoveSub,
    handleRemoveCategory,
  } = useBudget();

  const totalIncome = incomeSources.reduce((acc, s) => acc + s.amount, 0);
  const totalAllocated = categories.reduce(
    (acc, cat) => acc + cat.subcategories.reduce((a, sub) => a + (Number(sub.budget) || 0), 0),
    0
  );
  const remaining = totalIncome - totalAllocated;
  const isOver = remaining < 0;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 flex justify-center">
      <BudgetWrapper>
        <StepsLayout step={step} totalSteps={3} stepName="Presupuesto">
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

          {/* Bottom bar — dentro del card */}
          <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={() => router.push("/settingIncomes")}
              className="rounded-lg border border-slate-200 px-5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Regresar
            </button>

            <p className="text-sm text-slate-500">
              Presupuesto restante:{" "}
              <span className={`font-semibold ${isOver ? "text-red-600" : "text-[#0E7C8B]"}`}>
                ${remaining.toLocaleString("es-CL", { minimumFractionDigits: 2 })}
              </span>
            </p>

            <button
              type="button"
              onClick={() => router.push("/budgetConfirmation")}
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
