"use client";
import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useEditBudget } from "@/hooks/budget/useEditBudget";
import { useEditBudgetFlow } from "@/store/EditBudgetFlowContext";
import { CategorySidebar } from "@/components/budget/CategorySidebar";
import { CategoryDetailCard } from "@/components/budget/CategoryDetailCard";
import { BudgetWrapper } from "@/components/budget/BudgetWrapper";

function RemoveWarningDialog({
  categoryName,
  spent,
  onConfirm,
  onCancel,
}: {
  categoryName: string;
  spent: number;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-start gap-3">
          <span className="mt-0.5 text-2xl">⚠️</span>
          <div>
            <p className="font-semibold text-slate-900">¿Desasociar categoría?</p>
            <p className="mt-1 text-sm text-slate-600">
              La subcategoría <strong>{categoryName}</strong> tiene{" "}
              <strong className="text-amber-600">
                ${spent.toLocaleString("es-CL", { minimumFractionDigits: 0 })}
              </strong>{" "}
              en transacciones registradas. Desasociarla no eliminará esas transacciones del
              historial, pero quedarán sin categoría de presupuesto.
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600"
          >
            Sí, desasociar
          </button>
        </div>
      </div>
    </div>
  );
}

export function EditAllocationScreen() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { incomeSources } = useEditBudgetFlow();

  const {
    categories,
    selectedId,
    setSelectedId,
    selectedCategory,
    handleAddCategory,
    handleCategoryChange,
    handleTypeChange,
    handleSubChange,
    handleAddSub,
    handleRemoveSub,
    handleRemoveCategory,
    getSubSpent,
  } = useEditBudget();

  // Warning state: pending removal
  const [pendingRemoveCat, setPendingRemoveCat] = useState<{
    catId: string;
    name: string;
    spent: number;
  } | null>(null);

  const [pendingRemoveSub, setPendingRemoveSub] = useState<{
    subId: string;
    name: string;
    spent: number;
  } | null>(null);

  function requestRemoveCategory(catId: string) {
    const cat = categories.find((c) => c.id === catId);
    if (!cat) return;
    // Calculate total spent across subcategories
    const totalSpent = cat.subcategories.reduce((acc, sub) => acc + getSubSpent(sub.id), 0);
    if (totalSpent > 0) {
      setPendingRemoveCat({ catId, name: cat.name, spent: totalSpent });
    } else {
      handleRemoveCategory(catId);
    }
  }

  function requestRemoveSub(subId: string) {
    const sub = selectedCategory?.subcategories.find((s) => s.id === subId);
    if (!sub) return;
    const spent = getSubSpent(subId);
    if (spent > 0) {
      setPendingRemoveSub({ subId, name: sub.name, spent });
    } else {
      handleRemoveSub(subId);
    }
  }

  const totalIncome = incomeSources.reduce((acc, s) => acc + s.amount, 0);
  const totalAllocated = categories.reduce(
    (acc, cat) =>
      acc + cat.subcategories.reduce((a, sub) => a + (Number(sub.budget) || 0), 0),
    0
  );
  const remaining = totalIncome - totalAllocated;
  const isOver = remaining < 0;

  return (
    <>
      {pendingRemoveCat && (
        <RemoveWarningDialog
          categoryName={pendingRemoveCat.name}
          spent={pendingRemoveCat.spent}
          onConfirm={() => {
            handleRemoveCategory(pendingRemoveCat.catId);
            setPendingRemoveCat(null);
          }}
          onCancel={() => setPendingRemoveCat(null)}
        />
      )}
      {pendingRemoveSub && (
        <RemoveWarningDialog
          categoryName={pendingRemoveSub.name}
          spent={pendingRemoveSub.spent}
          onConfirm={() => {
            handleRemoveSub(pendingRemoveSub.subId);
            setPendingRemoveSub(null);
          }}
          onCancel={() => setPendingRemoveSub(null)}
        />
      )}

      <main className="min-h-screen bg-slate-50 px-4 py-6 flex justify-center">
        <BudgetWrapper>
          <h2 className="mb-1 text-xl font-bold text-slate-900">Editar asignaciones</h2>
          <p className="mb-6 text-sm text-slate-500">
            Modifica los montos asignados, agrega nuevas categorías o desasocia las que no aplican
            para este mes.
          </p>

          <div className="flex w-full gap-6">
            <CategorySidebar
              categories={categories}
              selectedId={selectedId ?? ""}
              onSelect={setSelectedId}
              onAddCategory={handleAddCategory}
              onRemoveCategory={requestRemoveCategory}
            />
            <div className="flex-1">
              {selectedCategory ? (
                <CategoryDetailCard
                  category={selectedCategory}
                  onCategoryChange={handleCategoryChange}
                  onTypeChange={handleTypeChange}
                  onSubChange={handleSubChange}
                  onAddSub={handleAddSub}
                  onRemoveSub={requestRemoveSub}
                />
              ) : (
                <div className="flex h-full items-center justify-center rounded-xl border-2 border-dashed border-slate-200 p-12 text-sm text-slate-400">
                  Selecciona o crea una categoría para comenzar
                </div>
              )}
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={() => router.push(`/budget/${id}/edit/incomes`)}
              className="rounded-lg border border-slate-200 px-5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              ← Regresar
            </button>

            <p className="text-sm text-slate-500">
              Presupuesto restante:{" "}
              <span className={`font-semibold ${isOver ? "text-red-600" : "text-[#0E7C8B]"}`}>
                ${remaining.toLocaleString("es-CL", { minimumFractionDigits: 2 })}
              </span>
            </p>

            <button
              type="button"
              onClick={() => router.push(`/budget/${id}/edit/confirmation`)}
              className="rounded-lg bg-[#0E7C8B] px-5 py-2 text-sm font-semibold text-white hover:bg-teal-700"
            >
              Revisar cambios →
            </button>
          </div>
        </BudgetWrapper>
      </main>
    </>
  );
}
