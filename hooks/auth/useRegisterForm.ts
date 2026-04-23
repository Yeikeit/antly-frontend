'use client';

import { useState } from 'react';
import { useRegister } from '@/hooks/auth/useRegister';

export function useRegisterForm() {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const { register, isSubmitting, error } = useRegister();

    async function submit() {
        await register(email, password, firstName, lastName);
    }

    return {
        values: {
            firstName,
            lastName,
            email,
            password,
        },
        actions: {
            setFirstName,
            setLastName,
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