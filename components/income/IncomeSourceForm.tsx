"use client";
import { useIncomeSourceForm } from "@/hooks/income/useIncomeSourceForm";
import { FormInput } from "@/components/forms/FormInput";
import { FormErrorMessage } from "@/components/forms/FormErrorMessage";
import { SubmitButton } from "@/components/forms/SubmitButton";

export function IncomeSourceForm({ onSubmit, onCancel }: {
  onSubmit: (s: { name: string; amount: number }) => void;
  onCancel: () => void;}) {
  const { values, actions, state } = useIncomeSourceForm(onSubmit);

  return (
    <form className="mb-4 flex flex-col gap-2" onSubmit={actions.submit}>
          <FormInput
        id="incomeName"
        name="incomeName"
        label="Nombre del ingreso"
        value={values.name}
        onChange={actions.setName}
        placeholder="ej: Sueldo"
      />
      <FormInput
        id="incomeAmount"
        name="incomeAmount"
        label="Monto"
        type="number"
        min="1"
        value={values.amount}
        onChange={actions.setAmount}
        placeholder="ej: 600000"
      />
      <FormErrorMessage message={state.error} />
      <div className="flex gap-2">
        <SubmitButton label="Agregar" />
        <button type="button" className="rounded bg-slate-300 px-4 py-1" onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </form>
  );
}