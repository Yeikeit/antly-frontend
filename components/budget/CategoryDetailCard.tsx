import { SubcategoryInputCard } from "./SubCategoryCard";

type Subcategory = { id: string; name: string; budget: string };
type Category = { id: string; name: string; budget: string; subcategories: Subcategory[] };

type CategoryDetailCardProps = {
  category: Category;
  onCategoryChange: (field: "name" | "budget", value: string) => void;
  onSubChange: (subId: string, field: "name" | "budget", value: string) => void;
  onAddSub: () => void;
  onRemoveSub: (subId: string) => void;
};

export function CategoryDetailCard({
  category,
  onCategoryChange,
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
            value={category.name}
            onChange={(e) => onCategoryChange("name", e.target.value)}
            placeholder="Nombre de la categoría"
          />
          <p className="mt-1 text-sm text-slate-500">Asigna presupuestos específicos</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-xs text-slate-400">Total Asignado</p>
          <p className="text-lg font-bold text-slate-900">
            ${totalAssigned.toLocaleString("es-CL", { minimumFractionDigits: 2 })}
          </p>
        </div>
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
