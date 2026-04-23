import { AuthCard } from '@/components/auth/AuthCard';
import { LoginForm } from '@/components/auth/LoginForm';

export function LoginScreen() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8">
      <AuthCard
        title="Iniciar sesión"
        subtitle="Accede a tu presupuesto mensual y controla tus gastos."
      >
        <LoginForm />
      </AuthCard>
    </main>
  );
}