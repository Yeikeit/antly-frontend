import { Suspense } from 'react';
import { ForgotPasswordScreen } from '@/components/auth/screens/ForgotPasswordScreen';

export default function ForgotPasswordPage() {
  return (
    <Suspense>
      <ForgotPasswordScreen />
    </Suspense>
  );
}
