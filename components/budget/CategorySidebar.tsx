const ICON_COLORS = [
  "bg-teal-500", "bg-violet-500", "bg-amber-500",
  "bg-rose-500", "bg-sky-500", "bg-emerald-500",
];

type Category = {
  id: string;
  name: string;
  subcategories: { id: string; name: string; budget: string }[];
};

type CategorySidebarProps = {
  categories: Category[];
  selectedId: string;
  onSelect: (id: string) => void;
  onAddCategory: () => void;
  onRemoveCategory: (id: string) => void;
};

export function CategorySidebar({ categories, selectedId, onSelect, onAddCategory, onRemoveCategory }: CategorySidebarProps) {
  return (
    <aside className="w-64 shrink-0">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
        Categorías principales
      </p>
      <div className="space-y-1">
        {categories.map((cat, i) => {
          const isSelected = selectedId === cat.id;
          const subCount = cat.subcategories.length;
          const letter = cat.name.charAt(0).toUpperCase() || "?";

          return (
            <div
              key={cat.id}
              className={`group flex items-center gap-3 rounded-xl px-3 py-3 transition
                ${isSelected
                  ? "border-l-4 border-[#0E7C8B] bg-teal-50"
                  : "border-l-4 border-transparent hover:bg-slate-50"
                }`}
            >
              <button
                type="button"
                onClick={() => onSelect(cat.id)}
                className="flex flex-1 items-center gap-3 text-left min-w-0"
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white ${ICON_COLORS[i % ICON_COLORS.length]}`}
                >
                  {letter}
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`truncate text-sm font-semibold ${isSelected ? "text-[#0E7C8B]" : "text-slate-800"}`}>
                    {cat.name || "Nueva categoría"}
                  </p>
                  <p className="text-xs text-slate-400">
                    {subCount === 0 ? "Sin subcategorías" : `${subCount} subcategor${subCount === 1 ? "ía" : "ías"}`}
                  </p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => onRemoveCategory(cat.id)}
                className="shrink-0 text-slate-300 opacity-0 group-hover:opacity-100 hover:text-red-400 transition text-base leading-none"
                aria-label="Eliminar categoría"
              >
                ×
              </button>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onAddCategory}
        className="mt-3 w-full rounded-xl border border-dashed border-slate-300 py-2.5 text-sm font-medium text-slate-500 transition hover:border-[#0E7C8B] hover:text-[#0E7C8B]"
      >
        + Agregar Categoría
      </button>
    </aside>
  );
}
