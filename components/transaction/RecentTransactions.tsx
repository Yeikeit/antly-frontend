'use client';

import Link from "next/link";
import { useRecentTransactions } from "@/hooks/transaction/useRecentTransactions";
import { useCategories } from "@/hooks/category/useCategories";
import Loader from "@/components/ui/Loader";

export default function RecentTransactions() {
  const { transactions, loading } = useRecentTransactions();
  const { categoryMap } = useCategories();

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 w-full border border-slate-100 h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-lg text-slate-900">Transacciones recientes</h3>
        <Link href="/transactions" className="text-xs text-[#0E7C8B] hover:underline font-medium">
          Ver todo
        </Link>
      </div>
      {loading ? (
        <Loader size="sm" />
      ) : transactions.length === 0 ? (
        <div className="text-xs text-slate-400 py-4">Aún no hay transacciones registradas</div>
      ) : (
        <ul className="space-y-3">
          {transactions.map((tx) => {
            const label = categoryMap[tx.category] ?? tx.category;
            const time = new Date(tx.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
            return (
              <li key={tx.id} className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-slate-900 text-sm truncate">{label}</div>
                  <div className="text-xs text-slate-400">{tx.dateLabel} · {time}</div>
                </div>
                <div className={`text-sm font-semibold whitespace-nowrap ml-2 ${tx.isIncome ? "text-emerald-600" : "text-red-600"}`}>
                  {tx.amount}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}