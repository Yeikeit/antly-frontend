'use client';

import { useState, useEffect } from 'react';
import * as usersApi from '@/lib/api/users';
import { ApiError } from '@/lib/api/client';

export function useBudgetPreferences() {
  const [monthlyAutomation, setMonthlyAutomation] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    usersApi.getBudgetPreferences()
      .then((prefs) => setMonthlyAutomation(prefs.monthlyAutomation))
      .catch(() => {/* use default false on error */})
      .finally(() => setIsLoading(false));
  }, []);

  async function toggle(value: boolean) {
    setIsSaving(true);
    setError(null);
    const previous = monthlyAutomation;
    setMonthlyAutomation(value); // optimistic update
    try {
      const updated = await usersApi.updateBudgetPreferences({ monthlyAutomation: value });
      setMonthlyAutomation(updated.monthlyAutomation);
    } catch (err) {
      setMonthlyAutomation(previous); // rollback
      setError(err instanceof ApiError ? err.message : 'Error al guardar preferencias');
    } finally {
      setIsSaving(false);
    }
  }

  return { monthlyAutomation, isLoading, isSaving, error, toggle };
}
