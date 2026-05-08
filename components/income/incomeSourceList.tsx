const ICON_COLORS = [
  "bg-teal-500", "bg-violet-500", "bg-amber-500",
  "bg-rose-500", "bg-sky-500", "bg-emerald-500",
];

export function IncomeSourceList({
  sources,
  onRemove,
}: {
  sources: { name: string; amount: number }[];
  onRemove: (i: number) => void;
}) {
  if (sources.length === 0) return null;

  return (
    <div className="mb-3 space-y-2">
      {sources.map((s, i) => (
        <div
          key={i}
          className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white px-4 py-3 shadow-sm"
        >
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white ${ICON_COLORS[i % ICON_COLORS.length]}`}
          >
            {s.name.charAt(0).toUpperCase() || "?"}
          </div>
          <span className="flex-1 font-medium text-slate-800">{s.name}</span>
          <span className="font-semibold text-slate-900">
            ${s.amount.toLocaleString("es-CL", { minimumFractionDigits: 2 })}
          </span>
          <button
            type="button"
            onClick={() => onRemove(i)}
            className="ml-1 text-slate-400 hover:text-slate-600 text-lg leading-none"
            aria-label="Eliminar"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
