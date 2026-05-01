import Link from 'next/link';

type OptionCardProps = {
  title: string;
  description: string;
  href: string;
};

// Muestra una opcion del flujo inicial del presupuesto.
// Toda la card funciona como enlace a la siguiente pantalla.
export function OptionCard({ title, description, href }: OptionCardProps) {
  return (
    <Link
      href={href}
      className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
    >
      <div
        aria-hidden="true"
        className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700"
      >
        +
      </div>

      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
    </Link>
  );
}
