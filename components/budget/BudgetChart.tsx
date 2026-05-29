"use client";

import { formatCLP } from "@/lib/utils/currency";
import {
  PieChart,
  Pie,
  Tooltip,
  ResponsiveContainer,
  Legend,
  type PieLabelRenderProps,
} from "recharts";
import type { AllocationSummary } from "@/lib/api/budgets";

const COLORS = [
  "#0E7C8B", "#14B8A6", "#0284C7", "#6366F1",
  "#8B5CF6", "#EC4899", "#F59E0B", "#10B981",
];

interface Props {
  allocations: AllocationSummary[];
}

function CustomLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }: PieLabelRenderProps) {
  const pct = Number(percent ?? 0);
  if (pct < 0.05) return null;
  const RADIAN = Math.PI / 180;
  const cxN = Number(cx ?? 0);
  const cyN = Number(cy ?? 0);
  const inner = Number(innerRadius ?? 0);
  const outer = Number(outerRadius ?? 0);
  const angle = Number(midAngle ?? 0);
  const radius = inner + (outer - inner) * 0.55;
  const x = cxN + radius * Math.cos(-angle * RADIAN);
  const y = cyN + radius * Math.sin(-angle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={600}>
      {`${(pct * 100).toFixed(0)}%`}
    </text>
  );
}

export function BudgetChart({ allocations }: Props) {
  // Las allocations son siempre subcategorías (level 2).
  // Agrupamos por categoría padre sumando los montos asignados.
  const grouped = allocations.reduce<Record<string, { name: string; value: number }>>((acc, a) => {
    const key = a.parentId ?? a.categoryId;
    const name = a.parentName ?? a.categoryName;
    if (!acc[key]) acc[key] = { name, value: 0 };
    acc[key].value += Number(a.allocated);
    return acc;
  }, {});

  const data = Object.values(grouped)
    .filter((d) => d.value > 0)
    .map((d, i) => ({ ...d, fill: COLORS[i % COLORS.length] }));

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm mb-8 flex items-center justify-center h-48">
        <p className="text-sm text-slate-400">Sin datos de distribución</p>
      </div>
    );
  }

  const fmt = (v: number) => `$${formatCLP(v)}`;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm h-full">
      <h2 className="text-base font-bold mb-4 text-slate-800">Distribución por categoría</h2>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={65}
            outerRadius={105}
            dataKey="value"
            labelLine={false}
            label={CustomLabel}
          />
          <Tooltip
            formatter={(value, name) => [fmt(Number(value)), String(name)]}
            contentStyle={{ borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 13 }}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            formatter={(value) => <span style={{ fontSize: 12, color: "#475569" }}>{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
