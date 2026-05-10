"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MonthYearPicker } from '@/components/ui/MonthYearPicker';
import { useBudgetFlow } from '@/store/BudgetFlowContext';
import { getDefaultCategories } from '@/lib/api/budgets';

export function SettingBudgetScreen() {
  const router = useRouter();
  const { month, year, setMonth, setYear, setCategories } = useBudgetFlow();
  const [loadingTemplate, setLoadingTemplate] = useState(false);

  async function handleUseTemplate() {
    setLoadingTemplate(true);
    try {
      const defaults = await getDefaultCategories();
      setCategories(defaults);
      router.push('/settingIncomes');
    } catch {
      // si falla, igualmente continuar vacío
      setCategories([]);
      router.push('/settingIncomes');
    } finally {
      setLoadingTemplate(false);
    }
  }

  function handleFromScratch() {
    setCategories([]);
    router.push('/settingIncomes');
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6">
      <div className="mx-auto w-full max-w-3xl">

        {/* Período del presupuesto */}
        <div className="mb-8 rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
          <p className="mb-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-400">
            ¿Para qué mes vas a crear tu presupuesto?
          </p>
          <MonthYearPicker
            month={month}
            year={year}
            onChange={(m, y) => { setMonth(m); setYear(y); }}
          />
        </div>

        {/* Método */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-slate-900">¿Cómo quieres empezar?</h1>
          <p className="mt-2 text-sm text-slate-600">
            Elige el método que mejor se adapte a tu estilo. Puedes ajustar todo antes de confirmar.
          </p>
        </div>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Plantilla */}
          <button
            type="button"
            onClick={handleUseTemplate}
            disabled={loadingTemplate}
            className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-[#0E7C8B] hover:shadow-md text-left disabled:opacity-60 disabled:cursor-wait"
          >
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#0E7C8B]/10 text-[#0E7C8B] text-sm font-bold">
              ✦
            </div>
            <h2 className="text-lg font-semibold text-slate-900">
              {loadingTemplate ? 'Cargando plantilla…' : 'Usar plantilla sugerida'}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Comienza rápidamente con categorías predefinidas: Vivienda, Alimentos, Transporte y Ahorro. Ideal si eres nuevo en el presupuesto.
            </p>
          </button>

          {/* Desde cero */}
          <button
            type="button"
            onClick={handleFromScratch}
            className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md text-left"
          >
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 text-sm font-bold">
              +
            </div>
            <h2 className="text-lg font-semibold text-slate-900">Empezar de cero</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Crea tu propio lienzo en blanco. Define cada categoría y límite desde el principio. Perfecto si ya tienes un sistema claro.
            </p>
          </button>
        </section>

        <div className="mt-8 text-center">
          <Link
            href="/dashboard"
            className="text-sm font-medium text-slate-500 hover:text-slate-900"
          >
            ← Volver al dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
