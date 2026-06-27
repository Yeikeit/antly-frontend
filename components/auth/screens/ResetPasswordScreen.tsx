'use client';

import { AuthCard } from '@/components/auth/AuthCard';
import { FormInput } from '@/components/forms/FormInput';
import { FormErrorMessage } from '@/components/forms/FormErrorMessage';
import { SubmitButton } from '@/components/forms/SubmitButton';
import { AuthFormFooter } from '@/components/auth/AuthFormFooter';
import { useResetPassword } from '@/hooks/auth/useResetPassword';

export function ResetPasswordScreen() {
  const { newPassword, setNewPassword, confirm, setConfirm, isSubmitting, error, submit, hasToken } = useResetPassword();

  if (!hasToken) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8">
        <AuthCard title="Enlace inválido">
          <p className="text-sm text-slate-500 mb-4">
            Este enlace de recuperación no es válido o ya fue utilizado.
          </p>
          <AuthFormFooter text="¿Necesitas uno nuevo?" linkText="Recuperar contraseña" href="/forgot-password" />
        </AuthCard>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8">
      <AuthCard
        title="Nueva contraseña"
        subtitle="Elige una contraseña segura para tu cuenta."
      >
        <form
          onSubmit={(e) => { e.preventDefault(); submit(); }}
          className="space-y-4"
        >
          <FormInput
            id="newPassword"
            name="newPassword"
            label="Nueva contraseña"
            type="password"
            value={newPassword}
            onChange={setNewPassword}
            placeholder="Mínimo 6 caracteres"
          />

          <FormInput
            id="confirm"
            name="confirm"
            label="Confirmar contraseña"
            type="password"
            value={confirm}
            onChange={setConfirm}
            placeholder="Repite la contraseña"
          />

          <FormErrorMessage message={error} />

          <SubmitButton
            label="Guardar contraseña"
            loadingLabel="Guardando..."
            isLoading={isSubmitting}
          />
        </form>
      </AuthCard>
    </main>
  );
}
