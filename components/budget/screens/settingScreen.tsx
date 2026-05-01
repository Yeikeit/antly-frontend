import Link from 'next/link';
import { OptionCard } from '../OptionCard';


const options = [
  {
    title: 'Usar plantilla sugerida',
    description:
      'Comienza rapidamente con categorías predefinida. Ideal si eres nuevo en esto del presupuesto.',
    href: '/budget/new?method=template',
  },
  {
    title: 'Empezar de cero',
    description:
      'Crea tu propio lienzo en blanco. Define cada categoría y límite desde el principio. Perfecto si ya tienes un sistema claro.',
    href: '/budget/new?method=scratch',
  },
];

export function SettingBudgetScreen() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6">
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-8">
          

          <div className="text-center">
            <h1 className="text-2xl font-semibold text-slate-900">
              ¿Como quieres empezar?
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Elige el método que mejor se adapte a tu estilo. Puedes cambiar tu presupuesto en cualquier momento.
            </p>
          </div>
        </div>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {options.map((option) => (
            <OptionCard
              key={option.title}
              title={option.title}
              description={option.description}
              href={option.href}
            />
          ))}
        </section>

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            Volver
          </Link>
        </div>
      </div>
    </main>
  );
}
