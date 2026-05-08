import { useState } from "react";
import { useBudgetFlow, type IncomeSource } from "@/store/BudgetFlowContext";

export function useIncomeSources() {
  const { incomeSources, setIncomeSources } = useBudgetFlow();
  const [showForm, setShowForm] = useState(false);

  function addSource(source: IncomeSource) {
    setIncomeSources((prev) => [...prev, source]);
    setShowForm(false);
  }

  function removeSource(index: number) {
    setIncomeSources((prev) => prev.filter((_, i) => i !== index));
  }

  const total = incomeSources.reduce((acc, curr) => acc + curr.amount, 0);

  return { sources: incomeSources, addSource, removeSource, total, showForm, setShowForm };
}
