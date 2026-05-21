import { BudgetFlowProvider } from "@/store/BudgetFlowContext";
import { WizardGuard } from "@/components/budget/WizardGuard";

export default function WizardLayout({ children }: { children: React.ReactNode }) {
  return (
    <BudgetFlowProvider>
      <WizardGuard>{children}</WizardGuard>
    </BudgetFlowProvider>
  );
}
