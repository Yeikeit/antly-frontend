"use client";

import { useState, useEffect } from "react";

type Transaction = {
  name: string;
  category: string;
  date: string;
  amount: string;
  positive?: boolean;
};

const mockTransactions: Transaction[] = [
  { name: "Lider", category: "Supermercado • Hoy", date: "Hoy", amount: "-$84.500" },
  { name: "Sueldo", category: "Ingreso • Ayer", date: "Ayer", amount: "+$2.800.000", positive: true },
  { name: "Starbucks", category: "Café • 10 May", date: "10 May", amount: "-$5.400" },
  { name: "Shell", category: "Transporte • 10 May", date: "10 May", amount: "-$42.000" },
];

export function useRecentTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    // Simula fetch
    setTimeout(() => setTransactions(mockTransactions), 500);
  }, []);

  return { transactions, loading: transactions.length === 0 };
}