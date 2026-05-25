import Link from "next/link";
import { useRecentTransactions } from "@/hooks/transaction/useRecentTransactions";
import { useCategories } from "@/hooks/category/useCategories";

export default function RecentTransactions() {
  const { transactions, loading } = useRecentTransactions();
  const { categoryMap } = useCategories();

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 w-full border border-slate-100">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-lg text-slate-900">Reciente</h3>
        <Link href="/transactions" className="text-xs text-[#0E7C8B] hover:underline font-medium">
          Ver todo
        </Link>
      </div>
      {loading ? (
        <div className="text-xs text-slate-400 py-4">Cargando...</div>
      ) : transactions.length === 0 ? (
        <div className="text-xs text-slate-400 py-4">Aún no hay transacciones registradas</div>
      ) : (
        <ul className="space-y-3">
          {transactions.map((tx) => (
            <li key={tx.id} className="flex items-center justify-between">
              <div className="flex-1">
                <div className="font-medium text-slate-900 text-sm">{tx.name}</div>
                <div className="text-xs text-slate-500">
                  {categoryMap[tx.category] || tx.category} • {tx.dateLabel}
                </div>
              </div>
              <div
                className={`text-sm font-semibold whitespace-nowrap ml-2 ${
                  tx.isIncome ? "text-emerald-600" : "text-red-600"
                }`}
              >
                {tx.amount}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}