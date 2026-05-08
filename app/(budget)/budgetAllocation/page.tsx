import { BudgetStepsProvider } from "@/store/BudgetStepContext";

import  BudgetScreen  from "@/components/budget/screens/BudgetScreen";

export default function SettingBudgetPage() {
  return (
    <BudgetStepsProvider>
      <BudgetScreen />
    </BudgetStepsProvider>
  );
}
