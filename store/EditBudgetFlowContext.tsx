"use client";
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { getBudgetSummary, getBudgetIncomes } from "@/lib/api/budgets";

export type CategoryType = "EXPENSE" | "SAVING";
export type EditIncomeSource = { name: string; amount: number };
export type EditSubcategory = { id: string; name: string; budget: string; isNew?: boolean };
export type EditCategory = {
  id: string;
  name: string;
  budget: string;
  type: CategoryType;
  subcategories: EditSubcategory[];
  isNew?: boolean;
};

type EditBudgetFlowState = {
  budgetId: string;
  month: number;
  year: number;
  incomeSources: EditIncomeSource[];
  categories: EditCategory[];
  selectedCategoryId: string | null;
  spentByCategory: Record<string, number>;
  isLoaded: boolean;
  setIncomeSources: React.Dispatch<React.SetStateAction<EditIncomeSource[]>>;
  setCategories: React.Dispatch<React.SetStateAction<EditCategory[]>>;
  setSelectedCategoryId: React.Dispatch<React.SetStateAction<string | null>>;
};

const EditBudgetFlowContext = createContext<EditBudgetFlowState | undefined>(undefined);

export function EditBudgetFlowProvider({
  budgetId,
  children,
}: {
  budgetId: string;
  children: ReactNode;
}) {
  const [month, setMonth] = useState(0);
  const [year, setYear] = useState(0);
  const [incomeSources, setIncomeSources] = useState<EditIncomeSource[]>([]);
  const [categories, setCategories] = useState<EditCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [spentByCategory, setSpentByCategory] = useState<Record<string, number>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!budgetId) return;
    Promise.all([getBudgetSummary(budgetId), getBudgetIncomes(budgetId)]).then(
      ([summary, incomes]) => {
        setMonth(summary.month);
        setYear(summary.year);

        // Build spent map for warnings
        const spent: Record<string, number> = {};
        summary.allocations.forEach((a) => {
          spent[a.categoryId] = Number(a.spent);
        });
        setSpentByCategory(spent);

        // Build categories from allocation tree
        const parentMap = new Map<string, EditCategory>();
        summary.allocations.forEach((a) => {
          const key = a.parentId ?? a.categoryId;
          if (!parentMap.has(key)) {
            parentMap.set(key, {
              id: key,
              name: a.parentName ?? a.categoryName,
              budget: "0",
              type: (a.type === "SAVING" ? "SAVING" : "EXPENSE") as CategoryType,
              subcategories: [],
            });
          }
          if (a.parentId) {
            parentMap.get(key)!.subcategories.push({
              id: a.categoryId,
              name: a.categoryName,
              budget: String(Number(a.allocated)),
            });
          }
        });
        setCategories([...parentMap.values()]);
        if (parentMap.size > 0) {
          setSelectedCategoryId([...parentMap.keys()][0]);
        }

        // Map income records to simple { name, amount }
        setIncomeSources(
          incomes.map((i) => ({ name: i.incomeSourceName, amount: i.amount }))
        );

        setIsLoaded(true);
      }
    );
  }, [budgetId]);

  return (
    <EditBudgetFlowContext.Provider
      value={{
        budgetId,
        month,
        year,
        incomeSources,
        categories,
        selectedCategoryId,
        spentByCategory,
        isLoaded,
        setIncomeSources,
        setCategories,
        setSelectedCategoryId,
      }}
    >
      {children}
    </EditBudgetFlowContext.Provider>
  );
}

export function useEditBudgetFlow() {
  const ctx = useContext(EditBudgetFlowContext);
  if (!ctx) throw new Error("useEditBudgetFlow must be used within EditBudgetFlowProvider");
  return ctx;
}
