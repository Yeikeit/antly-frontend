export function IncomeTotal({ total }: { total: number }) {
  return (
    <div className="mt-4 flex items-center justify-between rounded-lg bg-slate-100 p-4">
      <span className="font-medium text-slate-600">Ingreso Total Estimado</span>
      <span className="text-xl font-bold text-slate-900">${total.toLocaleString()}</span>
    </div>
  );
}