"use client";
import { IncomeCard } from '../IncomeCard';
import { IncomeSourceList } from '../incomeSourceList';
import { IncomeSourceForm } from '../IncomeSourceForm';
import { AddSourceButton } from '../AddSourceButton';
import { IncomeTotal } from '../IncomeTotal';
import { useIncomeSources } from '@/hooks/income/useIncomeSources';

export function IncomeScreen() {
  const { sources, addSource, removeSource, total, showForm, setShowForm } = useIncomeSources();

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8">

      <IncomeCard
        title="¿De dónde provienen tus ingresos?"
        subtitle="Añade tus fuentes de ingresos regulares. Esto nos ayudará a crear una base sólida para tu presupuesto mensual."
      >

        <IncomeSourceList sources={sources} onRemove={removeSource} />
        {showForm ? (
          <IncomeSourceForm onSubmit={addSource} onCancel={() => setShowForm(false)} />
        ) : (
          <AddSourceButton onClick={() => setShowForm(true)} />
        )}
        <IncomeTotal total={total} />
      </IncomeCard>
    </main>
  );
}