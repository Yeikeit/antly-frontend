"use client";

import { useState, useEffect } from "react";
import { getActiveBudget, ActiveBudget } from "@/lib/api/budgets";
import { getTransactions, Transaction, TransactionType } from "@/lib/api/transactions";
import { getIncomes, type Income as BudgetIncome } from "@/lib/api/incomes";

export type TypeFilter = "ALL" | TransactionType;
export type TransactionRow = Transaction & { incomeSource?: BudgetIncome["incomeSource"] };

const PAGE_SIZE = 5;

export function useTransactions() {
  const [budget, setBudget] = useState<ActiveBudget | null>(null);
  const [allTransactions, setAllTransactions] = useState<TransactionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const activeBudget = await getActiveBudget();
        setBudget(activeBudget);
        if (activeBudget) {
          const [txs, incomes] = await Promise.all([
            getTransactions(activeBudget.id),
            getIncomes(activeBudget.id),
          ]);

          const incomeRows: TransactionRow[] = incomes.map((income) => ({
            id: income.id,
            userId: income.userId,
            budgetId: income.budgetId,
            categoryId: income.incomeSourceId,
            amount: income.amount,
            type: "INCOME",
            transactionDate: income.receivedDate,
            description: income.description ?? null,
            createdAt: income.createdAt,
            updatedAt: income.updatedAt,
            incomeSource: income.incomeSource,
          }));

          setAllTransactions([
            ...txs,
            ...incomeRows,
          ].sort((a, b) => b.transactionDate.localeCompare(a.transactionDate)));
        }
      } catch (error) {
        console.error("Error al cargar transacciones:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filtered = allTransactions.filter((tx) => {
    const matchesType = typeFilter === "ALL" || tx.type === typeFilter;
    const matchesCategory = categoryFilter === "" || tx.categoryId === categoryFilter;
    return matchesType && matchesCategory;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const paginated = filtered.slice(start, start + PAGE_SIZE);

  function handleTypeFilter(value: TypeFilter) {
    setTypeFilter(value);
    setPage(1);
  }

  function handleCategoryFilter(value: string) {
    setCategoryFilter(value);
    setPage(1);
  }

  function goToPage(p: number) {
    if (p >= 1 && p <= totalPages) {
      setPage(p);
    }
  }

  const startEntry = filtered.length === 0 ? 0 : start + 1;
  const endEntry = Math.min(start + PAGE_SIZE, filtered.length);

  return {
    budget,
    transactions: paginated,
    totalFiltered: filtered.length,
    loading,
    typeFilter,
    setTypeFilter: handleTypeFilter,
    categoryFilter,
    setCategoryFilter: handleCategoryFilter,
    page,
    setPage: goToPage,
    totalPages,
    startEntry,
    endEntry,
  };
}
