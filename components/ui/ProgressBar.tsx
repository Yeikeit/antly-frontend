type ProgressBarProps = {
  step: number;
  totalSteps: number;
};

export function ProgressBar({ step, totalSteps }: ProgressBarProps) {
  const percent = (step / totalSteps) * 100;
  return (
    <div style={{ width: "100%", background: "#eee", borderRadius: 8 }}>
      <div
        style={{
          width: `${percent}%`,
          height: 8,
          background: "#0E7C8B",
          borderRadius: 8,
          transition: "width 0.3s"
        }}
      />
    </div>
  );
}