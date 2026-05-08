"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";

type IncomeStepsData = {
  amount?: number;
  source?: string;
};

type IncomeStepsContextType = {
  data: IncomeStepsData;
  setData: (data: IncomeStepsData) => void;
  step: number;
  setStep: (step: number) => void;
};

const IncomeStepsContext = createContext<IncomeStepsContextType | undefined>(undefined);

export const IncomeStepsProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<IncomeStepsData>({});
  const [step, setStep] = useState(1);

  return (
    <IncomeStepsContext.Provider value={{ data, setData, step, setStep }}>
      {children}
    </IncomeStepsContext.Provider>
  );
};

export const useIncomeSteps = () => {
  const context = useContext(IncomeStepsContext);
  if (!context) throw new Error("useIncomeSteps must be used within IncomeStepsProvider");
  return context;
};