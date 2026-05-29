import { useCallback, useEffect, useState } from "react";
import { getBudgetSummary, BudgetSummary } from "@/lib/api/budgets";

export function useBudgetSummary(budgetId: string | undefined) {
  const [summary, setSummary] = useState<BudgetSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

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
  }, [budgetId, tick]);

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  return { summary, loading, error, refresh };
}