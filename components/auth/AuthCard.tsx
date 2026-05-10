import Link from 'next/link';

type AuthCardProps = {
    title: string;
    subtitle?: string;
    children: React.ReactNode;
};

export function AuthCard({ title, subtitle, children }: AuthCardProps) {
    return (
        <div className="w-full max-w-md">
            {/* Volver a la landing */}
            <div className="mb-4">
                <Link
                    href="/"
                    className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
                >
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                        <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
                    </svg>
                    Volver al inicio
                </Link>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                {/* Logo */}
                <div className="mb-5 text-center">
                    <span className="text-xl font-bold text-[#0E7C8B]">Antly</span>
                </div>

                <div className="mb-6">
                    <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
                    {subtitle ? <p className="mt-2 text-sm text-slate-600">{subtitle}</p> : null}
                </div>

                {children}
            </div>
        </div>
    );
}