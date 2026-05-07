type Category = {
  id: string;
  name: string;
};

type CategorySidebarProps = {
  categories: Category[];
  selectedId: string;
  onSelect: (id: string) => void;
  onAddCategory: () => void;
};

export function CategorySidebar({
  categories,
  selectedId,
  onSelect,
  onAddCategory,
}: CategorySidebarProps) {
  return (
    <aside className="w-1/3">
      <div className="space-y-2">
        {categories.map((cat) => {
          const isSelected = selectedId === cat.id;

          return (
            <button
              key={cat.id}
              type="button"
              className="w-full rounded-xl border px-4 py-2 text-left font-medium transition hover:bg-slate-50"
              style={{
                backgroundColor: isSelected ? "#0E7C8B" : "#FFFFFF",
                borderColor: isSelected ? "#0E7C8B" : "#E2E8F0",
                color: isSelected ? "#FFFFFF" : "#0F172A",
              }}
              onClick={() => onSelect(cat.id)}
            >
              {cat.name || "Nueva categoría"}
            </button>
          );
        })}
      </div>
      <button
        className="mt-4 w-full rounded-xl border py-2"
        style={{ borderColor: "#0E7C8B", color: "#0E7C8B" }}
        onClick={onAddCategory}
      >
        + Agregar Categoría
      </button>
    </aside>
  );
}
