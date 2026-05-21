'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLogin } from '@/hooks/auth/useLogin';

export function useLoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const searchParams = useSearchParams();

    const { login, isSubmitting, error } = useLogin();

    async function submit() {
        const next = searchParams.get('next') ?? undefined;
        await login(email, password, next);
    }

    return {
        values: {
            email,
            password,
        },
        actions: {
            setEmail,
            setPassword,
            submit,
        },
        state: {
            isSubmitting,
            error,
        },
    };
}