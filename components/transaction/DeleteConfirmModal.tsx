"use client";

import { useState } from "react";
import { type TransactionRow } from "@/hooks/transaction/useTransactions";

interface Props {
  transaction: TransactionRow;
  onClose: () => void;
  onConfirm: (tx: TransactionRow) => Promise<void>;
}

export function DeleteConfirmModal({ transaction, onClose, onConfirm }: Props) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isIncome = transaction.type === "INCOME";

  async function handleDelete() {
    setDeleting(true);
    setError(null);
    try {
      await onConfirm(transaction);
      onClose();
    } catch {
      setError("No se pudo eliminar. Intenta de nuevo.");
      setDeleting(false);
    }
  }

  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm border border-slate-100">
        {/* Icon + Content */}
        <div className="flex flex-col items-center pt-8 pb-2 px-6">
          <div className="w-14 h-14 flex items-center justify-center rounded-full bg-red-50 text-red-600 mb-4">
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
              <path fill="currentColor" d="M10 2a2 2 0 0 0-2 2H4a1 1 0 0 0 0 2h1v13a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3V6h1a1 1 0 1 0 0-2h-4a2 2 0 0 0-2-2h-4ZM9 6h6v13a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V6h2Zm1 3a1 1 0 0 1 1 1v6a1 1 0 1 1-2 0v-6a1 1 0 0 1 1-1Zm4 0a1 1 0 0 1 1 1v6a1 1 0 1 1-2 0v-6a1 1 0 0 1 1-1Z"/>
            </svg>
          </div>

          <h2 className="text-lg font-bold text-slate-900 text-center">
            ¿Eliminar {isIncome ? "ingreso" : "gasto"}?
          </h2>

          <p className="text-sm text-slate-500 text-center mt-2">
            {transaction.description
              ? <><span className="font-medium text-slate-700">&ldquo;{transaction.description}&rdquo;</span> de{" "}</>
              : (isIncome ? "Este ingreso de " : "Este gasto de ")}
            <span className="font-semibold text-slate-700">
              ${transaction.amount.toLocaleString()}
            </span>{" "}
            será eliminado permanentemente.
          </p>

          <p className="text-xs text-slate-400 text-center mt-1 mb-4">
            Esta acción no se puede deshacer.
          </p>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-xl w-full text-center mb-2">
              {error}
            </p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3 px-6 pb-6">
          <button
            onClick={onClose}
            disabled={deleting}
            className="flex-1 px-4 py-2.5 text-sm font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 px-4 py-2.5 text-sm font-semibold bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {deleting ? "Eliminando..." : "Eliminar"}
          </button>
        </div>
      </div>
    </div>
  );
}
