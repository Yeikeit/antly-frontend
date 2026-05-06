import { useState } from 'react';

export function useIncomeSourceForm(onSubmit: (s: { name: string; amount: number }) => void) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!name || !amount) {
      setError('Completa ambos campos');
      return;
    }
    setError('');
    onSubmit({ name, amount: Number(amount) });
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