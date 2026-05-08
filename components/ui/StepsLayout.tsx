import { ProgressBar } from "@/components/ui/ProgressBar";

export default function StepsLayout({
  children,
  step,
  totalSteps,
  stepName,
}: {
  children: React.ReactNode;
  step: number;
  totalSteps: number;
  stepName?: string;
}) {
  return (
    <>
      <div className="mb-6">
        <ProgressBar step={step} totalSteps={totalSteps} stepName={stepName} />
      </div>
      {children}
    </>
  );
}