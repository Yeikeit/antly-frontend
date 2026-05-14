import { useRecentTransactions } from "@/hooks/transaction/useRecentTransactions";

export default function RecentTransactions() {
  const { transactions, loading } = useRecentTransactions();

  return (
    <div className="bg-white rounded-xl shadow p-5 w-full max-w-xs">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-lg text-slate-700">Reciente</h3>
        <a href="#" className="text-xs text-[#0E7C8B] hover:underline">Ver todo</a>
      </div>
      {loading ? (
        <div className="text-xs text-slate-400">Cargando...</div>
      ) : (
        <ul className="space-y-4">
          {transactions.map((tx, idx) => (
            <li key={idx} className="flex items-center justify-between">
              <div>
                <div className="font-medium text-slate-700">{tx.name}</div>
                <div className="text-xs text-slate-400">{tx.category}</div>
              </div>
              <div className={`text-sm font-semibold ${tx.positive ? "text-green-600" : "text-slate-700"}`}>
                {tx.amount}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}