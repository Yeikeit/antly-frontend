type FormInputProps = {
    id: string;
    name: string;
    label: string;
    type?: string;
    value: string;
    placeholder?: string;
    error?: string;
    onChange: (value: string) => void;
};

export function FormInput({
    id,
    name,
    label,
    type = 'text',
    value,
    placeholder,
    error,
    onChange,
}: FormInputProps) {
    return (
        <div className="space-y-1">
            <label htmlFor={id} className="block text-sm font-medium text-slate-700">
                {label}
            </label>

            <input
                id={id}
                name={name}
                type={type}
                value={value}
                placeholder={placeholder}
                onChange={(e) => onChange(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-500"
            />

            {error ? <p className="text-sm text-red-600">{error}</p> : null}
        </div>
    );
}