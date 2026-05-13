import { useEffect, useState } from "react";
import { getBudgetSummary, BudgetSummary } from "@/lib/api/budgets";

export function useBudgetSummary(budgetId: string | undefined) {
  const [summary, setSummary] = useState<BudgetSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!budgetId) return;
    setLoading(true);
    getBudgetSummary(budgetId)
      .then((data) => {
        setSummary(data);
        setError(null);
      })
      .catch(() => {
        setError("No se pudo cargar el resumen");
        setSummary(null);
      })
      .finally(() => setLoading(false));
  }, [budgetId]);

  return { summary, loading, error };
}