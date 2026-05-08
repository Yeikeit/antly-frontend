import { BudgetFlowProvider } from "@/store/BudgetFlowContext";

export default function WizardLayout({ children }: { children: React.ReactNode }) {
  return <BudgetFlowProvider>{children}</BudgetFlowProvider>;
}
