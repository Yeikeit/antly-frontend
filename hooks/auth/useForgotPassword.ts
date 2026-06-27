'use client';

import { useState } from 'react';
import { forgotPassword } from '@/lib/api/auth';

export function useForgotPassword() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!email) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch {
      setError('Ocurrió un error. Intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return { email, setEmail, isSubmitting, sent, error, submit };
}
