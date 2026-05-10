import { apiRequest } from "./client";
import type { IncomeSource, Category } from "@/store/BudgetFlowContext";


export interface ActiveBudget {
  id: string;
  year: number;
  month: number;
  status: string;
  totalIncomeAmount: number;
  totalAllocatedAmount: number;
}

interface BudgetWizardResponse { id: string }


export async function getActiveBudget(): Promise<ActiveBudget | null> {
  try {
    return await apiRequest<ActiveBudget>("/budgets/current");
  } catch {
    return null;
  }
}

export async function getDefaultCategories(): Promise<Category[]> {
  const data = await apiRequest<Array<{
    id: string;
    name: string;
    sourceType: string;
    subcategories: Array<{ id: string; name: string }>;
  }>>("/categories");

  return data
    .filter((c) => c.sourceType === "DEFAULT")
    .map((c) => ({
      id: c.id,
      name: c.name,
      budget: "0",
      subcategories: c.subcategories.map((s) => ({
        id: s.id,
        name: s.name,
        budget: "0",
      })),
    }));
}

export async function createBudgetWizard(
  incomeSources: IncomeSource[],
  categories: Category[],
  month: number,
  year: number
): Promise<BudgetWizardResponse> {
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
