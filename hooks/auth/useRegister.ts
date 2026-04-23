'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import * as authApi from '@/lib/api/auth';
import { persistSession } from '@/lib/auth/session';
import { useAuthContext } from '@/store/auth-context';

export function useRegister() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { setUser } = useAuthContext();
    const router = useRouter();

    const register = useCallback(
        async (email: string, password: string, firstName: string, lastName: string) => {
            try {
                setIsSubmitting(true);
                setError(null);

                const response = await authApi.register(email, password, firstName, lastName);

                persistSession(response);
                setUser(response.user);

                router.push('/dashboard');
            } catch (err) {
                setError('No se pudo crear la cuenta');
                throw err;
            } finally {
                setIsSubmitting(false);
            }
        },
        [router, setUser],
    );

    return {
        register,
        isSubmitting,
        error,
    };
}