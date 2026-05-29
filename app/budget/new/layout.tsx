import { BudgetFlowProvider } from "@/store/BudgetFlowContext";

export default function NewBudgetLayout({ children }: { children: React.ReactNode }) {
  return <BudgetFlowProvider>{children}</BudgetFlowProvider>;
}
