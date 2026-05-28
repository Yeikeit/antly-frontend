"use client";

import { useState, useEffect } from "react";
import { getActiveBudget } from "@/lib/api/budgets";
import { getTransactions } from "@/lib/api/transactions";
import { getIncomes } from "@/lib/api/incomes";

type RecentTransaction = {
  id: string;
  name: string;
  category: string;
  dateLabel: string;
  amount: string;
  isIncome: boolean;
};

function getRelativeDateLabel(dateStr: string): string {
  const [year, month, day] = dateStr.split("T")[0].split("-").map(Number);
  const txDate = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  txDate.setHours(0, 0, 0, 0);
  const diffDays = Math.floor((today.getTime() - txDate.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Hoy";
  if (diffDays === 1) return "Ayer";
  return txDate.toLocaleDateString("es-CL", { month: "short", day: "2-digit" });
}

export function useRecentTransactions() {
  const [transactions, setTransactions] = useState<RecentTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const activeBudget = await getActiveBudget();
        if (activeBudget) {
          const [txs, incomes] = await Promise.all([
            getTransactions(activeBudget.id),
            getIncomes(activeBudget.id),
          ]);

          type Row = { id: string; date: string; createdAt: string; name: string; category: string; amount: number; isIncome: boolean };

          const expenseRows: Row[] = txs.map((tx) => ({
            id: tx.id,
            date: tx.transactionDate,
            createdAt: tx.createdAt,
            name: tx.description || "Sin descripción",
            category: tx.categoryId,
            amount: tx.amount,
            isIncome: tx.type === "INCOME",
          }));

          const incomeRows: Row[] = incomes.map((inc) => ({
            id: inc.id,
            date: inc.receivedDate,
            createdAt: inc.createdAt,
            name: inc.description || "Sin descripción",
            category: inc.incomeSource?.name ?? "Fuente de ingreso",
            amount: inc.amount,
            isIncome: true,
          }));

          const recent = [...expenseRows, ...incomeRows]
            .sort((a, b) => {
              const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
              if (dateDiff !== 0) return dateDiff;
              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            })
            .slice(0, 5)
            .map((row) => ({
              id: row.id,
              name: row.name,
              category: row.category,
              dateLabel: getRelativeDateLabel(row.date),
              amount: `${row.isIncome ? "+" : "-"}$${Math.abs(row.amount).toLocaleString()}`,
              isIncome: row.isIncome,
            }));

          setTransactions(recent);
        }
      } catch (error) {
        console.error("Error al cargar transacciones recientes:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return { transactions, loading };
}
