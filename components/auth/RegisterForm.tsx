'use client';

import { FormInput } from '@/components/forms/FormInput';
import { FormErrorMessage } from '@/components/forms/FormErrorMessage';
import { SubmitButton } from '@/components/forms/SubmitButton';
import { AuthFormFooter } from '@/components/auth/AuthFormFooter';
import { useRegisterForm } from '@/hooks/auth/useRegisterForm';

export function RegisterForm() {
    const { values, actions, state } = useRegisterForm();

    return (
        <form
            onSubmit={async (event) => {
                event.preventDefault();
                await actions.submit();
            }}
            className="space-y-4"
        >
            <FormInput
                id="firstName"
                name="firstName"
                label="Nombre"
                value={values.firstName}
                onChange={actions.setFirstName}
                placeholder="Juan"
            />

            <FormInput
                id="lastName"
                name="lastName"
                label="Apellido"
                value={values.lastName}
                onChange={actions.setLastName}
                placeholder="Pérez"
            />

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
                label="Crear cuenta"
                loadingLabel="Creando cuenta..."
                isLoading={state.isSubmitting}
            />

            <AuthFormFooter
                text="¿Ya tienes cuenta?"
                linkText="Inicia sesión"
                href="/login"
            />
        </form>
    );
}