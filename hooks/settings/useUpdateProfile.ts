'use client';

import { useState } from 'react';
import * as usersApi from '@/lib/api/users';
import { useAuthContext } from '@/store/auth-context';
import { getStoredUser } from '@/lib/auth/session';
import { ApiError } from '@/lib/api/client';

export function useUpdateProfile() {
  const { setUser } = useAuthContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function updateProfile(firstName: string, lastName: string, email: string) {
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);
    try {
      const updated = await usersApi.updateProfile({ firstName, lastName, email });
      setUser(updated);
      // Keep localStorage in sync
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_user', JSON.stringify(updated));
      }
      setSuccess(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error al actualizar el perfil');
    } finally {
      setIsSubmitting(false);
    }
  }

  return { updateProfile, isSubmitting, error, success };
}
