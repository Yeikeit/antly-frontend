'use client';

interface DashboardWelcomeProps {
  userName?: string;
}

export function DashboardWelcome({ userName }: DashboardWelcomeProps) {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
        ¡Bienvenido{userName ? `, ${userName}` : ''}!
      </h1>
      <p className="text-zinc-500 dark:text-zinc-400">
        El dashboard está en construcción.
      </p>
    </div>
  );
}
