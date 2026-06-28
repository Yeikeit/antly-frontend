"use client";

import { useState, useEffect, useRef } from "react";
import { type TransactionRow, type UpdatePayload } from "@/hooks/transaction/useTransactions";
import { getCategories, type CategoryTree } from "@/lib/api/categories";
import { getIncomeSources, type IncomeSource } from "@/lib/api/incomes";
import { FaChevronDown, FaCheck } from "react-icons/fa";

/* ── Helpers ── */
function toLocalDateString(isoOrDate: string): string {
  return isoOrDate.split("T")[0];
}

type SelectOption = { id: string; label: string };

function CustomSelect({
  options,
  value,
  onChange,
  placeholder,
  disabled = false,
}: {
  options: SelectOption[];
  value: string;
  onChange: (id: string) => void;
  placeholder: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.id === value);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((p) => !p)}
        className={`
          w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl border text-sm font-medium
          transition-all duration-150
          ${disabled
            ? "bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed"
            : open
              ? "bg-white border-[#0E7C8B] ring-2 ring-[#0E7C8B]/10 text-slate-800 shadow-sm"
              : "bg-white border-slate-200 text-slate-700 hover:border-[#0E7C8B] hover:shadow-sm"
          }
        `}
      >
        <span className={selected ? "text-slate-800" : disabled ? "text-slate-300" : "text-slate-400"}>
          {selected ? selected.label : placeholder}
        </span>
        <FaChevronDown
          size={11}
          className={`flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180 text-[#0E7C8B]" : disabled ? "text-slate-200" : "text-slate-400"}`}
        />
      </button>

      {open && (
        <div className="absolute z-20 top-full mt-1.5 left-0 right-0 bg-white border border-slate-100 rounded-xl shadow-lg overflow-hidden">
          <div className="max-h-52 overflow-y-auto py-1">
            {options.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => { onChange(opt.id); setOpen(false); }}
                className={`
                  w-full flex items-center justify-between px-4 py-2.5 text-sm text-left transition-colors
                  ${value === opt.id
                    ? "bg-[#e6f7fa] text-[#0E7C8B] font-semibold"
                    : "text-slate-700 hover:bg-slate-50"
                  }
                `}
              >
                {opt.label}
                {value === opt.id && <FaCheck size={10} className="text-[#0E7C8B]" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Modal ── */
interface Props {
  transaction: TransactionRow;
  onClose: () => void;
  onSave: (tx: TransactionRow, payload: UpdatePayload) => Promise<void>;
}

export function EditTransactionModal({ transaction, onClose, onSave }: Props) {
  const isIncome = transaction.type === "INCOME";

  const [amountStr, setAmountStr] = useState(String(Math.round(Number(transaction.amount))));
  const [description, setDescription] = useState(transaction.description ?? "");
  const [date, setDate] = useState(toLocalDateString(transaction.transactionDate));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // EXPENSE state
  const [categories, setCategories] = useState<CategoryTree[]>([]);
  const [selectedCatId, setSelectedCatId] = useState("");
  const [selectedSubId, setSelectedSubId] = useState(isIncome ? "" : transaction.categoryId);

  // INCOME state
  const [incomeSources, setIncomeSources] = useState<IncomeSource[]>([]);
  const [selectedSourceId, setSelectedSourceId] = useState(isIncome ? transaction.categoryId : "");

  useEffect(() => {
    if (!isIncome) {
      getCategories().then((cats) => {
        setCategories(cats);
        const parent = cats.find((cat) =>
          cat.subcategories.some((sub) => sub.id === transaction.categoryId)
        );
        if (parent) setSelectedCatId(parent.id);
      });
    } else {
      getIncomeSources().then((sources) => {
        setIncomeSources(sources.filter((s) => s.isActive));
      });
    }
  }, [isIncome, transaction.categoryId]);

  const selectedCat = categories.find((c) => c.id === selectedCatId) ?? null;
  const subcategories = selectedCat?.subcategories ?? [];
  const catOptions = categories.filter((c) => c.type === transaction.type).map((c) => ({ id: c.id, label: c.name }));
  const subOptions = subcategories.map((s) => ({ id: s.id, label: s.name }));
  const sourceOptions = incomeSources.map((s) => ({ id: s.id, label: s.name }));

  function handleCatChange(id: string) {
    setSelectedCatId(id);
    setSelectedSubId("");
  }

  const amount = parseFloat(amountStr.replace(",", ".")) || 0;
  const canSave = amount > 0 && (isIncome ? selectedSourceId !== "" : selectedSubId !== "");

  async function handleSubmit() {
    if (!canSave) return;
    setSaving(true);
    setError(null);
    try {
      const payload: UpdatePayload = {
        amount,
        description: description.trim() || undefined,
        transactionDate: date,
        ...(isIncome ? { incomeSourceId: selectedSourceId } : { categoryId: selectedSubId }),
      };
      await onSave(transaction, payload);
      onClose();
    } catch {
      setError("No se pudo guardar los cambios. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  // Close on backdrop click
  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg border border-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Editar {isIncome ? "ingreso" : transaction.type === "SAVING" ? "ahorro" : "gasto"}
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Modifica los datos de esta transacción
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            title="Cerrar"
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
              <path fill="currentColor" d="M6.225 4.811a1 1 0 0 0-1.414 1.414L10.586 12l-5.775 5.775a1 1 0 0 0 1.414 1.414L12 13.414l5.775 5.775a1 1 0 0 0 1.414-1.414L13.414 12l5.775-5.775a1 1 0 0 0-1.414-1.414L12 10.586 6.225 4.811Z"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Monto */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide block mb-2">
              Monto
            </label>
            <div className="flex items-center gap-3 border border-slate-200 rounded-xl px-5 py-4 focus-within:border-[#0E7C8B] transition-colors">
              <span className="text-2xl font-light text-slate-400">$</span>
              <input
                type="number"
                min="0"
                step="1"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                className="flex-1 text-2xl font-bold text-slate-800 bg-transparent outline-none placeholder:text-slate-200"
              />
            </div>
          </div>

          {/* Categoría / Fuente */}
          {isIncome ? (
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide block mb-2">
                Fuente de ingreso
              </label>
              <CustomSelect
                options={sourceOptions}
                value={selectedSourceId}
                onChange={setSelectedSourceId}
                placeholder="Seleccionar fuente..."
              />
            </div>
          ) : (
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide block mb-2">
                Categoría
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-600">Categoría</label>
                  <CustomSelect
                    options={catOptions}
                    value={selectedCatId}
                    onChange={handleCatChange}
                    placeholder="Seleccionar..."
                  />
                </div>
                <div className="space-y-1.5">
                  <label
                    className={`text-sm font-medium transition-colors ${
                      !selectedCatId ? "text-slate-300" : "text-slate-600"
                    }`}
                  >
                    Subcategoría
                  </label>
                  <CustomSelect
                    options={subOptions}
                    value={selectedSubId}
                    onChange={setSelectedSubId}
                    placeholder={!selectedCatId ? "Primero elige categoría" : "Seleccionar..."}
                    disabled={!selectedCatId}
                  />
                </div>
              </div>

              {selectedCat && selectedSubId && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="w-2 h-2 rounded-full bg-[#0E7C8B]" />
                  <span className="text-sm text-slate-500">
                    {selectedCat.name}
                    <span className="text-slate-300 mx-1.5">›</span>
                    <span className="text-[#0E7C8B] font-medium">
                      {subcategories.find((s) => s.id === selectedSubId)?.name}
                    </span>
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Fecha y Nota */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-600 block mb-1.5">Fecha</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 focus:outline-none focus:border-[#0E7C8B] transition-colors"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 block mb-1.5">
                Nota (opcional)
              </label>
              <input
                type="text"
                placeholder="Agrega una nota..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 focus:outline-none focus:border-[#0E7C8B] transition-colors placeholder:text-slate-300"
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl">{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSave || saving}
            className="px-5 py-2.5 text-sm font-semibold bg-[#0E7C8B] text-white rounded-xl hover:bg-[#0a6470] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </div>
    </div>
  );
}
