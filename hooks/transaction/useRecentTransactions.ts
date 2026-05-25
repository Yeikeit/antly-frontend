"use client";

import { useState, useEffect } from "react";
import { getActiveBudget } from "@/lib/api/budgets";
import { getTransactions, Transaction } from "@/lib/api/transactions";

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
  const txDate = new Date(year, month - 1, day); // Crea la fecha en zona horaria local
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  txDate.setHours(0, 0, 0, 0);

  const diffTime = today.getTime() - txDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

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
          const txs = await getTransactions(activeBudget.id);
          // Tomar las últimas 4 transacciones (ordenadas más recientes primero)
          const recent = txs
            .sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime())
            .slice(0, 4)
            .map((tx) => ({
              id: tx.id,
              name: tx.description || "Sin descripción",
              category: tx.categoryId, // Por ahora el ID, se mapea en el componente
              dateLabel: getRelativeDateLabel(tx.transactionDate),
              amount: `${tx.type === "INCOME" ? "+" : "-"}$${Math.abs(tx.amount).toLocaleString()}`,
              isIncome: tx.type === "INCOME",
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