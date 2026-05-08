import { apiRequest } from "./client";
import type { IncomeSource, Category } from "@/store/BudgetFlowContext";

interface CreatedBudget { id: string }
interface CreatedIncomeSource { id: string }
interface CreatedCategory { id: string }

export async function createBudgetWizard(
  incomeSources: IncomeSource[],
  categories: Category[]
): Promise<void> {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  // 1. Create the budget
  const budget = await apiRequest<CreatedBudget>("/budgets", {
    method: "POST",
    body: JSON.stringify({ year, month }),
  });

  // 2. Create income sources + incomes in parallel
  await Promise.all(
    incomeSources.map(async (src) => {
      const source = await apiRequest<CreatedIncomeSource>("/income-sources", {
        method: "POST",
        body: JSON.stringify({ name: src.name }),
      });
      await apiRequest("/incomes", {
        method: "POST",
        body: JSON.stringify({
          budgetId: budget.id,
          incomeSourceId: source.id,
          amount: src.amount,
          receivedDate: now.toISOString().split("T")[0],
        }),
      });
    })
  );

  // 3. Create categories, subcategories, and allocations sequentially per parent
  for (const cat of categories) {
    if (!cat.name.trim()) continue;

    const parent = await apiRequest<CreatedCategory>("/categories", {
      method: "POST",
      body: JSON.stringify({ name: cat.name, type: "EXPENSE" }),
    });

    for (const sub of cat.subcategories) {
      if (!sub.name.trim()) continue;

      const subCat = await apiRequest<CreatedCategory>(
        `/categories/${parent.id}/subcategories`,
        {
          method: "POST",
          body: JSON.stringify({ name: sub.name }),
        }
      );

      if (sub.budget && Number(sub.budget) > 0) {
        await apiRequest(`/budgets/${budget.id}/allocations`, {
          method: "POST",
          body: JSON.stringify({
            categoryId: subCat.id,
            allocatedAmount: Number(sub.budget),
          }),
        });
      }
    }
  }
}
