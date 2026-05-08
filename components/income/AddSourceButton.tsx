export function AddSourceButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-xl border-2 border-dashed border-slate-300 px-4 py-3 text-sm font-medium text-slate-500 transition hover:border-[#0E7C8B] hover:text-[#0E7C8B]"
    >
      + Añadir fuente
    </button>
  );
}
