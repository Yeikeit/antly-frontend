type AuthCardProps = {
    title: string;
    subtitle?: string;
    children: React.ReactNode;
};

export function AuthCard({ title, subtitle, children }: AuthCardProps) {
    return (
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
                {subtitle ? <p className="mt-2 text-sm text-slate-600">{subtitle}</p> : null}
            </div>

            {children}
        </div>
    );
}