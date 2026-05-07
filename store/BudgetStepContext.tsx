"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";

type Subcategory = {
  id: string;
  name: string;
  budget: string;
};

type BudgetStepsData = {
  categoryId?: string;
  categoryName: string;
  categoryBudget: string;
  subcategories: Subcategory[];
};

type BudgetStepsContextType = {
  data: BudgetStepsData;
  setData: (data: BudgetStepsData) => void;
  step: number;
  setStep: (step: number) => void;
};

const BudgetStepsContext = createContext<BudgetStepsContextType | undefined>(undefined);

export const BudgetStepsProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<BudgetStepsData>({
    categoryName: "",
    categoryBudget: "",
    subcategories: [],
  });
  const [step, setStep] = useState(2);

  return (
    <BudgetStepsContext.Provider value={{ data, setData, step, setStep }}>
      {children}
    </BudgetStepsContext.Provider>
  );
};

export const useBudgetSteps = () => {
  const context = useContext(BudgetStepsContext);
  if (!context) throw new Error("useBudgetSteps must be used within BudgetStepsProvider");
  return context;
};