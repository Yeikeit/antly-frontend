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

            <FormInput
                id="password"
                name="password"
                label="Contraseña"
                type="password"
                value={values.password}
                onChange={actions.setPassword}
                placeholder="••••••••"
            />

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