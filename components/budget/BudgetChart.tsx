import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import type { AllocationSummary } from "@/lib/api/budgets";

interface Props {
  allocations: AllocationSummary[];
}

export function BudgetChart({ allocations }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm mb-8">
      <h2 className="text-lg font-bold mb-4 text-slate-800">Distribución por categoría</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={allocations}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="categoryName" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="allocated" fill="#0E7C8B" name="Asignado" />
          <Bar dataKey="spent" fill="#F59E42" name="Gastado" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}