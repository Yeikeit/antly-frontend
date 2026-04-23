'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import * as authApi from '@/lib/api/auth';
import { getStoredRefreshToken } from '@/lib/auth/session';
import { useAuthContext } from '@/store/auth-context';

export function useLogout() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { clearUser } = useAuthContext();
    const router = useRouter();

    const logout = useCallback(async () => {
        try {
            setIsSubmitting(true);

            const refreshToken = getStoredRefreshToken();

            if (refreshToken) {
                try {
                    await authApi.logout(refreshToken);
                } catch {
                    // aunque falle el backend, limpiamos local
                }
            }

            clearUser();
            router.push('/login');
        } finally {
            setIsSubmitting(false);
        }
    }, [clearUser, router]);

    return {
        logout,
        isSubmitting,
    };
}