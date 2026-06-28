'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getActiveBudget, getAllBudgets, reopenBudget, type ActiveBudget, type BudgetListItem } from '@/lib/api/budgets';
import { getBudgetPreferences, sendInvite } from '@/lib/api/users';
import Link from 'next/link';
import { useBudgetSummary } from "@/hooks/budget/useBudgetSummary";
import { BudgetChart } from "@/components/budget/BudgetChart";
import RecentTransactions from '@/components/transaction/RecentTransactions';
import { formatCLP } from "@/lib/utils/currency";
import Loader from '@/components/ui/Loader';


const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

type NoBudgetState = 'loading' | 'first-time' | 'manual-needed' | 'automation-pending' | 'reopen-available';

export default function DashboardPage() {
  const router = useRouter();
  const [budget, setBudget] = useState<ActiveBudget | null | undefined>(undefined);
  const [noBudgetState, setNoBudgetState] = useState<NoBudgetState>('loading');
  const [closedBudget, setClosedBudget] = useState<BudgetListItem | null>(null);
  const [reopening, setReopening] = useState(false);
  const [automationOn, setAutomationOn] = useState<boolean>(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteSending, setInviteSending] = useState(false);
  const [inviteSent, setInviteSent] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const { summary, loading: loadingSummary, error } = useBudgetSummary(budget?.id);

  useEffect(() => {
    getActiveBudget().then(async (b) => {
      const prefs = await getBudgetPreferences().catch(() => null);
      const automation = prefs?.budgetAutomation ?? true;
      setAutomationOn(automation);

      if (b) {
        setBudget(b);
        return;
      }
      const history = await getAllBudgets();
      if (history.length === 0) {
        router.replace('/settingBudget');
        return;
      }
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;
      const closedThisMonth = history.find(
        (bud) => bud.year === currentYear && bud.month === currentMonth && bud.status === 'CLOSED'
      ) ?? null;
      setBudget(null);
      if (closedThisMonth) {
        setClosedBudget(closedThisMonth);
        setNoBudgetState('reopen-available');
        return;
      }
      setNoBudgetState(automation ? 'automation-pending' : 'manual-needed');
    });
  }, [router]);

  async function handleReopen() {
    if (!closedBudget) return;
    setReopening(true);
    try {
      await reopenBudget(closedBudget.id);
      router.refresh();
      window.location.reload();
    } catch {
      setReopening(false);
    }
  }


  if (budget === undefined) {
    return <Loader fullPage />;
  }

  if (!budget) {
    return (
      <div className="max-w-4xl mx-auto flex items-center justify-center min-h-[60vh]">
        {noBudgetState === 'loading' && <Loader />}

        {noBudgetState === 'reopen-available' && (
          <div className="text-center bg-white rounded-2xl border border-slate-100 p-10 shadow-sm max-w-md w-full">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-500 text-2xl">
              🔓
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Presupuesto cerrado este mes</h2>
            <p className="text-sm text-slate-500 mb-6">
              Cerraste el presupuesto de {closedBudget && MONTHS[closedBudget.month - 1]} antes de que terminara el mes. Puedes reabrirlo para seguir registrando gastos.
            </p>
            <button
              type="button"
              onClick={handleReopen}
              disabled={reopening}
              className="inline-block rounded-xl bg-[#0E7C8B] px-6 py-3 text-sm font-semibold text-white hover:bg-teal-700 transition disabled:opacity-60"
            >
              {reopening ? 'Reabriendo…' : 'Reabrir presupuesto'}
            </button>
            <div className="mt-4">
              <Link href="/budget/new" className="text-sm font-medium text-slate-400 hover:text-slate-600">
                Crear uno nuevo de todas formas →
              </Link>
            </div>
          </div>
        )}

        {noBudgetState === 'automation-pending' && (
          <div className="text-center bg-white rounded-2xl border border-slate-100 p-10 shadow-sm max-w-md w-full">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-teal-50 text-[#0E7C8B] text-2xl">
              ⏳
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Sin presupuesto activo</h2>
            <p className="text-sm text-slate-500 mb-6">
              La automatización está activa. El sistema creará tu presupuesto al inicio del próximo mes copiando el anterior.
            </p>
            <Link
              href="/budget/new"
              className="inline-block text-sm font-medium text-[#0E7C8B] hover:underline"
            >
              Crear manualmente de todas formas →
            </Link>
          </div>
        )}

        {noBudgetState === 'manual-needed' && (
          <div className="text-center bg-white rounded-2xl border border-slate-100 p-10 shadow-sm max-w-md w-full">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-500 text-2xl">
              📋
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">No tienes un presupuesto activo</h2>
            <p className="text-sm text-slate-500 mb-6">
              La automatización está desactivada. Crea tu presupuesto manualmente para empezar a registrar tus gastos.
            </p>
            <Link
              href="/budget/new"
              className="inline-block rounded-xl bg-[#0E7C8B] px-6 py-3 text-sm font-semibold text-white hover:bg-teal-700 transition"
            >
              Crear presupuesto para este mes
            </Link>
          </div>
        )}
      </div>
    );
  }

  async function handleSendInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteEmail) return;
    setInviteSending(true);
    setInviteError("");
    try {
      await sendInvite(inviteEmail);
      setInviteSent(true);
    } catch {
      setInviteError("No se pudo enviar el correo. Intenta de nuevo.");
    } finally {
      setInviteSending(false);
    }
  }

  function closeInviteModal() {
    setShowInviteModal(false);
    setInviteEmail("");
    setInviteSent(false);
    setInviteError("");
  }

  const income = Number(budget.totalIncomeAmount);
  const allocated = Number(budget.totalAllocatedAmount);
  const spent = Number(summary?.totalSpent ?? 0);
  const remaining = allocated - spent;
  const showRemaining = allocated > 0 && allocated < income;

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-5 md:gap-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">Presupuesto activo</p>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900">
              {MONTHS[budget.month - 1]} {budget.year}
            </h1>
          </div>
          <span className="text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100 px-3 py-1 rounded-full">
            Activo
          </span>
        </div>

        {(() => {
          const showAllocated = allocated < income;
          const metrics = [
            { label: 'Ingresos', value: income, color: 'text-slate-800' },
            ...(showAllocated ? [{ label: 'Asignado', value: allocated, color: 'text-[#0E7C8B]' }] : []),
            ...(showAllocated ? [{ label: 'Sin asignar', value: income - allocated, color: 'text-amber-500' }] : []),
            { label: 'Restante por gastar', value: remaining, color: remaining >= 0 ? 'text-emerald-600' : 'text-red-600' },
          ];
          return (
            <div className={`grid gap-3 mb-6 ${metrics.length === 2 ? "grid-cols-2" : metrics.length === 3 ? "grid-cols-3" : "grid-cols-4"}`}>
              {metrics.map((m) => (
                <div key={m.label} className="bg-white rounded-2xl border border-slate-100 p-3 md:p-5 shadow-sm">
                  <p className="text-xs text-slate-400 mb-1">{m.label}</p>
                  <p className={`text-base md:text-xl font-bold ${m.color}`}>
                    ${formatCLP(m.value)}
                  </p>
                </div>
              ))}
            </div>
          );
        })()}

          <div className="flex flex-col md:flex-row gap-6 mb-6 items-stretch">
        <div className="flex-1">
          {loadingSummary ? (
            <Loader />
          ) : error ? (
            <div>Error al cargar el gráfico</div>
          ) : summary ? (
            <BudgetChart allocations={summary.allocations} />
          ) : null}
        </div>
        <div className="w-full md:w-80">
          <RecentTransactions />
        </div>
      </div>
      
        {!automationOn && (
          <div className="flex items-center justify-between rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-3 md:px-5 md:py-4 shadow-sm flex-wrap gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-800">Automatización desactivada</p>
              <p className="text-xs text-slate-500 mt-0.5">Crea el presupuesto del mes siguiente manualmente cuando estés listo.</p>
            </div>
            <Link
              href="/budget/new"
              className="ml-4 shrink-0 rounded-xl bg-[#0E7C8B] px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 transition"
            >
              + Nuevo presupuesto
            </Link>
          </div>
        )}

        <div className="rounded-2xl border border-[#c7edf1] bg-gradient-to-r from-[#f0fafb] to-teal-50 px-5 py-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-800">¿Estás disfrutando Antly?</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Si te está ayudando a ordenar tus finanzas, compártelo con alguien que también lo necesite.
                </p>
              </div>
              <button
                onClick={() => setShowInviteModal(true)}
                className="shrink-0 inline-flex items-center gap-2 bg-[#0E7C8B] hover:bg-[#0a6470] text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors"
              >
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M2 6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6Zm3.519 0L12 11.671 18.481 6H5.52ZM20 7.329l-7.341 5.527a1 1 0 0 1-1.318 0L4 7.329V18h16V7.329Z" />
                </svg>
                Invitar a un amigo
              </button>
            </div>
          </div>

        {/* Modal invitar amigo */}
        {showInviteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={closeInviteModal}>
            <div className="absolute inset-0 bg-slate-900/50" />
            <div
              className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={closeInviteModal} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M6.293 6.293a1 1 0 0 1 1.414 0L12 10.586l4.293-4.293a1 1 0 1 1 1.414 1.414L13.414 12l4.293 4.293a1 1 0 0 1-1.414 1.414L12 13.414l-4.293 4.293a1 1 0 0 1-1.414-1.414L10.586 12 6.293 7.707a1 1 0 0 1 0-1.414Z" />
                </svg>
              </button>

              {inviteSent ? (
                <div className="text-center py-4">
                  <div className="text-4xl mb-3">🎉</div>
                  <p className="text-base font-bold text-slate-800">¡Invitación enviada!</p>
                  <p className="text-sm text-slate-500 mt-1">Tu amigo recibirá un correo con todo lo que necesita saber sobre Antly.</p>
                  <button
                    onClick={closeInviteModal}
                    className="mt-5 w-full bg-[#0E7C8B] hover:bg-[#0a6470] text-white font-semibold py-2.5 rounded-xl text-sm transition-colors"
                  >
                    Cerrar
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-5">
                    <p className="text-lg font-bold text-slate-800 mb-1">Invitar a un amigo</p>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      Le enviaremos un correo en tu nombre contándole por qué debería unirse. Porque seamos honestos — la mayoría de la gente no sabe a dónde se va su plata, y tú sí. Comparte esa ventaja.
                    </p>
                  </div>

                  <form onSubmit={handleSendInvite} className="flex flex-col gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">Correo del amigo</label>
                      <input
                        type="email"
                        required
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        placeholder="nombre@ejemplo.com"
                        className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0E7C8B]/30 focus:border-[#0E7C8B] transition"
                      />
                    </div>

                    {inviteError && (
                      <p className="text-xs text-red-500">{inviteError}</p>
                    )}

                    <button
                      type="submit"
                      disabled={inviteSending}
                      className="w-full bg-[#0E7C8B] hover:bg-[#0a6470] text-white font-semibold py-2.5 rounded-xl text-sm transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                      {inviteSending ? (
                        <>
                          <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"/>
                          </svg>
                          Enviando…
                        </>
                      ) : "Enviar invitación"}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        )}
    </div>
  );
}
