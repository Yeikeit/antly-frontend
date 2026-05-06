"use client";

import { useIncomeSteps } from "@/store/incomeStepContex";
import { ProgressBar } from "@/components/ui/ProgressBar";

export default function StepsLayout({ children }: { children: React.ReactNode }) {
  const { step } = useIncomeSteps();
  const totalSteps = 3;

  return (
    <>
      <ProgressBar step={step} totalSteps={totalSteps} />
      {children}
    </>
  );
}