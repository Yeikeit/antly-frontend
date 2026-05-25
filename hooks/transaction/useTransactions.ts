"use client";

import { useState, useEffect } from "react";
import { getActiveBudget, ActiveBudget } from "@/lib/api/budgets";
import { getTransactions, Transaction, TransactionType } from "@/lib/api/transactions";

export type TypeFilter = "ALL" | TransactionType;

const PAGE_SIZE = 5;

export function useTransactions() {
  const [budget, setBudget] = useState<ActiveBudget | null>(null);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
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
          const txs = await getTransactions(activeBudget.id);
          setAllTransactions(txs);
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
