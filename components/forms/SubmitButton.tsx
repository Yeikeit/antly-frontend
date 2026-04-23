type SubmitButtonProps = {
    label: string;
    loadingLabel?: string;
    isLoading?: boolean;
};

export function SubmitButton({
    label,
    loadingLabel = 'Guardando...',
    isLoading = false,
}: SubmitButtonProps) {
    return (
        <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60"
        >
            {isLoading ? loadingLabel : label}
        </button>
    );
}