import { IncomeScreen } from "@/components/income/screen/IncomeScreen";
import { IncomeStepsProvider } from "@/store/incomeStepContex";

export default function IncomePage() {
  return  (
  <IncomeStepsProvider>
    <IncomeScreen />
    </IncomeStepsProvider>
  );
}
