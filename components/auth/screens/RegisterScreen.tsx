import { AuthCard } from '@/components/auth/AuthCard';
import { RegisterForm } from '@/components/auth/RegisterForm';

export function RegisterScreen() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8">
            <AuthCard
                title="Crear cuenta"
                subtitle="Comienza a organizar tus finanzas de forma simple y clara."
            >
                <RegisterForm />
            </AuthCard>
        </main>
    );
}