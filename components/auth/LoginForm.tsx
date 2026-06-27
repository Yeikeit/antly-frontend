'use client';

import { FormInput } from '@/components/forms/FormInput';
import { FormErrorMessage } from '@/components/forms/FormErrorMessage';
import { SubmitButton } from '@/components/forms/SubmitButton';
import { AuthFormFooter } from '@/components/auth/AuthFormFooter';
import { useLoginForm } from '@/hooks/auth/useLoginForm';

export function LoginForm() {
    const { values, actions, state } = useLoginForm();

    return (
        <form
            onSubmit={async (event) => {
                event.preventDefault();
                await actions.submit();
            }}
            className="space-y-4"
        >
            <FormInput
                id="email"
                name="email"
                label="Correo electrónico"
                type="email"
                value={values.email}
                onChange={actions.setEmail}
                placeholder="correo@ejemplo.com"
            />

            <div className="space-y-1">
                <div className="flex items-center justify-between">
                    <label htmlFor="password" className="text-sm font-medium text-slate-700">Contraseña</label>
                    <a href="/forgot-password" className="text-xs text-[#0E7C8B] hover:underline">
                        ¿Olvidaste tu contraseña?
                    </a>
                </div>
                <FormInput
                    id="password"
                    name="password"
                    label=""
                    type="password"
                    value={values.password}
                    onChange={actions.setPassword}
                    placeholder="••••••••"
                />
            </div>

            <FormErrorMessage message={state.error} />

            <SubmitButton
                label="Iniciar sesión"
                loadingLabel="Ingresando..."
                isLoading={state.isSubmitting}
            />

            <AuthFormFooter
                text="¿No tienes cuenta?"
                linkText="Regístrate"
                href="/register"
            />
        </form>
    );
}