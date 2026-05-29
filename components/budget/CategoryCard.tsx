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

function subBarColor(overBudget: boolean, isSaving: boolean) {
  if (isSaving) return "bg-emerald-500";
  if (overBudget) return "bg-red-500";
  return "bg-[#0E7C8B]";
}

export default function CategoryCard({ category, subcategories, isSaving = false }: Props) {
  const totalSpent = subcategories.reduce((s, sub) => s + sub.spent, 0);
  const totalAllocated = subcategories.reduce((s, sub) => s + sub.allocated, 0);

  const overBudget = totalSpent > totalAllocated;
  const remaining = totalAllocated - totalSpent;

  const borderColor = overBudget && !isSaving ? "border-red-100" : isSaving ? "border-emerald-100" : "border-slate-100";

  return (
    <div className={`bg-white rounded-2xl border shadow-sm p-5 flex flex-col gap-4 ${borderColor}`}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-bold text-slate-800 text-base">{category.categoryName}</h3>
          {isSaving ? (
            <p className="text-xs text-slate-400 mt-0.5">
              ${formatCLP(remaining)} restante
            </p>
          ) : overBudget ? (
            <span className="text-xs font-semibold text-red-500 mt-0.5 block">Sobre el presupuesto</span>
          ) : (
            <p className="text-xs text-slate-400 mt-0.5">
              ${formatCLP(remaining)} restante
            </p>
          )}
        </div>
        <div className="text-right">
          <span className={`text-base font-bold ${isSaving ? "text-emerald-600" : overBudget ? "text-red-500" : "text-slate-800"}`}>
            ${formatCLP(totalSpent)}
          </span>
          <span className="text-xs text-slate-400">
              {" "}/ ${formatCLP(totalAllocated)}
          </span>
        </div>
      </div>

      {/* Subcategorías */}
      {subcategories.length > 0 && (
        <div className="flex flex-col gap-3">
          {subcategories.map((sub) => {
            const subOver = sub.spent > sub.allocated;
            const subPct = subOver
              ? 100
              : sub.allocated > 0
              ? Math.min(Math.round((sub.spent / sub.allocated) * 100), 100)
              : 0;
            const barColor = subBarColor(subOver, isSaving);
            return (
              <div key={sub.categoryId} className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${subOver && !isSaving ? "text-red-500 font-medium" : "text-slate-600"}`}>
                    {sub.categoryName}
                  </span>
                  <span className={`text-sm font-medium ${subOver && !isSaving ? "text-red-500" : "text-slate-700"}`}>
                    ${formatCLP(sub.spent)}
                    <span className="text-slate-400 font-normal">
                      {" "}/ ${formatCLP(sub.allocated)}
                    </span>
                  </span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${barColor}`}
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
