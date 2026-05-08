"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";

export type IncomeSource = { name: string; amount: number };
export type Subcategory = { id: string; name: string; budget: string };
export type Category = { id: string; name: string; budget: string; subcategories: Subcategory[] };

type BudgetFlowState = {
  step: number;
  incomeSources: IncomeSource[];
  categories: Category[];
  selectedCategoryId: string | null;
  setStep: (step: number) => void;
  setIncomeSources: React.Dispatch<React.SetStateAction<IncomeSource[]>>;
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  setSelectedCategoryId: React.Dispatch<React.SetStateAction<string | null>>;
};

const BudgetFlowContext = createContext<BudgetFlowState | undefined>(undefined);

export function BudgetFlowProvider({ children }: { children: ReactNode }) {
  const [step, setStep] = useState(1);
  const [incomeSources, setIncomeSources] = useState<IncomeSource[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  return (
    <BudgetFlowContext.Provider
      value={{ step, incomeSources, categories, selectedCategoryId, setStep, setIncomeSources, setCategories, setSelectedCategoryId }}
    >
      {children}
    </BudgetFlowContext.Provider>
  );
}

export function useBudgetFlow() {
  const ctx = useContext(BudgetFlowContext);
  if (!ctx) throw new Error("useBudgetFlow must be used within BudgetFlowProvider");
  return ctx;
}
