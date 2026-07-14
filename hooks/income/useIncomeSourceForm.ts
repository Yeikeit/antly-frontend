import { useState } from 'react';

export function useIncomeSourceForm(onSubmit: (s: { name: string; amount: number }) => void) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!name.trim()) {
      setError('El nombre es obligatorio');
      return;
    }
    if (!amount || Number(amount) <= 0) {
      setError('El monto debe ser mayor a 0');
      return;
    }
    setError('');
    onSubmit({ name: name.trim(), amount: Number(amount) });
    setName('');
    setAmount('');
  }

  return {
    values: { name, amount },
    actions: {
      setName,    // ahora es (value: string) => void
      setAmount,  // ahora es (value: string) => void
      submit: handleSubmit,
    },
    state: { error },
  };
}