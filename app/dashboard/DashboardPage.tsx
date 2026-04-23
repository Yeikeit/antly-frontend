'use client';

import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardWelcome } from '@/components/dashboard/DashboardWelcomeMsg';
import { useAuth } from '@/hooks/auth/useAuth';

export default function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <DashboardHeader onLogout={logout} />
      <main className="p-8">
        <DashboardWelcome userName={user?.firstName} />
      </main>
    </div>
  );
}
