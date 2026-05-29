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
    type: string;
    sourceType: string;
    subcategories: Array<{ id: string; name: string }>;
  }>>("/categories");

  return data
    .filter((c) => c.sourceType === "DEFAULT" && (c.type === "EXPENSE" || c.type === "SAVING"))
    .map((c) => ({
      id: c.id,
      name: c.name,
      budget: "0",
      type: (c.type === "SAVING" ? "SAVING" : "EXPENSE") as "EXPENSE" | "SAVING",
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
          type: c.type,
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


export interface AllocationSummary {
  categoryId: string;
  categoryName: string;
  parentId: string | null;
  parentName: string | null;
  type: string;
  allocated: number;
  spent: number;
  remaining: number;
  executionPct: number;
}

export interface BudgetSummary {
  budgetId: string;
  year: number;
  month: number;
  status: string;
  totalIncomeAmount: number;
  totalAllocatedAmount: number;
  totalSpent: number;
  totalRemaining: number;
  allocations: AllocationSummary[];
}

export async function getBudgetSummary(budgetId: string): Promise<BudgetSummary> {
  return apiRequest<BudgetSummary>(`/budgets/${budgetId}/summary`);
}

export interface BudgetListItem {
  id: string;
  year: number;
  month: number;
  status: string;
  totalIncomeAmount: number;
  totalAllocatedAmount: number;
}

export async function getAllBudgets(): Promise<BudgetListItem[]> {
  return apiRequest<BudgetListItem[]>("/budgets");
}

export interface LastBudgetStructure {
  year: number;
  month: number;
  incomeSources: { name: string; amount: number }[];
  categories: {
    id: string;
    name: string;
    type: 'EXPENSE' | 'SAVING';
    subcategories: { id: string; name: string; budget: string }[];
  }[];
}

export async function getLastBudgetStructure(): Promise<LastBudgetStructure | null> {
  try {
    return await apiRequest<LastBudgetStructure>("/budgets/last-structure");
  } catch {
    return null;
  }
}

export interface UpsertAllocationDto {
  categoryId: string;
  allocatedAmount: number;
}

export async function upsertAllocation(
  budgetId: string,
  dto: UpsertAllocationDto
): Promise<void> {
  return apiRequest<void>(`/budgets/${budgetId}/allocations`, {
    method: "PUT",
    body: JSON.stringify(dto),
  });
}

export async function removeAllocation(
  budgetId: string,
  categoryId: string
): Promise<void> {
  return apiRequest<void>(`/budgets/${budgetId}/allocations/${categoryId}`, {
    method: "DELETE",
  });
}

export interface BudgetIncome {
  id: string;
  incomeSourceId: string;
  incomeSourceName: string;
  amount: number;
  receivedDate: string;
}

export async function getBudgetIncomes(budgetId: string): Promise<BudgetIncome[]> {
  const data = await apiRequest<Array<{
    id: string;
    incomeSourceId: string;
    incomeSource: { id: string; name: string };
    amount: number;
    receivedDate: string;
  }>>(`/budgets/${budgetId}/incomes`);
  return data.map((i) => ({
    id: i.id,
    incomeSourceId: i.incomeSourceId,
    incomeSourceName: i.incomeSource.name,
    amount: Number(i.amount),
    receivedDate: i.receivedDate,
  }));
}

export async function closeBudget(budgetId: string, reason: string): Promise<void> {
  await apiRequest<void>(`/budgets/${budgetId}/close`, {
    method: "PATCH",
    body: JSON.stringify({ reason }),
  });
}

export async function reopenBudget(budgetId: string): Promise<void> {
  await apiRequest<void>(`/budgets/${budgetId}/reopen`, {
    method: "PATCH",
  });
}

export async function deleteBudget(budgetId: string): Promise<void> {
  await apiRequest<void>(`/budgets/${budgetId}`, {
    method: "DELETE",
  });
}

export async function updateBudgetWizard(
  budgetId: string,
  data: {
    incomeSources: { name: string; amount: number }[];
    categories: {
      id?: string;
      name: string;
      type: "EXPENSE" | "SAVING";
      subcategories: { id?: string; name: string; budget: number }[];
    }[];
    notes?: string;
  }
): Promise<void> {
  await apiRequest<void>(`/budgets/${budgetId}/wizard`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}
