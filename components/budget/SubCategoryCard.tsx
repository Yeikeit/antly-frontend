type Subcategory = {
  id: string;
  name: string;
  budget: string;
};

type SubcategoryInputCardProps = {
  sub: Subcategory;
  onChange: (field: "name" | "budget", value: string) => void;
  onRemove: () => void;
};

export function SubcategoryInputCard({ sub, onChange, onRemove }: SubcategoryInputCardProps) {
  return (
    <div className="bg-slate-50 rounded-lg p-4 flex flex-col gap-2">
      <input
        className="border rounded px-2 py-1"
        value={sub.name}
        onChange={(e) => onChange("name", e.target.value)}
        placeholder="Nombre de subcategoría"
      />
      <input
        className="border rounded px-2 py-1"
        type="number"
        value={sub.budget}
        onChange={(e) => onChange("budget", e.target.value)}
        placeholder="Presupuesto"
      />
      <button
        type="button"
        className="text-black font-bold px-2 self-end"
        onClick={onRemove}
        title="Eliminar"
      >
        ×
      </button>
    </div>
  );
}