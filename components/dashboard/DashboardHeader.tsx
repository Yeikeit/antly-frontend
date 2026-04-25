'use client';

interface DashboardHeaderProps {
  user?: {
    firstName?: string;
    lastName?: string;
  };
  onLogout: () => void;
}

export function DashboardHeader({ user, onLogout }: DashboardHeaderProps) {
  return (
    <header className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-6 py-4 flex items-center justify-between">
      <span className="font-semibold text-zinc-900 dark:text-zinc-50">Antly</span>
      <div className="flex items-center gap-4">
        <span className="text-sm text-zinc-500 dark:text-zinc-400">
          {user?.firstName} {user?.lastName}
        </span>
        <button
          onClick={onLogout}
          className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
        >
          Cerrar sesión
        </button>
      </div>
    </header>
  );
}
