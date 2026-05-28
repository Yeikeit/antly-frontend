interface LoaderProps {
  /** full-page centered loader (default: false — inline centered) */
  fullPage?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: "w-5 h-5 border-2",
  md: "w-9 h-9 border-[3px]",
  lg: "w-14 h-14 border-4",
};

export default function Loader({ fullPage = false, size = "md" }: LoaderProps) {
  const spinner = (
    <div className="flex flex-col items-center gap-3">
      <span
        className={`
          ${sizeMap[size]}
          rounded-full
          border-[#0E7C8B]/20
          border-t-[#0E7C8B]
          animate-spin
        `}
      />
    </div>
  );

  if (fullPage) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        {spinner}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center w-full py-16">
      {spinner}
    </div>
  );
}
