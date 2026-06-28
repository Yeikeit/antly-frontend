'use client';

import { useState } from 'react';

type FormInputProps = {
    id: string;
    name: string;
    label?: string;
    type?: string;
    value: string;
    placeholder?: string;
    error?: string;
    onChange: (value: string) => void;
};

function EyeIcon({ open }: { open: boolean }) {
    return open ? (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
                d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/>
            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8"/>
        </svg>
    ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
                d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-6.4 0-10-8-10-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c6.4 0 10 8 10 8a18.5 18.5 0 0 1-2.16 3.19M3 3l18 18"/>
        </svg>
    );
}

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
    const isPassword = type === 'password';
    const [showPassword, setShowPassword] = useState(false);
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
        <div className="space-y-1">
            {label ? (
                <label htmlFor={id} className="block text-sm font-medium text-slate-700">
                    {label}
                </label>
            ) : null}

            <div className="relative">
                <input
                    id={id}
                    name={name}
                    type={inputType}
                    value={value}
                    placeholder={placeholder}
                    onChange={(e) => onChange(e.target.value)}
                    className={`w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-500 ${isPassword ? 'pr-10' : ''}`}
                />
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        tabIndex={-1}
                        aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                        <EyeIcon open={showPassword} />
                    </button>
                )}
            </div>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}
        </div>
    );
}
