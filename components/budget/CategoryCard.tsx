import type { AllocationSummary } from "@/lib/api/budgets";
import { formatCLP } from "@/lib/utils/currency";

type CategoryHeader = {
  categoryId: string;
  categoryName: string;
  type: string;
};

type Props = {
  category: CategoryHeader;
  subcategories: AllocationSummary[];
  isSaving?: boolean;
};

type AlertLevel = "over" | "warning" | "ok";

function getAlertLevel(spent: number, allocated: number): AlertLevel {
  if (spent > allocated) return "over";
  if (allocated > 0 && spent / allocated >= 0.8) return "warning";
  return "ok";
}

function barColor(level: AlertLevel, isSaving: boolean) {
  if (isSaving) return "bg-emerald-500";
  if (level === "over") return "bg-red-500";
  if (level === "warning") return "bg-orange-400";
  return "bg-[#0E7C8B]";
}

export default function CategoryCard({ category, subcategories, isSaving = false }: Props) {
  const totalSpent = subcategories.reduce((s, sub) => s + sub.spent, 0);
  const totalAllocated = subcategories.reduce((s, sub) => s + sub.allocated, 0);

  const level = isSaving ? "ok" : getAlertLevel(totalSpent, totalAllocated);
  const remaining = totalAllocated - totalSpent;
  const pct = totalAllocated > 0 ? Math.min((totalSpent / totalAllocated) * 100, 100) : 0;

  const borderColor =
    level === "over" ? "border-red-100" :
    level === "warning" ? "border-orange-100" :
    isSaving ? "border-emerald-100" : "border-slate-100";

  const amountColor =
    isSaving ? "text-emerald-600" :
    level === "over" ? "text-red-500" :
    level === "warning" ? "text-orange-500" :
    "text-slate-800";

  return (
    <div className={`bg-white rounded-2xl border shadow-sm p-5 flex flex-col gap-4 ${borderColor}`}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-800 text-base">{category.categoryName}</h3>
            {level === "over" && (
              <span className="text-xs font-semibold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
                Excedido
              </span>
            )}
            {level === "warning" && (
              <span className="text-xs font-semibold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full">
                {Math.round(pct)}% usado
              </span>
            )}
          </div>
          <p className={`text-xs mt-0.5 ${level === "over" ? "text-red-400" : "text-slate-400"}`}>
            {level === "over"
              ? `Excedido por $${formatCLP(Math.abs(remaining))}`
              : `$${formatCLP(remaining)} restante`}
          </p>
        </div>
        <div className="text-right">
          <span className={`text-base font-bold ${amountColor}`}>
            ${formatCLP(totalSpent)}
          </span>
          <span className="text-xs text-slate-400"> / ${formatCLP(totalAllocated)}</span>
        </div>
      </div>

      {/* Barra global + separador */}
      {!isSaving && totalAllocated > 0 && (
        <div className="-mt-2">
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${barColor(level, false)}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}

      {/* Subcategorías */}
      {subcategories.length > 0 && (
        <div className="flex flex-col gap-3 pt-3 border-t-2 border-slate-200">
          {subcategories.map((sub) => {
            const subLevel = isSaving ? "ok" : getAlertLevel(sub.spent, sub.allocated);
            const subPct = sub.allocated > 0
              ? Math.min((sub.spent / sub.allocated) * 100, 100)
              : 0;
            const subTextColor =
              subLevel === "over" && !isSaving ? "text-red-500 font-medium" :
              subLevel === "warning" && !isSaving ? "text-orange-500 font-medium" :
              "text-slate-600";
            return (
              <div key={sub.categoryId} className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${subTextColor}`}>{sub.categoryName}</span>
                  <span className={`text-sm font-medium ${subTextColor}`}>
                    ${formatCLP(sub.spent)}
                    <span className="text-slate-400 font-normal"> / ${formatCLP(sub.allocated)}</span>
                  </span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${barColor(subLevel, isSaving)}`}
                    style={{ width: `${subPct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
