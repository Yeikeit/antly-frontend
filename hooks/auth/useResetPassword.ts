'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { resetPassword } from '@/lib/api/auth';

export function useResetPassword() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (newPassword !== confirm) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await resetPassword(token, newPassword);
      router.replace('/login?reset=1');
    } catch {
      setError('Token inválido o expirado. Solicita un nuevo enlace.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return { newPassword, setNewPassword, confirm, setConfirm, isSubmitting, error, submit, hasToken: !!token };
}
