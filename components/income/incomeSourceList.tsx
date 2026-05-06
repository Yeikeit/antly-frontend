export function IncomeSourceList({ sources, onRemove }: { sources: { name: string; amount: number }[], onRemove: (i: number) => void }) {
  return (
    <div className="mb-4 space-y-2">
      {sources.map((s, i) => (
        <div key={i} className="flex items-center justify-between rounded bg-white p-2 shadow">
          <span>{s.name}</span>
          <span>${s.amount.toLocaleString()}</span>
          <button className="text-black-500" onClick={() => onRemove(i)}>×</button>
        </div>
      ))}
    </div>
  );
}