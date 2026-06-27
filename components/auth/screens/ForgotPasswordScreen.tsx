'use client';

import { AuthCard } from '@/components/auth/AuthCard';
import { FormInput } from '@/components/forms/FormInput';
import { FormErrorMessage } from '@/components/forms/FormErrorMessage';
import { SubmitButton } from '@/components/forms/SubmitButton';
import { AuthFormFooter } from '@/components/auth/AuthFormFooter';
import { useForgotPassword } from '@/hooks/auth/useForgotPassword';

export function ForgotPasswordScreen() {
  const { email, setEmail, isSubmitting, sent, error, submit } = useForgotPassword();

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8">
      <AuthCard
        title="Recuperar contraseña"
        subtitle="Te enviaremos un enlace para restablecer tu contraseña."
      >
        {sent ? (
          <div className="text-center py-4">
            <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm text-slate-700 font-medium mb-1">Revisa tu correo</p>
            <p className="text-sm text-slate-500">
              Si <strong>{email}</strong> está registrado, recibirás un enlace en los próximos minutos.
            </p>
            <AuthFormFooter text="¿Ya tienes el enlace?" linkText="Iniciar sesión" href="/login" />
          </div>
        ) : (
          <form
            onSubmit={(e) => { e.preventDefault(); submit(); }}
            className="space-y-4"
          >
            <FormInput
              id="email"
              name="email"
              label="Correo electrónico"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="correo@ejemplo.com"
            />

            <FormErrorMessage message={error} />

            <SubmitButton
              label="Enviar enlace"
              loadingLabel="Enviando..."
              isLoading={isSubmitting}
            />

            <AuthFormFooter text="¿Recordaste tu contraseña?" linkText="Iniciar sesión" href="/login" />
          </form>
        )}
      </AuthCard>
    </main>
  );
}
