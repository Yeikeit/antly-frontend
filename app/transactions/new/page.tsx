"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getActiveBudget } from "@/lib/api/budgets";
import { getCategories, type CategoryTree, type Subcategory, type CategoryType } from "@/lib/api/categories";
import { createTransaction, type TransactionType } from "@/lib/api/transactions";
import { FaChevronDown, FaCheck } from "react-icons/fa";
import Link from "next/link";

type Tab = "EXPENSE" | "INCOME";

function toLocalDateString(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/* ── Custom Select ── */
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

/* ── Page ── */
export default function NewTransactionPage() {
  const router = useRouter();

  const [tab, setTab]                   = useState<Tab>("EXPENSE");
  const [amountStr, setAmountStr]       = useState("");
  const [date, setDate]                 = useState(toLocalDateString(new Date()));
  const [description, setDescription]   = useState("");
  const [categories, setCategories]     = useState<CategoryTree[]>([]);
  const [budgetId, setBudgetId]         = useState<string | null>(null);
  const [selectedCatId, setSelectedCatId] = useState("");
  const [selectedSubId, setSelectedSubId] = useState("");
  const [saving, setSaving]             = useState(false);
  const [error, setError]               = useState<string | null>(null);

  useEffect(() => {
    getActiveBudget().then((b) => {
      if (!b) { router.replace("/settingBudget"); return; }
      setBudgetId(b.id);
    });
    getCategories().then(setCategories);
  }, [router]);

  const typeMap: Record<Tab, CategoryType> = { EXPENSE: "EXPENSE", INCOME: "INCOME" };
  const filteredCats  = categories.filter((c) => c.type === typeMap[tab]);
  const selectedCat   = filteredCats.find((c) => c.id === selectedCatId) ?? null;
  const subcategories: Subcategory[] = selectedCat?.subcategories ?? [];

  const catOptions = filteredCats.map((c) => ({ id: c.id, label: c.name }));
  const subOptions = subcategories.map((s) => ({ id: s.id, label: s.name }));

  function handleTabChange(t: Tab) {
    setTab(t);
    setSelectedCatId("");
    setSelectedSubId("");
  }

  function handleCatChange(id: string) {
    setSelectedCatId(id);
    setSelectedSubId("");
  }

  const amount  = parseFloat(amountStr.replace(",", ".")) || 0;
  const canSave = amount > 0 && selectedSubId !== "" && budgetId !== null;

  async function handleSave() {
    if (!canSave || !budgetId) return;
    setSaving(true);
    setError(null);
    try {
      await createTransaction(budgetId, {
        categoryId: selectedSubId,
        type: tab as TransactionType,
        amount,
        transactionDate: date,
        description: description.trim() || undefined,
      });
      router.push("/budget");
    } catch {
      setError("No se pudo guardar la transacción. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-4 space-y-8">

      {/* Encabezado */}
      <div>
        <p className="text-xs text-slate-400 uppercase tracking-wide font-medium mb-1">Presupuesto</p>
        <h1 className="text-2xl font-bold text-slate-900">Nueva Transacción</h1>
      </div>

      {/* Card principal */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-50">

        {/* Tipo toggle */}
        <div className="p-6">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Tipo</p>
          <div className="inline-flex bg-slate-100 rounded-xl p-1 gap-1">
            {(["EXPENSE", "INCOME"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => handleTabChange(t)}
                className={`px-8 py-2 rounded-lg text-sm font-semibold transition-all ${
                  tab === t ? "bg-[#0E7C8B] text-white shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {t === "EXPENSE" ? "Gasto" : "Ingreso"}
              </button>
            ))}
          </div>
        </div>

        {/* Monto */}
        <div className="p-6">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Monto</p>
          <div className="flex items-center gap-3 border border-slate-200 rounded-xl px-5 py-4 focus-within:border-[#0E7C8B] transition-colors">
            <span className="text-2xl font-light text-slate-400">$</span>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={amountStr}
              onChange={(e) => setAmountStr(e.target.value)}
              className="flex-1 text-3xl font-bold text-slate-800 bg-transparent outline-none placeholder:text-slate-200"
            />
          </div>
        </div>

        {/* Categoría */}
        <div className="p-6 space-y-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Categoría</p>
          <div className="grid grid-cols-2 gap-4">

            {/* Categoría padre */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-600">Categoría</label>
              <CustomSelect
                options={catOptions}
                value={selectedCatId}
                onChange={handleCatChange}
                placeholder="Seleccionar..."
              />
            </div>

            {/* Subcategoría */}
            <div className="space-y-1.5">
              <label className={`text-sm font-medium transition-colors ${!selectedCatId ? "text-slate-300" : "text-slate-600"}`}>
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

          {/* Chip de selección activa */}
          {selectedCat && selectedSubId && (
            <div className="flex items-center gap-2 mt-1">
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

        {/* Fecha y Nota en grid */}
        <div className="p-6 grid grid-cols-2 gap-6">

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-600">Fecha</label>
            <div className="relative">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 bg-white outline-none focus:border-[#0E7C8B] focus:ring-2 focus:ring-[#0E7C8B]/10 transition-all hover:border-[#0E7C8B] hover:shadow-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-600">
              Nota <span className="text-slate-400 font-normal">(opcional)</span>
            </label>
            <textarea
              rows={1}
              placeholder="Agrega una descripción..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 bg-white outline-none focus:border-[#0E7C8B] focus:ring-2 focus:ring-[#0E7C8B]/10 transition-all hover:border-[#0E7C8B] hover:shadow-sm resize-none placeholder:text-slate-300"
            />
          </div>

        </div>

      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      {/* Acciones */}
      <div className="flex gap-3">
        <Link
          href="/budget"
          className="flex-1 text-center border border-slate-200 text-slate-600 font-semibold py-3 rounded-xl hover:bg-slate-50 transition-colors text-sm"
        >
          Cancelar
        </Link>
        <button
          onClick={handleSave}
          disabled={!canSave || saving}
          className="flex-1 bg-[#0E7C8B] text-white font-semibold py-3 rounded-xl hover:bg-[#0a6470] transition-colors text-sm shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {saving ? "Guardando..." : "Guardar transacción"}
        </button>
      </div>

    </div>
  );
}
