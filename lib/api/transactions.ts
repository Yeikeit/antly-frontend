import { apiRequest } from "./client";

export type TransactionType = "EXPENSE" | "INCOME" | "SAVING";

export interface CreateTransactionDto {
  categoryId: string;
  type: TransactionType;
  amount: number;
  transactionDate: string; // YYYY-MM-DD
  description?: string;
}

export interface Transaction {
  id: string;
  userId: string;
  budgetId: string;
  categoryId: string;
  amount: number;
  type: TransactionType;
  transactionDate: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateTransactionDto {
  categoryId?: string;
  type?: TransactionType;
  amount?: number;
  transactionDate?: string;
  description?: string;
}

export async function createTransaction(
  budgetId: string,
  dto: CreateTransactionDto
): Promise<Transaction> {
  return apiRequest<Transaction>(`/budgets/${budgetId}/transactions`, {
    method: "POST",
    body: JSON.stringify(dto),
  });
}


export async function getTransactions(budgetId: string): Promise<Transaction[]> {
  return apiRequest<Transaction[]>(`/budgets/${budgetId}/transactions`, {
    method: "GET",
  });
}

export async function updateTransaction(
  budgetId: string,
  id: string,
  dto: UpdateTransactionDto
): Promise<Transaction> {
  return apiRequest<Transaction>(`/budgets/${budgetId}/transactions/${id}`, {
    method: "PATCH",
    body: JSON.stringify(dto),
  });
}

export async function deleteTransaction(
  budgetId: string,
  id: string
): Promise<void> {
  return apiRequest<void>(`/budgets/${budgetId}/transactions/${id}`, {
    method: "DELETE",
  });
}
