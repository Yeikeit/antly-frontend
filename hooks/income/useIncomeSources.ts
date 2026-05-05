import { useState } from 'react';

export function useIncomeSources() {
  const [sources, setSources] = useState<{ name: string; amount: number }[]>([]);
  const [showForm, setShowForm] = useState(false);

  function addSource(source: { name: string; amount: number }) {
    setSources((prev) => [...prev, source]);
    setShowForm(false);
  }

  function removeSource(index: number) {
    setSources((prev) => prev.filter((_, i) => i !== index));
  }

  const total = sources.reduce((acc, curr) => acc + curr.amount, 0);

  return { sources, addSource, removeSource, total, showForm, setShowForm };
}