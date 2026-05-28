import { apiRequest } from "./client";

export interface IncomeSource {
  id: string;
  name: string;
  userId: string;
  isActive: boolean;
  createdAt: string;
}

export interface Income {
  id: string;
  userId: string;
  budgetId: string;
  incomeSourceId: string;
  amount: number;
  receivedDate: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  incomeSource: IncomeSource;
}

export interface CreateIncomeSourceDto {
  name: string;
}

export interface CreateIncomeDto {
  incomeSourceId: string;
  budgetId: string;
  amount: number;
  receivedDate: string;
  description?: string;
}



export async function getIncomeSources(): Promise<IncomeSource[]> {
  return apiRequest<IncomeSource[]>("/income-sources", {
    method: "GET",
  });
}

export async function createIncomeSource(
  dto: CreateIncomeSourceDto
): Promise<IncomeSource> {
  return apiRequest<IncomeSource>("/income-sources", {
    method: "POST",
    body: JSON.stringify(dto),
  });
}



export async function createIncome(
  budgetId: string,
  dto: CreateIncomeDto
): Promise<Income> {
  return apiRequest<Income>(`/budgets/${budgetId}/incomes`, {
    method: "POST",
    body: JSON.stringify(dto),
  });
}

export async function getIncomes(budgetId: string): Promise<Income[]> {
  return apiRequest<Income[]>(`/budgets/${budgetId}/incomes`, {
    method: "GET",
  });
}
