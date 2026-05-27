import { useState, useRef, useEffect } from "react";
import { FaChevronDown, FaCheck, FaPlus } from "react-icons/fa";
import { IncomeSource, createIncomeSource } from "@/lib/api/incomes";

type IncomeSourceSelectProps = {
  sources: IncomeSource[];
  value: string;
  onChange: (id: string) => void;
  onNewSourceCreated?: (source: IncomeSource) => void;
  loading?: boolean;
};

export function IncomeSourceSelect({
  sources,
  value,
  onChange,
  onNewSourceCreated,
  loading = false,
}: IncomeSourceSelectProps) {
  const [open, setOpen] = useState(false);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newSourceName, setNewSourceName] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const selected = sources.find((s) => s.id === value);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setShowNewForm(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleCreateSource = async () => {
    if (!newSourceName.trim()) {
      setError("El nombre de la fuente es requerido");
      return;
    }

    setCreating(true);
    setError(null);

    try {
      const newSource = await createIncomeSource({ name: newSourceName.trim() });
      setNewSourceName("");
      setShowNewForm(false);
      setOpen(false);
      onChange(newSource.id);
      onNewSourceCreated?.(newSource);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al crear la fuente de ingreso"
      );
    } finally {
      setCreating(false);
    }
  };

  return (
    <div ref={ref} className="space-y-3">
      <div className="relative">
        <button
          type="button"
          disabled={loading}
          onClick={() => !loading && setOpen((p) => !p)}
          className={`
            w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl border text-sm font-medium
            transition-all duration-150
            ${
              loading
                ? "bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed"
                : open
                  ? "bg-white border-[#0E7C8B] ring-2 ring-[#0E7C8B]/10 text-slate-800 shadow-sm"
                  : "bg-white border-slate-200 text-slate-700 hover:border-[#0E7C8B] hover:shadow-sm"
            }
          `}
        >
          <span className={selected ? "text-slate-800" : loading ? "text-slate-300" : "text-slate-400"}>
            {selected ? selected.name : "Seleccionar fuente..."}
          </span>
          <FaChevronDown
            size={11}
            className={`flex-shrink-0 transition-transform duration-200 ${
              open ? "rotate-180 text-[#0E7C8B]" : loading ? "text-slate-200" : "text-slate-400"
            }`}
          />
        </button>

        {open && (
          <div className="absolute z-20 top-full mt-1.5 left-0 right-0 bg-white border border-slate-100 rounded-xl shadow-lg overflow-hidden">
            <div className="max-h-52 overflow-y-auto py-1">
              {sources.length === 0 ? (
                <div className="px-4 py-3 text-sm text-slate-400 italic">
                  No hay fuentes de ingreso
                </div>
              ) : (
                sources.map((source) => (
                  <button
                    key={source.id}
                    type="button"
                    onClick={() => {
                      onChange(source.id);
                      setOpen(false);
                    }}
                    className={`
                      w-full flex items-center justify-between px-4 py-2.5 text-sm text-left transition-colors
                      ${
                        value === source.id
                          ? "bg-[#e6f7fa] text-[#0E7C8B] font-semibold"
                          : "text-slate-700 hover:bg-slate-50"
                      }
                    `}
                  >
                    {source.name}
                    {value === source.id && <FaCheck size={10} className="text-[#0E7C8B]" />}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50">
        <span className="text-sm text-slate-600">¿No ves la fuente?</span>
        <button
          type="button"
          onClick={() => {
            setShowNewForm((p) => !p);
            setOpen(false);
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-[#E6F7FA] px-3 py-2 text-sm font-semibold text-[#0E7C8B] hover:bg-[#d7f0f4] transition-colors"
        >
          <FaPlus size={12} />
          Agregar fuente
        </button>
      </div>

      {showNewForm && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
          <input
            type="text"
            placeholder="Nombre de la fuente (ej: Salario)"
            value={newSourceName}
            onChange={(e) => {
              setNewSourceName(e.target.value);
              setError(null);
            }}
            disabled={creating}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-[#0E7C8B] focus:ring-2 focus:ring-[#0E7C8B]/10 transition-all"
          />

          {error && <p className="text-xs text-red-500">{error}</p>}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setShowNewForm(false);
                setNewSourceName("");
                setError(null);
              }}
              disabled={creating}
              className="flex-1 px-3 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleCreateSource}
              disabled={creating || !newSourceName.trim()}
              className="flex-1 px-3 py-2 text-sm bg-[#0E7C8B] text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creating ? "Creando..." : "Crear"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
