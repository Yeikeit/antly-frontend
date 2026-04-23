'use client';

import { useState } from 'react';
import { useLogin } from '@/hooks/auth/useLogin';

export function useLoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const { login, isSubmitting, error } = useLogin();

    async function submit() {
        await login(email, password);
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