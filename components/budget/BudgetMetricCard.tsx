import { formatCLP } from "@/lib/utils/currency";

type Color = "slate" | "teal" | "orange" | "emerald" | "red" | "amber";

const colorMap: Record<Color, { value: string; bg: string; border: string }> = {
  slate:   { value: "text-slate-800",   bg: "bg-white",          border: "border-slate-100" },
  teal:    { value: "text-[#0E7C8B]",   bg: "bg-[#f0fafb]",      border: "border-[#c7edf1]" },
  orange:  { value: "text-orange-500",  bg: "bg-orange-50",      border: "border-orange-100" },
  emerald: { value: "text-emerald-600", bg: "bg-emerald-50",     border: "border-emerald-100" },
  red:     { value: "text-red-600",     bg: "bg-red-50",         border: "border-red-100" },
  amber:   { value: "text-amber-600",   bg: "bg-amber-50",       border: "border-amber-100" },
};

type Props = {
  label: string;
  amount: number;
  color: Color;
  sub?: string;
};

export default function BudgetMetricCard({ label, amount, color, sub }: Props) {
  const c = colorMap[color];
  return (
    <div className={`rounded-2xl border ${c.bg} ${c.border} p-5 shadow-sm`}>
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      <p className={`text-xl font-bold ${c.value}`}>
        ${formatCLP(amount)}
      </p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  );
}
