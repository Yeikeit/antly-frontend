"use client";

import { CategorySidebar } from "@/components/budget/CategorySidebar";
import { CategoryDetailCard } from "@/components/budget/CategoryDetailCard";
import { useBudget } from "@/hooks/budget/useBudget";
import { BudgetWrapper } from "@/components/budget/BudgetWrapper";
import StepsLayout from "@/components/ui/StepsLayout";


export default function BudgetScreen() {
    const step = 2;
    const totalSteps = 3;

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
  } = useBudget();

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 flex justify-center">

      <BudgetWrapper>
    <StepsLayout step={step} totalSteps={totalSteps}>

      <div className="flex w-full max-w-5xl gap-6">
        <CategorySidebar
          categories={categories}
          selectedId={selectedId ?? ""}
          onSelect={setSelectedId}
          onAddCategory={handleAddCategory}
        />
        <section className="flex-1">
          {selectedCategory && (
            <CategoryDetailCard
              category={selectedCategory}
              onCategoryChange={handleCategoryChange}
              onSubChange={handleSubChange}
              onAddSub={handleAddSub}
              onRemoveSub={handleRemoveSub}
            />
          )}
        </section>
      </div>
        </StepsLayout>

      </BudgetWrapper>
    </main>
  );
}