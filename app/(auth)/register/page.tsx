'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/store/auth-context';
import { ApiError } from '@/lib/api/client';
import { registerSchema } from '@/lib/validations/auth';

type FieldErrors = {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
};

export default function RegisterPage() {
  const { register } = useAuth();
  const [fields, setFields] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  function update(key: keyof typeof fields) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setFields((prev) => ({ ...prev, [key]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError('');

    const result = registerSchema.safeParse(fields);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
        firstName: fieldErrors.firstName?.[0],
        lastName: fieldErrors.lastName?.[0],
      });
      return;
    }
    setErrors({});
    setLoading(true);

    try {
      await register(fields.email, fields.password, fields.firstName, fields.lastName);
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : 'Error inesperado');
    } finally {
      setLoading(false);
    }
  }

  function field(
    id: keyof typeof fields,
    label: string,
    type = 'text',
    autoComplete?: string,
  ) {
    return (
      <div>
        <label
          htmlFor={id}
          className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
        >
          {label}
        </label>
        <input
          id={id}
          type={type}
          autoComplete={autoComplete}
          value={fields[id]}
          onChange={update(id)}
          className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:focus:ring-zinc-400"
        />
        {errors[id] && (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors[id]}</p>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-8">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mb-1">
        Crear cuenta
      </h1>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
        ¿Ya tenés cuenta?{' '}
        <Link
          href="/login"
          className="text-zinc-900 dark:text-zinc-100 font-medium hover:underline"
        >
          Iniciá sesión
        </Link>
      </p>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="grid grid-cols-2 gap-4">
          {field('firstName', 'Nombre', 'text', 'given-name')}
          {field('lastName', 'Apellido', 'text', 'family-name')}
        </div>
        {field('email', 'Email', 'email', 'email')}
        {field('password', 'Contraseña', 'password', 'new-password')}

        {serverError && (
          <p className="text-sm text-red-600 dark:text-red-400">{serverError}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-zinc-900 dark:bg-zinc-50 px-4 py-2 text-sm font-medium text-white dark:text-zinc-900 transition-colors hover:bg-zinc-700 dark:hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creando cuenta...' : 'Crear cuenta'}
        </button>
      </form>
    </div>
  );
}
