"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { IncomeCard } from "../IncomeCard";
import { IncomeSourceList } from "../incomeSourceList";
import { IncomeSourceForm } from "../IncomeSourceForm";
import { AddSourceButton } from "../AddSourceButton";
import { useIncomeSources } from "@/hooks/income/useIncomeSources";
import { useBudgetFlow } from "@/store/BudgetFlowContext";
import { formatCLP } from "@/lib/utils/currency";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ReturnButton } from "@/components/ui/ReturnButton";
import { ContinueButton } from "@/components/ui/ContinueButton";

export function IncomeScreen() {
  const { sources, addSource, removeSource, total, showForm, setShowForm } = useIncomeSources();
  const { step, setStep } = useBudgetFlow();
  const router = useRouter();

  useEffect(() => { setStep(1); }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8">
      <IncomeCard
        title="¿De dónde provienen tus ingresos?"
        subtitle="Añade tus fuentes de ingresos regulares. Esto nos ayudará a crear una base sólida para tu presupuesto mensual."
        progressBar={<ProgressBar step={step} totalSteps={3} stepName="Ingresos" />}
      >
        <IncomeSourceList sources={sources} onRemove={removeSource} />

        {showForm ? (
          <IncomeSourceForm onSubmit={addSource} onCancel={() => setShowForm(false)} />
        ) : (
          <AddSourceButton onClick={() => setShowForm(true)} />
        )}

        {/* Total + botones en la misma fila */}
        <div className="mt-5 flex items-end justify-between">
          <div>
            <p className="text-xs text-slate-500">Ingreso Total Estimado</p>
            <p className="text-2xl font-bold text-[#0E7C8B]">
              ${formatCLP(total)}
            </p>
          </div>
          <div className="flex gap-2">
            <ReturnButton onClick={() => router.push("/settingBudget")} className="px-4 py-2 text-sm" />
            <ContinueButton onClick={() => router.push("/budgetAllocation")} className="px-4 py-2 text-sm" />
          </div>
        </div>
      </IncomeCard>
    </main>
  );
}
