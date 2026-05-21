'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import * as usersApi from '@/lib/api/users';
import { useAuthContext } from '@/store/auth-context';
import { ApiError } from '@/lib/api/client';

export function useDeleteAccount() {
  const { clearUser } = useAuthContext();
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function deleteAccount() {
    setIsDeleting(true);
    setError(null);
    try {
      await usersApi.deleteAccount();
      clearUser();
      router.replace('/');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error al eliminar la cuenta');
      setIsDeleting(false);
    }
  }

  return { deleteAccount, isDeleting, error };
}
