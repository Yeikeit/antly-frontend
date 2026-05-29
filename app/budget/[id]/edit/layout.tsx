"use client";
import { useParams } from "next/navigation";
import { EditBudgetFlowProvider } from "@/store/EditBudgetFlowContext";
import Loader from "@/components/ui/Loader";
import { useEditBudgetFlow } from "@/store/EditBudgetFlowContext";

function EditBudgetGuard({ children }: { children: React.ReactNode }) {
  const { isLoaded } = useEditBudgetFlow();
  if (!isLoaded) return <Loader fullPage />;
  return <>{children}</>;
}

export default function EditBudgetLayout({ children }: { children: React.ReactNode }) {
  const { id } = useParams<{ id: string }>();
  return (
    <EditBudgetFlowProvider budgetId={id}>
      <EditBudgetGuard>{children}</EditBudgetGuard>
    </EditBudgetFlowProvider>
  );
}
