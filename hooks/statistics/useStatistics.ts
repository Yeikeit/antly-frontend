import { useEffect, useState } from "react";
import { getAllBudgets, getBudgetSummary, type BudgetListItem, type BudgetSummary } from "@/lib/api/budgets";

export interface StatisticsState {
  allBudgets: BudgetListItem[];
  selectedBudget: BudgetListItem | null;
  summary: BudgetSummary | null;
  loadingBudgets: boolean;
  loadingSummary: boolean;
  error: string | null;
}

export function useStatistics(month: number, year: number): StatisticsState {
  const [allBudgets, setAllBudgets] = useState<BudgetListItem[]>([]);
  const [selectedBudget, setSelectedBudget] = useState<BudgetListItem | null>(null);
  const [summary, setSummary] = useState<BudgetSummary | null>(null);
  const [loadingBudgets, setLoadingBudgets] = useState(true);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoadingBudgets(true);
    getAllBudgets()
      .then((budgets) => {
        setAllBudgets(budgets);
        setError(null);
      })
      .catch(() => setError("No se pudieron cargar los presupuestos"))
      .finally(() => setLoadingBudgets(false));
  }, []);

  useEffect(() => {
    const match = allBudgets.find((b) => b.month === month && b.year === year) ?? null;
    setSelectedBudget(match);
    setSummary(null);

    if (!match) return;

    setLoadingSummary(true);
    getBudgetSummary(match.id)
      .then((data) => {
        setSummary(data);
        setError(null);
      })
      .catch(() => setError("No se pudo cargar el resumen del presupuesto"))
      .finally(() => setLoadingSummary(false));
  }, [month, year, allBudgets]);

  return { allBudgets, selectedBudget, summary, loadingBudgets, loadingSummary, error };
}
