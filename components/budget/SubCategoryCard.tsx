type Subcategory = { id: string; name: string; budget: string };

type SubcategoryInputCardProps = {
  sub: Subcategory;
  onChange: (field: "name" | "budget", value: string) => void;
  onRemove: () => void;
};

export function SubcategoryInputCard({ sub, onChange, onRemove }: SubcategoryInputCardProps) {
  return (
    <div className="relative rounded-xl border border-slate-200 bg-white p-4">
      <button
        type="button"
        onClick={onRemove}
        className="absolute right-3 top-3 text-slate-300 hover:text-slate-500 text-base leading-none"
        aria-label="Eliminar subcategoría"
      >
        ×
      </button>
      <label className="mb-1 block text-xs font-medium text-slate-500">Nombre</label>
      <input
        required
        className="mb-3 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none focus:border-[#0E7C8B] focus:ring-1 focus:ring-[#0E7C8B]"
        value={sub.name}
        onChange={(e) => onChange("name", e.target.value)}
        placeholder="ej: Renta / Hipoteca"
      />
      <label className="mb-1 block text-xs font-medium text-slate-500">Monto</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">$</span>
        <input
          className="w-full rounded-lg border border-slate-200 py-2 pl-7 pr-3 text-sm text-slate-800 outline-none focus:border-[#0E7C8B] focus:ring-1 focus:ring-[#0E7C8B]"
          type="number"
          min="0"
          value={sub.budget}
          onChange={(e) => {
            const v = e.target.value;
            if (v === "" || Number(v) >= 0) onChange("budget", v);
          }}
          placeholder="0.00"
        />
      </div>
    </div>
  );
}
