export function IncomeCard({
  title,
  subtitle,
  children,
  progressBar,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  progressBar?: React.ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-3xl rounded-xl bg-white p-8 shadow">
      {progressBar && <div className="mb-4">{progressBar}</div>}
      <h1 className="mb-2 text-2xl font-semibold text-slate-900">{title}</h1>
      <p className="mb-6 text-sm text-slate-600">{subtitle}</p>
      {children}
    </div>
  );
}