import { ProgressBar } from "@/components/ui/ProgressBar";

export default function StepsLayout({
  children,
  step,
  totalSteps,
}: {
  children: React.ReactNode;
  step: number;
  totalSteps: number;
}) {
  return (
    <>
      <div className="mb-6">
        <ProgressBar step={step} totalSteps={totalSteps} />
      </div>      {children}
    </>
  );
}