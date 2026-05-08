type ProgressBarProps = {
  step: number;
  totalSteps: number;
  stepName?: string;
};

export function ProgressBar({ step, totalSteps, stepName }: ProgressBarProps) {
  const percent = (step / totalSteps) * 100;
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs text-slate-400">Paso {step} de {totalSteps}</span>
        {stepName && (
          <span className="text-xs font-semibold text-[#0E7C8B]">{stepName}</span>
        )}
      </div>
      <div style={{ width: "100%", background: "#e2e8f0", borderRadius: 8 }}>
        <div
          style={{
            width: `${percent}%`,
            height: 6,
            background: "#0E7C8B",
            borderRadius: 8,
            transition: "width 0.3s",
          }}
        />
      </div>
    </div>
  );
}