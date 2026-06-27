import { Suspense } from 'react';
import { ResetPasswordScreen } from '@/components/auth/screens/ResetPasswordScreen';

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordScreen />
    </Suspense>
  );
}
