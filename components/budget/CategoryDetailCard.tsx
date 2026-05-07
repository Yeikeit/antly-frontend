import { SubcategoryInputCard } from "./SubCategoryCard";

type Subcategory = {
  id: string;
  name: string;
  budget: string;
};

type Category = {
  id: string;
  name: string;
  budget: string;
  subcategories: Subcategory[];
};

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
  const assigned = category.subcategories.reduce(
    (acc, sub) => acc + Number(sub.budget || 0),
    0
  );
  const remaining = Number(category.budget || 0) - assigned;

  return (
    <div className="space-y-4 rounded-xl bg-white p-6 shadow">
      <div className="flex items-center justify-between gap-4">
        <input
          className="rounded border border-primary bg-white px-2 py-1 text-slate-900 outline-none placeholder:text-slate-400"
          value={category.name}
          onChange={(e) => onCategoryChange("name", e.target.value)}
          placeholder="Nombre de la categorí­a"
        />
        <input
          className="rounded border border-primary bg-white px-2 py-1 text-slate-900 outline-none placeholder:text-slate-400"
          type="number"
          value={category.budget}
          onChange={(e) => onCategoryChange("budget", e.target.value)}
          placeholder="Presupuesto"
        />
      </div>
      <div className="flex justify-between text-sm text-slate-600">
        <span>Asignado: <b>${assigned}</b></span>
        <span className={remaining < 0 ? "text-red-600" : "text-primary"}>
          Restante: <b>${remaining}</b>
        </span>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
          className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-primary p-4 text-primary transition hover:bg-primary/10"
          onClick={onAddSub}
        >
          + Agregar Subcategorí­a
        </button>
      </div>
    </div>
  );
}
