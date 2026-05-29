"use client";
import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useEditBudgetFlow } from "@/store/EditBudgetFlowContext";
import { IncomeCard } from "@/components/income/IncomeCard";
import { IncomeSourceList } from "@/components/income/incomeSourceList";
import { IncomeSourceForm } from "@/components/income/IncomeSourceForm";
import { AddSourceButton } from "@/components/income/AddSourceButton";
import { formatCLP } from "@/lib/utils/currency";

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

export function EditIncomeScreen() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { incomeSources, setIncomeSources, month, year } = useEditBudgetFlow();
  const [showForm, setShowForm] = useState(false);

  function addSource(source: { name: string; amount: number }) {
    setIncomeSources((prev) => [...prev, source]);
    setShowForm(false);
  }

  function removeSource(index: number) {
    setIncomeSources((prev) => prev.filter((_, i) => i !== index));
  }

  const total = incomeSources.reduce((acc, s) => acc + s.amount, 0);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8">
      <IncomeCard
        title="Editar ingresos"
        subtitle={`Actualiza tus fuentes de ingreso para ${MONTHS[month - 1]} ${year}. El período no es modificable.`}
      >
        {/* Period badge */}
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-500">
          <span>📅</span>
          <span>
            {MONTHS[month - 1]} {year} — período fijo
          </span>
        </div>

        <IncomeSourceList sources={incomeSources} onRemove={removeSource} />

        {showForm ? (
          <IncomeSourceForm onSubmit={addSource} onCancel={() => setShowForm(false)} />
        ) : (
          <AddSourceButton onClick={() => setShowForm(true)} />
        )}

        <div className="mt-5 flex items-end justify-between">
          <div>
            <p className="text-xs text-slate-500">Ingreso Total Estimado</p>
            <p className="text-2xl font-bold text-[#0E7C8B]">
              ${formatCLP(total)}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => router.push(`/budget/${id}`)}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => router.push(`/budget/${id}/edit/allocations`)}
              className="rounded-lg bg-[#0E7C8B] px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
            >
              Siguiente →
            </button>
          </div>
        </div>
      </IncomeCard>
    </main>
  );
}
