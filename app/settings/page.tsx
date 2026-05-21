'use client';

import { useState } from 'react';
import { useAuthContext } from '@/store/auth-context';
import { useUpdateProfile } from '@/hooks/settings/useUpdateProfile';
import { useChangePassword } from '@/hooks/settings/useChangePassword';
import { useBudgetPreferences } from '@/hooks/settings/useBudgetPreferences';
import { useDeleteAccount } from '@/hooks/settings/useDeleteAccount';
import { FiUser, FiLock, FiSliders, FiAlertTriangle } from 'react-icons/fi';

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({
  icon,
  title,
  subtitle,
  children,
  danger,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8">
      <div className="flex items-start gap-4 mb-6">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
            danger ? 'bg-red-50 text-red-500' : 'bg-teal-50 text-[#0E7C8B]'
          }`}
        >
          {icon}
        </div>
        <div>
          <h2 className={`text-lg font-semibold ${danger ? 'text-red-600' : 'text-slate-900'}`}>
            {title}
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

// ─── Shared input ─────────────────────────────────────────────────────────────

function Field({
  label,
  id,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
}: {
  label: string;
  id: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: string;
}) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-[#0E7C8B] focus:ring-1 focus:ring-[#0E7C8B]"
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

// ─── Feedback banner ──────────────────────────────────────────────────────────

function Feedback({ message, type }: { message: string; type: 'success' | 'error' }) {
  return (
    <p
      className={`text-sm rounded-lg px-4 py-2 ${
        type === 'success'
          ? 'bg-teal-50 text-teal-700'
          : 'bg-red-50 text-red-600'
      }`}
    >
      {message}
    </p>
  );
}

// ─── Profile section ──────────────────────────────────────────────────────────

function ProfileSection() {
  const { user } = useAuthContext();
  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [fieldError, setFieldError] = useState<string | null>(null);

  const { updateProfile, isSubmitting, error, success } = useUpdateProfile();

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setFieldError(null);
    if (!firstName.trim()) {
      setFieldError('El nombre es obligatorio');
      return;
    }
    await updateProfile(firstName.trim(), lastName.trim(), user?.email ?? '');
  }

  return (
    <Section
      icon={<FiUser size={20} />}
      title="Información de perfil"
      subtitle="Actualiza tu nombre y apellido."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Nombre" id="firstName" value={firstName} onChange={setFirstName} placeholder="Tu nombre" />
          <Field label="Apellido" id="lastName" value={lastName} onChange={setLastName} placeholder="Tu apellido" />
        </div>
        <div className="space-y-1">
          <label htmlFor="email" className="block text-sm font-medium text-slate-700">
            Correo electrónico
          </label>
          <input
            id="email"
            type="email"
            value={user?.email ?? ''}
            disabled
            readOnly
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-400 cursor-not-allowed"
          />
          <p className="text-xs text-slate-400">El correo no puede modificarse.</p>
        </div>
        {fieldError && <Feedback message={fieldError} type="error" />}
        {error && <Feedback message={error} type="error" />}
        {success && <Feedback message="Perfil actualizado correctamente." type="success" />}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-xl bg-[#0E7C8B] text-white px-6 py-2.5 text-sm font-medium transition hover:bg-[#0a6470] disabled:opacity-60"
          >
            {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </Section>
  );
}

// ─── Security section ─────────────────────────────────────────────────────────

function SecuritySection() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);

  const { changePassword, isSubmitting, error, success } = useChangePassword();

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setFieldError(null);
    if (!currentPassword || !newPassword) {
      setFieldError('Completa todos los campos');
      return;
    }
    if (newPassword.length < 8) {
      setFieldError('La nueva contraseña debe tener al menos 8 caracteres');
      return;
    }
    if (newPassword !== confirmPassword) {
      setFieldError('Las contraseñas no coinciden');
      return;
    }
    const ok = await changePassword(currentPassword, newPassword);
    if (ok !== undefined || !error) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  }

  return (
    <Section
      icon={<FiLock size={20} />}
      title="Seguridad"
      subtitle="Actualiza tu contraseña para mantener tu cuenta segura."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field
          label="Contraseña actual"
          id="currentPassword"
          type="password"
          value={currentPassword}
          onChange={setCurrentPassword}
          placeholder="••••••••"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label="Nueva contraseña"
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={setNewPassword}
            placeholder="Mín. 8 caracteres"
          />
          <Field
            label="Confirmar nueva contraseña"
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            placeholder="Repite la contraseña"
          />
        </div>
        {fieldError && <Feedback message={fieldError} type="error" />}
        {error && <Feedback message={error} type="error" />}
        {success && <Feedback message="Contraseña actualizada correctamente." type="success" />}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-xl border border-[#0E7C8B] text-[#0E7C8B] px-6 py-2.5 text-sm font-medium transition hover:bg-teal-50 disabled:opacity-60"
          >
            {isSubmitting ? 'Actualizando...' : 'Actualizar contraseña'}
          </button>
        </div>
      </form>
    </Section>
  );
}

// ─── Budget preferences section ───────────────────────────────────────────────

function BudgetPreferencesSection() {
  const { monthlyAutomation, isLoading, isSaving, error, toggle } = useBudgetPreferences();

  return (
    <Section
      icon={<FiSliders size={20} />}
      title="Preferencias de presupuesto"
      subtitle="Configura cómo Antly gestiona tu ciclo mensual."
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-800">Automatización mensual</p>
          <p className="text-sm text-slate-500 mt-1">
            Crea y cierra automáticamente el presupuesto cada mes según tu historial de gastos.
          </p>
        </div>
        <button
          role="switch"
          aria-checked={monthlyAutomation}
          disabled={isLoading || isSaving}
          onClick={() => toggle(!monthlyAutomation)}
          className={`relative flex-shrink-0 w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#0E7C8B] focus:ring-offset-2 disabled:opacity-50 ${
            monthlyAutomation ? 'bg-[#0E7C8B]' : 'bg-slate-200'
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
              monthlyAutomation ? 'translate-x-6' : 'translate-x-0'
            }`}
          />
        </button>
      </div>
      {error && <Feedback message={error} type="error" />}
    </Section>
  );
}

// ─── Danger zone section ──────────────────────────────────────────────────────

function DangerZoneSection() {
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const { deleteAccount, isDeleting, error } = useDeleteAccount();

  const CONFIRM_WORD = 'ELIMINAR';

  function handleOpen() {
    setShowConfirm(true);
    setConfirmText('');
  }

  function handleCancel() {
    setShowConfirm(false);
    setConfirmText('');
  }

  async function handleDelete() {
    if (confirmText !== CONFIRM_WORD) return;
    await deleteAccount();
  }

  return (
    <Section
      icon={<FiAlertTriangle size={20} />}
      title="Zona de peligro"
      subtitle="Acciones irreversibles para tu cuenta."
      danger
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-800">Eliminar cuenta</p>
          <p className="text-sm text-slate-500 mt-1">
            Una vez eliminada, toda tu información financiera se borrará permanentemente.
          </p>
        </div>
        <button
          onClick={handleOpen}
          className="flex-shrink-0 rounded-xl bg-red-500 text-white px-5 py-2.5 text-sm font-medium transition hover:bg-red-600"
        >
          Eliminar cuenta
        </button>
      </div>

      {error && <Feedback message={error} type="error" />}

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-500 flex-shrink-0">
                <FiAlertTriangle size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">¿Eliminar tu cuenta?</h3>
                <p className="text-sm text-slate-500">Esta acción no se puede deshacer.</p>
              </div>
            </div>

            <p className="text-sm text-slate-600">
              Se eliminarán todos tus presupuestos, transacciones y datos personales.
              Para confirmar, escribe <span className="font-mono font-bold text-red-600">{CONFIRM_WORD}</span> en el campo de abajo.
            </p>

            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={CONFIRM_WORD}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-red-400 focus:ring-1 focus:ring-red-400 font-mono"
            />

            <div className="flex gap-3 justify-end pt-2">
              <button
                onClick={handleCancel}
                className="rounded-xl border border-slate-200 text-slate-700 px-5 py-2.5 text-sm font-medium transition hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={confirmText !== CONFIRM_WORD || isDeleting}
                className="rounded-xl bg-red-500 text-white px-5 py-2.5 text-sm font-medium transition hover:bg-red-600 disabled:opacity-50"
              >
                {isDeleting ? 'Eliminando...' : 'Confirmar eliminación'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  return (
    <div className="max-w-2xl mx-auto py-10 px-4 space-y-6">
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-slate-900">Configuración</h1>
        <p className="text-sm text-slate-500 mt-1">
          Gestiona tu perfil, seguridad y preferencias financieras.
        </p>
      </div>

      <ProfileSection />
      <SecuritySection />
      <BudgetPreferencesSection />
      <DangerZoneSection />
    </div>
  );
}
