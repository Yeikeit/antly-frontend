import { formatCLP } from "@/lib/utils/currency";

export function IncomeTotal({ total }: { total: number }) {
  return (
    <div className="mt-4 flex items-end justify-between">
      <div>
        <p className="text-xs text-slate-500">Ingreso Total Estimado</p>
        <p className="text-2xl font-bold text-[#0E7C8B]">
          ${formatCLP(total)}
        </p>
      </div>
    </div>
  );
}
