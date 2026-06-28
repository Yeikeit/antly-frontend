"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getActiveBudget, getBudgetSummary } from "@/lib/api/budgets";
import { getCategories, type CategoryTree, type Subcategory, type CategoryType } from "@/lib/api/categories";
import { createTransaction, type TransactionType } from "@/lib/api/transactions";
import { getIncomeSources, createIncome, type IncomeSource } from "@/lib/api/incomes";
import { IncomeSourceSelect } from "@/components/transaction/IncomeSourceSelect";
import { CustomSelect } from "@/components/ui/CustomSelect";
import Link from "next/link";

/* ── Page ── */
export default function NewTransactionPage() {
  const router = useRouter();

  const [tab, setTab] = useState<Tab>("EXPENSE");
  const [rawAmount, setRawAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState("");
  const [categories, setCategories] = useState<CategoryTree[]>([]);
  const [incomeSources, setIncomeSources] = useState<IncomeSource[]>([]);
  const [budgetId, setBudgetId] = useState<string | null>(null);
  const [selectedCatId, setSelectedCatId] = useState("");
  const [selectedSubId, setSelectedSubId] = useState("");
  const [selectedIncomeSourceId, setSelectedIncomeSourceId] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getActiveBudget().then(async (b) => {
      if (!b) { router.replace("/settingBudget"); return; }
      setBudgetId(b.id);

      const [allCats, summary] = await Promise.all([
        getCategories(),
        getBudgetSummary(b.id).catch(() => null),
      ]);

      if (summary) {
        const allocatedIds = new Set(summary.allocations.map((a) => a.categoryId));
        const filtered = allCats
          .map((cat) => ({
            ...cat,
            subcategories: cat.subcategories.filter((sub) => allocatedIds.has(sub.id)),
          }))
          .filter((cat) => cat.subcategories.length > 0);
        setCategories(filtered);
      } else {
        setCategories(allCats);
      }
    });

    getIncomeSources().then((sources) => {
      setIncomeSources(sources.filter((source) => source.isActive));
    });
  }, [router]);

  useEffect(() => {
    if (!selectedIncomeSourceId) return;
    const stillAvailable = incomeSources.some((source) => source.id === selectedIncomeSourceId);
    if (!stillAvailable) {
      setSelectedIncomeSourceId("");
    }
  }, [incomeSources, selectedIncomeSourceId]);

  const typeMap: Record<Tab, CategoryType> = { EXPENSE: "EXPENSE", INCOME: "INCOME", SAVING: "SAVING" };
  const isIncome = tab === "INCOME";
  const filteredCats = categories.filter((c) => c.type === typeMap[tab]);
  const selectedCat = filteredCats.find((c) => c.id === selectedCatId) ?? null;
  const subcategories: Subcategory[] = selectedCat?.subcategories ?? [];

  const catOptions = filteredCats
    .map((c) => ({ id: c.id, label: c.name }))
    .sort((a, b) => a.label.localeCompare(b.label, "es"));
  const subOptions = subcategories
    .map((s) => ({ id: s.id, label: s.name }))
    .sort((a, b) => a.label.localeCompare(b.label, "es"));

  // Si hay una sola categoría (ej: ahorro), fijarla automáticamente
  useEffect(() => {
    if (filteredCats.length === 1 && selectedCatId !== filteredCats[0].id) {
      setSelectedCatId(filteredCats[0].id);
      setSelectedSubId("");
    }
  }, [tab, filteredCats.length]);

  // Si la categoría fijada tiene una sola subcategoría, fijarla también
  useEffect(() => {
    if (subcategories.length === 1 && selectedSubId !== subcategories[0].id) {
      setSelectedSubId(subcategories[0].id);
    }
  }, [selectedCatId, subcategories.length]);

  function handleTabChange(t: Tab) {
    setTab(t);
    setSelectedCatId("");
    setSelectedSubId("");
    setSelectedIncomeSourceId("");
  }

  function handleCatChange(id: string) {
    setSelectedCatId(id);
    setSelectedSubId("");
  }

  const amount = parseInt(rawAmount.replace(/\./g, ""), 10) || 0;
  const displayAmount = amount > 0 ? amount.toLocaleString("es-CL") : "";

  function handleAmountChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, "");
    setRawAmount(digits ? parseInt(digits, 10).toLocaleString("es-CL") : "");
  }

  const canSave = amount > 0 && budgetId !== null && (isIncome ? selectedIncomeSourceId !== "" : selectedSubId !== "");

  async function handleSave() {
    if (!canSave || !budgetId) return;
    setSaving(true);
    setError(null);
    try {
      if (isIncome) {
        await createIncome(budgetId, {
          incomeSourceId: selectedIncomeSourceId,
          budgetId,
          amount,
          receivedDate: date,
          description: description.trim() || undefined,
        });
      } else {
        await createTransaction(budgetId, {
          categoryId: selectedSubId,
          type: tab as TransactionType,
          amount,
          transactionDate: date,
          description: description.trim() || undefined,
        });
      }
      router.push("/transactions");
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
            {(["EXPENSE", "INCOME", "SAVING"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => handleTabChange(t)}
                className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${tab === t ? "bg-[#0E7C8B] text-white shadow-sm" : "text-slate-500 hover:text-slate-700"
                  }`}
              >
                {t === "EXPENSE" ? "Gasto" : t === "INCOME" ? "Ingreso" : "Ahorro"}
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
              type="text"
              inputMode="numeric"
              placeholder="0"
              value={displayAmount}
              onChange={handleAmountChange}
              className="flex-1 text-3xl font-bold text-slate-800 bg-transparent outline-none placeholder:text-slate-200"
            />
          </div>
        </div>

        {isIncome ? (
          <div className="p-6 space-y-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Fuente de ingreso</p>
            <IncomeSourceSelect
              sources={incomeSources}
              value={selectedIncomeSourceId}
              onChange={setSelectedIncomeSourceId}
              onNewSourceCreated={(source) => setIncomeSources((prev) => [...prev, source])}
            />
          </div>
        ) : (
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
                  searchable
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
                  searchable
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
        )}

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
          href="/transactions"
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
