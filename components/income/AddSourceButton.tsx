export function AddSourceButton({ onClick }: { onClick: () => void }) {
  return (
    <button
        className="w-full rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60"
      onClick={onClick}
      type="button"
    >
      + Añadir fuente
    </button>
  );
}