type ContinueButtonProps = {
  onClick?: () => void;
  children?: React.ReactNode;
  className?: string;
};

export function ContinueButton({ onClick, children = "Continuar →", className = "" }: ContinueButtonProps) {
  return (
    <button
      type="button"
      className={`rounded bg-teal-600 px-6 py-2 font-semibold text-white hover:bg-teal-700 ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}