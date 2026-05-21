'use client';

import { useState } from 'react';
import * as usersApi from '@/lib/api/users';
import { ApiError } from '@/lib/api/client';

export function useChangePassword() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function changePassword(currentPassword: string, newPassword: string) {
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);
    try {
      await usersApi.changePassword({ currentPassword, newPassword });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error al cambiar la contraseña');
    } finally {
      setIsSubmitting(false);
    }
  }

  return { changePassword, isSubmitting, error, success };
}
