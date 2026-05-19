import type { AllocationSummary } from "@/lib/api/budgets";

type Props = {
  category: AllocationSummary;
  subcategories: AllocationSummary[];
};

function spentColor(pct: number) {
  if (pct >= 100) return "bg-red-500";
  if (pct >= 80) return "bg-orange-400";
  return "bg-[#0E7C8B]";
}

function amountColor(remaining: number) {
  if (remaining < 0) return "text-red-500";
  return "text-slate-700";
}

export default function CategoryCard({ category, subcategories }: Props) {
  const pct = category.allocated > 0
    ? Math.min(Math.round((category.spent / category.allocated) * 100), 100)
    : 0;

  const overBudget = category.spent > category.allocated;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-bold text-slate-800 text-base">{category.categoryName}</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            ${category.remaining.toLocaleString("es-CL")} restante
          </p>
          {overBudget && (
            <span className="text-xs font-semibold text-red-500 mt-0.5 block">Sobre presupuesto</span>
          )}
        </div>
        <div className="text-right">
          <span className={`text-base font-bold ${overBudget ? "text-red-500" : "text-slate-800"}`}>
            ${category.spent.toLocaleString("es-CL")}
          </span>
          <span className="text-xs text-slate-400">
            {" "}/ ${category.allocated.toLocaleString("es-CL")}
          </span>
        </div>
      </div>

      {/* Barra de categoría */}
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${spentColor(pct)}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Subcategorías */}
      {subcategories.length > 0 && (
        <div className="flex flex-col gap-3 pt-1">
          {subcategories.map((sub) => {
            const subPct = sub.allocated > 0
              ? Math.min(Math.round((sub.spent / sub.allocated) * 100), 100)
              : 0;
            return (
              <div key={sub.categoryId} className="flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">{sub.categoryName}</span>
                  <span className={`text-sm font-medium ${amountColor(sub.remaining)}`}>
                    ${sub.spent.toLocaleString("es-CL")}
                    <span className="text-slate-400 font-normal">
                      {" "}/ ${sub.allocated.toLocaleString("es-CL")}
                    </span>
                  </span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${spentColor(subPct)}`}
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
