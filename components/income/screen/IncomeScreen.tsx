"use client";
import { IncomeCard } from '../IncomeCard';
import { IncomeSourceList } from '../incomeSourceList';
import { IncomeSourceForm } from '../IncomeSourceForm';
import { AddSourceButton } from '../AddSourceButton';
import { IncomeTotal } from '../IncomeTotal';
import { useIncomeSources } from '@/hooks/income/useIncomeSources';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { ContinueButton } from '@/components/ui/ContinueButton';
import { ReturnButton } from '@/components/ui/ReturnButton';
import { useRouter } from "next/navigation";






export function IncomeScreen() {
  const { sources, addSource, removeSource, total, showForm, setShowForm } = useIncomeSources();
  const router = useRouter();
  const step = 1; 
  const totalSteps = 3; 
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8">

      <IncomeCard
        title="¿De dónde provienen tus ingresos?"
        subtitle="Añade tus fuentes de ingresos regulares. Esto nos ayudará a crear una base sólida para tu presupuesto mensual."
        progressBar={<ProgressBar step={step} totalSteps={totalSteps} />}
        
        >
        <IncomeSourceList sources={sources} onRemove={removeSource} />
        {showForm ? (
        <IncomeSourceForm onSubmit={addSource} onCancel={() => setShowForm(false)} />
        ) : (
        <AddSourceButton onClick={() => setShowForm(true)} />
        )}
        <IncomeTotal total={total}/>

        <div className="flex justify-between mt-2">

          <ReturnButton
            onClick={() => router.push("/settingBudget")}
            className="px-4 py-2 text-sm"
          />
          <ContinueButton
            onClick={() => { /* acción de continuar */ }}
            className="px-4 py-2 text-sm"
          />
      </div>

      </IncomeCard>

    </main>
  );
}