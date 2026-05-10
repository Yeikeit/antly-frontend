import Link from 'next/link';

const FEATURES = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
      </svg>
    ),
    title: 'Presupuesto mensual',
    desc: 'Define tus ingresos y distribuye cada peso por categoría antes de que el mes comience.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: 'Seguimiento real',
    desc: 'Registra transacciones al instante y mira en tiempo real cuánto llevas gastado vs. lo planeado.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Claridad total',
    desc: 'Un dashboard limpio que te muestra el disponible, el ejecutado y las categorías que más consumen.',
  },
];

const STEPS = [
  {
    n: '01',
    title: 'Crea tu presupuesto',
    desc: 'En minutos defines tus fuentes de ingreso y las categorías donde gastas tu dinero.',
  },
  {
    n: '02',
    title: 'Registra tus gastos',
    desc: 'Agrega cada transacción en el momento. Sin hojas de cálculo, sin complicaciones.',
  },
  {
    n: '03',
    title: 'Mantén el control',
    desc: 'El dashboard actualiza todo automáticamente. Sabes exactamente dónde estás parado.',
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans">


      <nav className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-lg font-bold tracking-tight text-[#0E7C8B]">Antly</span>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors px-3 py-1.5"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/register"
              className="text-sm font-semibold bg-[#0E7C8B] text-white px-4 py-1.5 rounded-lg hover:bg-[#0a6470] transition-colors"
            >
              Comenzar gratis
            </Link>
          </div>
        </div>
      </nav>


      <section className="pt-40 pb-28 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-[#0E7C8B] bg-[#0E7C8B]/10 px-3 py-1 rounded-full mb-6">
            Finanzas personales, sin excusas
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight text-slate-900 mb-6">
            Con Antly, sabes dónde va{' '}
            <span className="text-[#0E7C8B]">cada peso</span>{' '}
            antes de gastarlo
          </h1>
          <p className="text-lg sm:text-xl text-slate-500 max-w-xl mx-auto mb-10 leading-relaxed">
            te ayudamos a planificar tu presupuesto mensual, registrar tus gastos y
            mantener el control de tus finanzas — todo en un solo lugar.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/register"
              className="w-full sm:w-auto text-base font-semibold bg-[#0E7C8B] text-white px-8 py-3.5 rounded-xl hover:bg-[#0a6470] transition-colors shadow-sm"
            >
              Empezar ahora — es gratis
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto text-base font-medium text-slate-600 px-8 py-3.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors"
            >
              Ya tengo cuenta
            </Link>
          </div>
        </div>

        {/* Dashboard preview card */}
        <div className="mt-20 max-w-2xl mx-auto">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-sm text-left">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-xs text-slate-400 mb-0.5">Presupuesto</p>
                <p className="text-sm font-semibold text-slate-700">Mayo 2026</p>
              </div>
              <span className="text-xs bg-emerald-50 text-emerald-600 font-medium px-2.5 py-1 rounded-full border border-emerald-100">
                Activo
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-5">
              {[
                { label: 'Ingresos', value: '$4.200.000', color: 'text-slate-800' },
                { label: 'Asignado', value: '$3.800.000', color: 'text-[#0E7C8B]' },
                { label: 'Disponible', value: '$400.000', color: 'text-emerald-600' },
              ].map((item) => (
                <div key={item.label} className="bg-white rounded-xl p-3 border border-slate-100">
                  <p className="text-xs text-slate-400 mb-1">{item.label}</p>
                  <p className={`text-sm font-bold ${item.color}`}>{item.value}</p>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              {[
                { name: 'Vivienda', pct: 82, amount: '$1.230.000' },
                { name: 'Alimentación', pct: 55, amount: '$660.000' },
                { name: 'Transporte', pct: 34, amount: '$204.000' },
              ].map((cat) => (
                <div key={cat.name}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium text-slate-600">{cat.name}</span>
                    <span className="text-xs text-slate-400">{cat.amount}</span>
                  </div>
                  <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#0E7C8B] rounded-full"
                      style={{ width: `${cat.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-24 px-6 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">
              Todo lo que necesitas, nada que no uses
            </h2>
            <p className="text-slate-500 max-w-md mx-auto">
              Antly está diseñado para ser simple y directo. Sin funciones de relleno.
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-11 h-11 rounded-xl bg-[#0E7C8B]/10 text-[#0E7C8B] flex items-center justify-center mb-4">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-slate-800 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">
              En tres pasos ya tienes el control
            </h2>
          </div>
          <div className="relative space-y-10">
            {STEPS.map((s) => (
              <div key={s.n} className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[#0E7C8B] text-white flex items-center justify-center font-bold text-sm">
                  {s.n}
                </div>
                <div className="pt-1">
                  <h3 className="font-semibold text-slate-800 mb-1">{s.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="py-24 px-6 bg-[#0E7C8B]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Empieza a planificar tu próximo mes
          </h2>
          <p className="text-[#cceef1] mb-8 leading-relaxed">
            Crear tu primer presupuesto toma menos de 5 minutos. Gratis, sin tarjeta de crédito.
          </p>
          <Link
            href="/register"
            className="inline-block text-base font-semibold bg-white text-[#0E7C8B] px-10 py-4 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
          >
            Crear mi cuenta gratis
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-8 px-6 border-t border-slate-100 bg-white">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-400">
          <span className="font-semibold text-[#0E7C8B]">Antly</span>
          <span>© {new Date().getFullYear()} Antly. Todos los derechos reservados.</span>
          <div className="flex gap-4">
            <Link href="/login" className="hover:text-slate-600 transition-colors">Iniciar sesión</Link>
            <Link href="/register" className="hover:text-slate-600 transition-colors">Registrarse</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
