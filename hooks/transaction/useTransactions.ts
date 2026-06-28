"use client";

import { useState, useEffect, useCallback } from "react";
import { getActiveBudget, ActiveBudget } from "@/lib/api/budgets";
import { getTransactions, updateTransaction, deleteTransaction, Transaction, TransactionType } from "@/lib/api/transactions";
import { getIncomes, updateIncome, deleteIncome, type Income as BudgetIncome } from "@/lib/api/incomes";

export type TypeFilter = "ALL" | TransactionType;
export type SortOrder = "desc" | "asc";
export type TransactionRow = Transaction & { incomeSource?: BudgetIncome["incomeSource"] };

export interface UpdatePayload {
  amount: number;
  description?: string;
  transactionDate: string;
  categoryId?: string;      
  incomeSourceId?: string;  
}

const PAGE_SIZE = 15;

export function useTransactions() {
  const [budget, setBudget] = useState<ActiveBudget | null>(null);
  const [allTransactions, setAllTransactions] = useState<TransactionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("ALL");
  // categoryIds: array de IDs a filtrar (subcategorías o fuentes); vacío = sin filtro
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
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
          ].sort((a, b) => {
            const aTime = new Date(a.transactionDate).getTime();
            const bTime = new Date(b.transactionDate).getTime();
            return bTime - aTime;
          }));
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
    const matchesCategory = categoryIds.length === 0 || categoryIds.includes(tx.categoryId);
    const matchesSearch = !searchQuery || (tx.description ?? "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesCategory && matchesSearch;
  });

  const sorted = [...filtered].sort((a, b) => {
    const aDate = new Date(a.transactionDate).getTime();
    const bDate = new Date(b.transactionDate).getTime();
    if (aDate !== bDate) {
      return sortOrder === "desc" ? bDate - aDate : aDate - bDate;
    }
    // Mismo día: desempatar por hora de creación
    const aCreated = new Date(a.createdAt).getTime();
    const bCreated = new Date(b.createdAt).getTime();
    return sortOrder === "desc" ? bCreated - aCreated : aCreated - bCreated;
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const paginated = sorted.slice(start, start + PAGE_SIZE);

  const handleSearchQuery = useCallback((q: string) => {
    setSearchQuery(q);
    setPage(1);
  }, []);

  const handleTypeFilter = useCallback((value: TypeFilter) => {
    setTypeFilter(value);
    setCategoryIds([]);
    setPage(1);
  }, []);

  const handleCategoryIds = useCallback((ids: string[]) => {
    setCategoryIds(ids);
    setPage(1);
  }, []);

  const goToPage = useCallback((p: number) => {
    setPage((prev) => (p >= 1 ? p : prev));
  }, []);

  const handleSortOrder = useCallback((order: SortOrder) => {
    setSortOrder(order);
    setPage(1);
  }, []);

  const deleteRow = useCallback(async (tx: TransactionRow) => {
    if (!budget) return;
    if (tx.type === "INCOME") {
      await deleteIncome(budget.id, tx.id);
    } else {
      await deleteTransaction(budget.id, tx.id);
    }
    
    try {
      const [txs, incomes] = await Promise.all([
        getTransactions(budget.id),
        getIncomes(budget.id),
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
      ].sort((a, b) => {
        const aTime = new Date(a.transactionDate).getTime();
        const bTime = new Date(b.transactionDate).getTime();
        return bTime - aTime;
      }));
    } catch (error) {
      console.error("Error recargando transacciones:", error);
    }
  }, [budget]);

  const updateRow = useCallback(async (tx: TransactionRow, payload: UpdatePayload) => {
    if (!budget) return;
    if (tx.type === "INCOME") {
      await updateIncome(budget.id, tx.id, {
        incomeSourceId: payload.incomeSourceId,
        amount: payload.amount,
        receivedDate: payload.transactionDate,
        description: payload.description,
      });
    } else {
      await updateTransaction(budget.id, tx.id, {
        categoryId: payload.categoryId,
        amount: payload.amount,
        transactionDate: payload.transactionDate,
        description: payload.description,
      });
    }
    
    try {
      const [txs, incomes] = await Promise.all([
        getTransactions(budget.id),
        getIncomes(budget.id),
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
      ].sort((a, b) => {
        const aTime = new Date(a.transactionDate).getTime();
        const bTime = new Date(b.transactionDate).getTime();
        return bTime - aTime;
      }));
    } catch (error) {
      console.error("Error recargando transacciones:", error);
    }
  }, [budget]);

  const startEntry = sorted.length === 0 ? 0 : start + 1;
  const endEntry = Math.min(start + PAGE_SIZE, sorted.length);

  return {
    budget,
    transactions: paginated,
    allTransactions,
    totalFiltered: sorted.length,
    loading,
    typeFilter,
    setTypeFilter: handleTypeFilter,
    categoryIds,
    setCategoryIds: handleCategoryIds,
    searchQuery,
    setSearchQuery: handleSearchQuery,
    sortOrder,
    setSortOrder: handleSortOrder,
    page,
    setPage: goToPage,
    totalPages,
    startEntry,
    endEntry,
    deleteRow,
    updateRow,
  };
}
