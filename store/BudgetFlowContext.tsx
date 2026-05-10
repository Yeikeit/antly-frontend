"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";

export type IncomeSource = { name: string; amount: number };
export type Subcategory = { id: string; name: string; budget: string };
export type Category = { id: string; name: string; budget: string; subcategories: Subcategory[] };

type BudgetFlowState = {
  step: number;
  month: number;
  year: number;
  incomeSources: IncomeSource[];
  categories: Category[];
  selectedCategoryId: string | null;
  setStep: (step: number) => void;
  setMonth: (month: number) => void;
  setYear: (year: number) => void;
  setIncomeSources: React.Dispatch<React.SetStateAction<IncomeSource[]>>;
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  setSelectedCategoryId: React.Dispatch<React.SetStateAction<string | null>>;
};

const BudgetFlowContext = createContext<BudgetFlowState | undefined>(undefined);

export function BudgetFlowProvider({ children }: { children: ReactNode }) {
  const now = new Date();
  const [step, setStep] = useState(1);
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [incomeSources, setIncomeSources] = useState<IncomeSource[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  return (
    <BudgetFlowContext.Provider
      value={{ step, month, year, incomeSources, categories, selectedCategoryId, setStep, setMonth, setYear, setIncomeSources, setCategories, setSelectedCategoryId }}
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
