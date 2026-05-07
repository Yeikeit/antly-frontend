type BudgetWrapperProps = {
  children: React.ReactNode;
  progressBar?: React.ReactNode;
};

export function BudgetWrapper({ children, progressBar }: BudgetWrapperProps) {
  return (
    <div className="rounded-xl bg-white border border-primary/30 p-8 shadow-lg w-full max-w-5xl mx-auto">
      {progressBar && <div className="mb-6">{progressBar}</div>}
      {children}
    </div>
  );
}