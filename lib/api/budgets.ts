import { apiRequest } from "./client";
import type { IncomeSource, Category } from "@/store/BudgetFlowContext";

interface BudgetWizardResponse { id: string }

export async function createBudgetWizard(
  incomeSources: IncomeSource[],
  categories: Category[]
): Promise<BudgetWizardResponse> {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  return apiRequest<BudgetWizardResponse>("/budgets/wizard", {
    method: "POST",
    body: JSON.stringify({
      year,
      month,
      incomeSources: incomeSources.map((s) => ({
        name: s.name,
        amount: s.amount,
      })),
      categories: categories
        .filter((c) => c.name.trim())
        .map((c) => ({
          name: c.name,
          subcategories: c.subcategories
            .filter((s) => s.name.trim())
            .map((s) => ({
              name: s.name,
              budget: Number(s.budget),
            })),
        })),
    }),
  });
}
