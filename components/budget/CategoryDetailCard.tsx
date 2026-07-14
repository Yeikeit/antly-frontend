import { SubcategoryInputCard } from "./SubCategoryCard";
import { formatCLP } from "@/lib/utils/currency";

type Subcategory = { id: string; name: string; budget: string };
type Category = { id: string; name: string; budget: string; type: "EXPENSE" | "SAVING"; subcategories: Subcategory[] };

type CategoryDetailCardProps = {
  category: Category;
  onCategoryChange: (field: "name" | "budget", value: string) => void;
  onTypeChange: (type: "EXPENSE" | "SAVING") => void;
  onSubChange: (subId: string, field: "name" | "budget", value: string) => void;
  onAddSub: () => void;
  onRemoveSub: (subId: string) => void;
};

export function CategoryDetailCard({
  category,
  onCategoryChange,
  onTypeChange,
  onSubChange,
  onAddSub,
  onRemoveSub,
}: CategoryDetailCardProps) {
  const totalAssigned = category.subcategories.reduce((acc, sub) => acc + (Number(sub.budget) || 0), 0);

  return (
    <div className="flex-1 rounded-xl bg-white p-6 shadow-sm border border-slate-100">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <input
            className="text-lg font-semibold text-slate-900 outline-none border-b-2 border-transparent focus:border-[#0E7C8B] bg-transparent pb-0.5 w-full max-w-xs"
            required
            value={category.name}
            onChange={(e) => onCategoryChange("name", e.target.value)}
            placeholder="Nombre de la categoría"
          />
          <p className="mt-1 text-sm text-slate-500">Asigna presupuestos específicos</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-xs text-slate-400">Total Asignado</p>
          <p className="text-lg font-bold text-slate-900">
            ${formatCLP(totalAssigned)}
          </p>
        </div>
      </div>

      {/* Tipo: pill selector */}
      <div className="mb-5 flex items-center gap-2">
        <span className="text-xs font-medium text-slate-500">Tipo:</span>
        <button
          type="button"
          onClick={() => onTypeChange("EXPENSE")}
          className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
            category.type === "EXPENSE"
              ? "bg-[#0E7C8B] text-white border-[#0E7C8B]"
              : "bg-white text-slate-500 border-slate-200 hover:border-[#0E7C8B] hover:text-[#0E7C8B]"
          }`}
        >
          Gasto
        </button>
        <button
          type="button"
          onClick={() => onTypeChange("SAVING")}
          className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
            category.type === "SAVING"
              ? "bg-emerald-500 text-white border-emerald-500"
              : "bg-white text-slate-500 border-slate-200 hover:border-emerald-500 hover:text-emerald-500"
          }`}
        >
          Ahorro
        </button>
      </div>

      {/* Subcategory grid */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {category.subcategories.map((sub) => (
          <SubcategoryInputCard
            key={sub.id}
            sub={sub}
            onChange={(field, value) => onSubChange(sub.id, field, value)}
            onRemove={() => onRemoveSub(sub.id)}
          />
        ))}

        <button
          type="button"
          onClick={onAddSub}
          className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 p-4 text-sm font-medium text-slate-400 transition hover:border-[#0E7C8B] hover:text-[#0E7C8B]"
        >
          <span className="text-lg leading-none">+</span> Agregar Subcategoría
        </button>
      </div>
    </div>
  );
}
