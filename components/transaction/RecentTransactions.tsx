import Link from "next/link";
import { useMemo } from "react";
import { useRecentTransactions } from "@/hooks/transaction/useRecentTransactions";
import { useCategories } from "@/hooks/category/useCategories";
import Loader from "@/components/ui/Loader";

export default function RecentTransactions() {
  const { transactions, loading } = useRecentTransactions();
  const { categoryMap, categories } = useCategories();

  const parentMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const cat of categories) {
      for (const sub of cat.subcategories) {
        map[sub.id] = cat.name;
      }
    }
    return map;
  }, [categories]);

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 w-full border border-slate-100 h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-lg text-slate-900">Reciente</h3>
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
            // tx.category is either an income source name (from incomeRows)
            // or a categoryId UUID (from expenseRows with type === "INCOME")
            const resolvedCategory = tx.isIncome && categoryMap[tx.category]
              ? (parentMap[tx.category]
                  ? `${parentMap[tx.category]} / ${categoryMap[tx.category]}`
                  : categoryMap[tx.category])
              : tx.isIncome
              ? tx.category  // income source name
              : parentMap[tx.category]
                ? `${parentMap[tx.category]} / ${categoryMap[tx.category] ?? tx.category}`
                : (categoryMap[tx.category] ?? tx.category);

            return (
            <li key={tx.id} className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="font-medium text-slate-900 text-sm truncate">
                  {resolvedCategory}
                </div>
                <div className="text-xs text-slate-400">{tx.dateLabel}</div>
              </div>
              <div
                className={`text-sm font-semibold whitespace-nowrap ml-2 ${
                  tx.isIncome ? "text-emerald-600" : "text-red-600"
                }`}
              >
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