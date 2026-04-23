'use client';

import { useAuthContext } from '@/store/auth-context';
import { useLogin } from '@/hooks/auth/useLogin';
import { useRegister } from '@/hooks/auth/useRegister';
import { useLogout } from '@/hooks/auth/useLogout';

export function useAuth() {
    const { user, isLoading } = useAuthContext();
    const { login } = useLogin();
    const { register } = useRegister();
    const { logout } = useLogout();

    return {
        user,
        isLoading,
        login,
        register,
        logout,
    };
}
// Para uso
//const { user, isLoading, login, register, logout } = useAuth();